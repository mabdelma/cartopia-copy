export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order: number
          parent_id: string | null
          type: Database["public"]["Enums"]["category_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order: number
          parent_id?: string | null
          type: Database["public"]["Enums"]["category_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order?: number
          parent_id?: string | null
          type?: Database["public"]["Enums"]["category_type"]
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available: boolean | null
          created_at: string | null
          customizations: Json | null
          description: string | null
          id: string
          image: string | null
          main_category_id: string
          name: string
          price: number
          sub_category_id: string | null
        }
        Insert: {
          available?: boolean | null
          created_at?: string | null
          customizations?: Json | null
          description?: string | null
          id?: string
          image?: string | null
          main_category_id: string
          name: string
          price: number
          sub_category_id?: string | null
        }
        Update: {
          available?: boolean | null
          created_at?: string | null
          customizations?: Json | null
          description?: string | null
          id?: string
          image?: string | null
          main_category_id?: string
          name?: string
          price?: number
          sub_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_main_category_id_fkey"
            columns: ["main_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          customizations: Json | null
          id: string
          menu_item_id: string
          notes: string | null
          order_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          customizations?: Json | null
          id?: string
          menu_item_id: string
          notes?: string | null
          order_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          customizations?: Json | null
          id?: string
          menu_item_id?: string
          notes?: string | null
          order_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cashier_id: string | null
          completed_at: string | null
          created_at: string | null
          has_complaints: boolean | null
          id: string
          kitchen_staff_id: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["order_status"] | null
          table_id: string
          total: number
          updated_at: string | null
          waiter_staff_id: string | null
        }
        Insert: {
          cashier_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          has_complaints?: boolean | null
          id?: string
          kitchen_staff_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id: string
          total: number
          updated_at?: string | null
          waiter_staff_id?: string | null
        }
        Update: {
          cashier_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          has_complaints?: boolean | null
          id?: string
          kitchen_staff_id?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          table_id?: string
          total?: number
          updated_at?: string | null
          waiter_staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cashier_id_fkey"
            columns: ["cashier_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_kitchen_staff_id_fkey"
            columns: ["kitchen_staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_waiter_staff_id_fkey"
            columns: ["waiter_staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          splits: Json | null
          status: Database["public"]["Enums"]["payment_status"] | null
          tip: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          splits?: Json | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tip?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          splits?: Json | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          tip?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      tables: {
        Row: {
          capacity: number
          id: string
          number: number
          qr_code: string
          status: Database["public"]["Enums"]["table_status"] | null
        }
        Insert: {
          capacity: number
          id?: string
          number: number
          qr_code: string
          status?: Database["public"]["Enums"]["table_status"] | null
        }
        Update: {
          capacity?: number
          id?: string
          number?: number
          qr_code?: string
          status?: Database["public"]["Enums"]["table_status"] | null
        }
        Relationships: []
      }
      users: {
        Row: {
          bio: string | null
          email: string
          id: string
          joined_at: string | null
          last_active: string | null
          name: string
          phone_number: string | null
          profile_image: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          bio?: string | null
          email: string
          id?: string
          joined_at?: string | null
          last_active?: string | null
          name: string
          phone_number?: string | null
          profile_image?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          bio?: string | null
          email?: string
          id?: string
          joined_at?: string | null
          last_active?: string | null
          name?: string
          phone_number?: string | null
          profile_image?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_type: "main" | "sub"
      order_status: "pending" | "preparing" | "ready" | "delivered"
      payment_method: "card" | "wallet" | "crypto" | "cash"
      payment_status: "unpaid" | "partially" | "paid"
      table_status: "available" | "occupied" | "reserved"
      user_role: "customer" | "waiter" | "kitchen" | "admin" | "cashier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
