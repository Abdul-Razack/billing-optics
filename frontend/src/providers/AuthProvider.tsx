import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: any;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, token: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null, token: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
export default AuthProvider;
