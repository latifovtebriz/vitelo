import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateCredits: (newCredits: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load initial state from localStorage
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  let initialUser = null;
  if (storedUser) {
    try {
      initialUser = JSON.parse(storedUser);
    } catch {
      // Ignore parse error
    }
  }

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    },
    updateCredits: (credits) => {
      set((state) => {
        if (!state.user) return state;
        const updatedUser = { ...state.user, credits };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
    },
  };
});
