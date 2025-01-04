import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Shield, ChefHat, UserCircle, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { ErrorMessage } from '../ui/ErrorMessage';

export function StaffSignIn() {
  const navigate = useNavigate();
  const { login, state } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter both email and password');
      }

      const user = await login(email, password);
      if (user) {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (['kitchen', 'waiter', 'cashier'].includes(user.role)) {
          navigate('/staff');
        } else {
          throw new Error('Unauthorized role');
        }
      }
    } catch (error) {
      let message = 'Login failed';
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('email not confirmed')) {
          message = 'Please check your email and confirm your account before signing in';
          toast.error(message, {
            description: 'Check your inbox and spam folder for the confirmation email'
          });
        } else if (errorMessage.includes('invalid login credentials')) {
          message = 'Invalid email or password';
        } else if (errorMessage.includes('email logins are disabled')) {
          message = 'Email login is currently disabled';
          toast.error('Authentication Error', {
            description: 'Email authentication is not enabled in the system. Please contact an administrator.'
          });
        }
      }
      setFormError(message);
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Staff Sign In">
      <div className="flex justify-center space-x-12 mb-10">
        <div className="text-center">
          <div className="p-4 bg-purple-100 rounded-full inline-flex mb-2">
            <Shield className="w-7 h-7 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Admin</p>
        </div>
        <div className="text-center">
          <div className="p-4 bg-blue-100 rounded-full inline-flex mb-2">
            <ChefHat className="w-7 h-7 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Kitchen Staff</p>
        </div>
        <div className="text-center">
          <div className="p-4 bg-yellow-100 rounded-full inline-flex mb-2">
            <DollarSign className="w-7 h-7 text-yellow-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Cashier</p>
        </div>
        <div className="text-center">
          <div className="p-4 bg-green-100 rounded-full inline-flex mb-2">
            <UserCircle className="w-7 h-7 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-700">Waiter Staff</p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {(formError || state.error) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-red-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{formError || state.error}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || state.loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B4513] hover:bg-[#5C4033] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513] disabled:opacity-50"
          >
            {(isSubmitting || state.loading) ? <LoadingSpinner /> : 'Sign in'}
          </button>
        </div>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={() => navigate('/staff/signup')}
            className="font-medium text-[#8B4513] hover:text-[#5C4033]"
            disabled={isSubmitting}
          >
            New staff member? Sign up
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}