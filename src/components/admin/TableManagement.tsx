import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import type { Table, Order } from '../../lib/db/schema';
import { getDB } from '../../lib/db';
import { QRCodeModal } from './QRCodeModal';
import { generateQRCode } from '../../lib/utils/qrcode';
import { TableEfficiencyStats } from './table/TableEfficiencyStats';
import { TableFilters } from './table/TableFilters';
import { TableList } from './table/TableList';
import { TableForm } from './table/TableForm';
import { DeleteTableDialog } from './table/DeleteTableDialog';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useToast } from '../../hooks/use-toast';

export function TableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({});
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [viewingQRCode, setViewingQRCode] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [efficiency, setEfficiency] = useState({
    averageTurnoverTime: 0,
    occupancyRate: 0,
    totalTurnovers: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 60000);
    return () => clearInterval(interval);
  }, []);

  async function loadTables() {
    setLoading(true);
    try {
      const db = await getDB();
      const [allTables, allOrders] = await Promise.all([
        db.getAll('tables'),
        db.getAll('orders')
      ]);

      const activeOrdersMap = allOrders.reduce((acc, order) => {
        if (order.status !== 'delivered' && order.status !== 'paid') {
          acc[order.tableId] = order;
        }
        return acc;
      }, {} as Record<string, Order>);

      const completedOrders = allOrders.filter(o => o.status === 'paid');
      const turnoverTimes = completedOrders.map(order => {
        const start = new Date(order.createdAt).getTime();
        const end = new Date(order.updatedAt).getTime();
        return (end - start) / 60000;
      });

      const avgTurnover = turnoverTimes.length > 0
        ? turnoverTimes.reduce((sum, time) => sum + time, 0) / turnoverTimes.length
        : 0;

      const occupiedTables = allTables.filter(t => t.status === 'occupied').length;
      const occupancyRate = allTables.length > 0 ? occupiedTables / allTables.length : 0;

      setTables(allTables.sort((a, b) => a.number - b.number));
      setActiveOrders(activeOrdersMap);
      setEfficiency({
        averageTurnoverTime: avgTurnover,
        occupancyRate,
        totalTurnovers: completedOrders.length
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load tables:', err);
      setError('Failed to load table data. Please try again later.');
      toast({
        variant: "destructive",
        title: "Error loading tables",
        description: "Please check your connection and try again."
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveTable(table: Table) {
    try {
      const db = await getDB();
      const isNew = !table.qrCode;
      
      table.number = Math.max(1, Math.floor(Number(table.number)));
      table.capacity = Math.max(1, Math.floor(Number(table.capacity)));
      
      if (isNew || (
        !isNew && 
        tables.find(t => t.id === table.id)?.number !== table.number
      )) {
        table.qrCode = await generateQRCode(`table/${table.id}`);
      }
      
      await db.put('tables', table);
      setEditingTable(null);
      loadTables();
      toast({
        title: isNew ? "Table created" : "Table updated",
        description: `Table ${table.number} has been ${isNew ? 'created' : 'updated'} successfully.`
      });
    } catch (error) {
      console.error('Failed to save table:', error);
      toast({
        variant: "destructive",
        title: "Error saving table",
        description: "Please check your connection and try again."
      });
    }
  }

  async function handleDeleteTable(table: Table) {
    try {
      const db = await getDB();
      
      const orders = await db.getAll('orders');
      const activeOrders = orders.filter(
        order => order.tableId === table.id && 
        !['delivered', 'paid'].includes(order.status)
      );
      
      if (activeOrders.length > 0) {
        throw new Error('Cannot delete table with active orders');
      }
      
      await db.delete('tables', table.id);
      setDeletingTable(null);
      loadTables();
      toast({
        title: "Table deleted",
        description: `Table ${table.number} has been deleted successfully.`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete table';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error deleting table",
        description: message
      });
    }
  }

  const filteredTables = tables
    .filter(table => {
      if (statusFilter && table.status !== statusFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          table.number.toString().includes(query) ||
          table.status.toLowerCase().includes(query)
        );
      }
      return true;
    });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
          <p className="text-sm text-gray-500">Monitor and manage restaurant tables</p>
        </div>
        <button
          onClick={() => setEditingTable({
            id: crypto.randomUUID(),
            number: tables.length + 1,
            capacity: 4,
            status: 'available',
            qrCode: '',
          })}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Table
        </button>
      </div>

      <TableEfficiencyStats
        tables={tables}
        averageTurnoverTime={efficiency.averageTurnoverTime}
        occupancyRate={efficiency.occupancyRate}
        totalTurnovers={efficiency.totalTurnovers}
      />

      <TableFilters
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      <TableList
        tables={filteredTables}
        activeOrders={activeOrders}
        onViewQR={setViewingQRCode}
        onEditTable={setEditingTable}
        onDeleteTable={setDeletingTable}
        onStatusChange={async (tableId, status) => {
          const table = tables.find(t => t.id === tableId);
          if (table) {
            await saveTable({ ...table, status });
          }
        }}
      />

      {editingTable && (
        <TableForm
          table={editingTable}
          onSave={saveTable}
          onCancel={() => setEditingTable(null)}
        />
      )}
      
      {viewingQRCode && (
        <QRCodeModal
          table={viewingQRCode}
          onClose={() => setViewingQRCode(null)}
        />
      )}
      
      {deletingTable && (
        <DeleteTableDialog
          table={deletingTable}
          onConfirm={handleDeleteTable}
          onCancel={() => setDeletingTable(null)}
        />
      )}
    </div>
  );
}