import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";


export const useGetAdminWalletBalance = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(
      `/admin/balances/overview`,
    );
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-wallet-balance"], queryFn, retry: 1 });
};

export const useGetAdminWalletProfit = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(`/admin/balances/profit`);
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-wallet-profit"], queryFn, retry: 1 });
};

export const useGetAdminWalletBalanceFlow = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(`/admin/balances/flow`);
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-wallet-balance", "flow"], queryFn, retry: 1 });
};

export const useGetAdminWalletBalanceFlowTotal = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(
      `/admin/balances/flow/total`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["admin-wallet-balance", "flow", "total"],
    queryFn,
    retry: 1,
  });
};

export const useGetAdminLiveRate = (side: "buy" | "sell") => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/wallet/live-rate?side=${side}`);
    return response?.data;
  };

  return useQuery({
    queryKey: ["wallet", "live", side],
    queryFn,
    retry: 1,
    enabled: !!side,
  });
};

export const useGetAdminSystemTransactions = (skip = 0, limit = 100) => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(
      `/admin/balances/system-transactions?skip=${skip}&limit=${limit}`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["admin-system-transactions", skip, limit],
    queryFn,
    retry: 1,
  });
};

export const useGetAdminStaticBalance = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<any>(
      `/admin/balances/available-balance`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["admin-static-balance"],
    queryFn,
    retry: 1,
  });
};
