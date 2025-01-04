import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getDB } from '../lib/db';
import type { User } from '../lib/db/schema';
import { supabase } from '../integrations/supabase/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
} | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        error: null,
        loading: false
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        user: null,
        error: action.payload,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        error: null,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const db = await getDB();
            const user = await db.get('users', session.user.id);
            if (user) {
              dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            } else {
              dispatch({ type: 'LOGIN_ERROR', payload: 'User not found in database' });
            }
          } catch (error) {
            console.error('Error fetching user:', error);
            dispatch({ type: 'LOGIN_ERROR', payload: 'Failed to fetch user data' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        let errorMessage = 'Invalid login credentials';
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address';
        }
        throw new Error(errorMessage);
      }

      if (!data.user) throw new Error('No user returned from auth');

      const db = await getDB();
      const dbUser = await db.get('users', data.user.id);
      
      if (!dbUser) throw new Error('User not found in database');

      dispatch({ type: 'LOGIN_SUCCESS', payload: dbUser });
      return dbUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}