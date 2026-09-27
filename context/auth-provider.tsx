"use client";

import React, { useContext, createContext, useEffect, useState } from "react";
import useStorage from "@/utils/useStorage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


type AuthType = {
  setUpLogin: (data: { access_token: string; refresh_token: string }) => void | null;
  logOut: () => void;
  isAccess: string;
};

export const AuthContext = createContext<AuthType>({
  setUpLogin: () => null,
  logOut: () => null,
  isAccess: "",
});

export const useAuth = () => {
  return useContext(AuthContext);
};

const PROTECTED_ROUTES = [
  "/profile",
  "/portfolio",
  "/wallets/overview",
  "/wallets/deposit",
  "/wallets/withdrawal",
];

const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const { getItem, setItem, removeItem } = useStorage();
  const [isAccess, setIsAccess] = useState<string>("");

  useEffect(() => {
    const token = getItem("access_token") || "";
    setIsAccess(token);

    const isProtected = PROTECTED_ROUTES.some((route) =>
      window.location.pathname.startsWith(route),
    );

    if (!token && isProtected) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      toast.error("Kindly login to view this page.", {
        description: "You need to be logged in to access this section.",
        duration: 4000,
        id: "auth-error",
      });
      router.push("/login");
    }
  }, []);

  const logOut = () => {
    removeItem("access_token");
    removeItem("refresh_token");
    setIsAccess("");
    router.refresh();
  };

  const setUpLogin = (data: { access_token: string; refresh_token: string }) => {
    setItem("access_token", data?.access_token);
    setItem("refresh_token", data?.refresh_token);
    setIsAccess(data?.access_token || "");
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      const isProtected = PROTECTED_ROUTES.some((route) =>
        window.location.pathname.startsWith(route),
      );

      if (isProtected) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toast.error("Kindly login to view this page.", {
          description: "You need to be logged in to access this section.",
          duration: 4000,
          id: "auth-error",
        });
        router.push("/login");
      }
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, []);

  const value: AuthType = {
    setUpLogin,
    logOut,
    isAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
