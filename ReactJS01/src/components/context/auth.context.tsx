import { createContext, useState } from "react";
import type { ReactNode } from "react";

// Define types
interface User {
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  appLoading: boolean;
  setAppLoading: (loading: boolean) => void;
}

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
  auth: {
    isAuthenticated: false,
    user: {
      email: "",
      name: "",
    },
  },
  setAuth: () => {},
  appLoading: true,
  setAppLoading: () => {},
});

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: {
      email: "",
      name: "",
    },
  });

  const [appLoading, setAppLoading] = useState<boolean>(true);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        appLoading,
        setAppLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
