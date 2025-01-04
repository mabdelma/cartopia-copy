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
  logout: () => void;
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
            const user = await getDB.get('users', session.user.id);
            if (user) {
              dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            }
          } catch (error) {
            console.error('Error fetching user:', error);
            dispatch({ type: 'LOGIN_ERROR', payload: 'Failed to fetch user data' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!user) throw new Error('No user returned from auth');

      const dbUser = await getDB.get('users', user.id);
      dispatch({ type: 'LOGIN_SUCCESS', payload: dbUser });
      return dbUser;
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid credentials' });
      return null;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
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