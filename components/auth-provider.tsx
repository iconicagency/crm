"use client";

import { createContext, useContext, useState } from "react";

interface AppUser {
  uid: string;
  email: string | null;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<AppUser | null>({
    uid: "demo-admin",
    email: "thanhnt.ads@gmail.com",
    name: "Tân Gia Huy",
    role: "admin"
  });
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
