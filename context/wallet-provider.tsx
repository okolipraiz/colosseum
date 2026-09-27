"use client";

import React, { useContext, createContext, useEffect } from "react";
import { useGetTransactions, useGetTransactionStatus } from "@/hooks/user";
import useStorage from "@/utils/useStorage";

type WalletType = {
  statusCheck: any;
  transactions: any[];
  refetchTransactions: () => void;
};

export const WalletContext = createContext<WalletType>({
  statusCheck: null,
  transactions: [],
  refetchTransactions: () => {},
});

export const useWallet = () => {
  return useContext(WalletContext);
};

const WalletProvider = ({ children }: React.PropsWithChildren) => {
  const { setItem, getItem, removeItem } = useStorage();
  const { data: transactions, refetch: refetchTransactions } =
    useGetTransactions();

  const pendingReference =
    transactions?.[0]?.status === "pending"
      ? transactions?.[0]?.external_reference ?? ""
      : "";

  // Persisting the pending deposit reference is a side effect, so it belongs in
  // an effect rather than the render body. The render body runs on every render
  // of every route, and it is also executed on the server (where it is a no-op).
  useEffect(() => {
    if (pendingReference) {
      setItem("transaction", pendingReference);
    } else {
      removeItem("transaction");
    }
  }, [pendingReference, setItem, removeItem]);

  const statusCheck = useGetTransactionStatus(getItem("transaction"));

  const value: WalletType = {
    statusCheck,
    transactions: transactions || [],
    refetchTransactions,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

export default WalletProvider;
