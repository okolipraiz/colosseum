import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import useStorage from "@/utils/useStorage";
import { UserAffiliateDashboard } from "@/types/auth";

export const useGetUserInfo = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/auth/me`);
    return response?.data;
  };

  return useQuery({ queryKey: ["user"], queryFn, retry: 1 });
};

export const useUpdateUserInfo = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (data: any) => {
    const response = await axiosInstance.patch(`/auth/me`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response: any) => {
      console.log(response, "success");
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
      toast.success("User Detail Updated Successfully", {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
    onError: (error: any) => {
      toast.error("Something went wrong... Try Again", {
        description: error?.response.data.detail || error.message,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const useGetLiveRate = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/wallet/live-rate`);
    return response?.data;
  };

  return useQuery({ queryKey: ["wallet", "live"], queryFn, retry: 1 });
};

export const useGetWalletBalance = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`wallet/`);
    return response?.data;
  };

  return useQuery({ queryKey: ["wallet-balance"], queryFn, retry: 1 });
};

export const useGetTransactions = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/wallet/transactions`);
    return response?.data;
  };

  return useQuery({
    queryKey: ["transactions"],
    queryFn,
    retry: 1,
  });
};

export const useGetTransactionStatus = (reference: string) => {
  const queryClient = useQueryClient();
  const { removeItem } = useStorage();

  return useQuery({
    queryKey: ["transaction-status", reference],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/wallet/transactions/${reference}/status`,
      );
      const data = response.data;

      // Handle side effects inside queryFn — fires only when data actually changes
      if (data?.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
        toast.success("Deposit Confirmed!", {
          description: "Your funds have been deposited to your registry.",
        });
        removeItem("transaction");
      }

      return data;
    },
    enabled: !!reference,
    retry: 1,
    // ✅ Stop polling automatically once completed
    refetchInterval: (query) =>
      query.state.data?.status === "completed" ||
      query.state.data?.status === "cancelled"
        ? false
        : 10000,
  });
};

export const useFundWallet = () => {
  const queryClient = useQueryClient();
  const mutationFn = async (data: {
    amount: number;
    source_currency?: string;
    target_currency?: string;
    pay_in_type?: string;
  }) => {
    const response = await axiosInstance.post(`wallet/fund`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      // Refresh wallet balance immediately for real-time updates
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: any) => {
      toast.error("Failed to initiate funding", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });

  return mutation;
};

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      account_name: string;
      account_number: string;
      bank_name: string;
      bank_code: string;
    }) => {
      const response = await axiosInstance.post("/wallet/recipients", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
      toast.success("Bank account added successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to add bank account", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useGetRecipients = () => {
  return useQuery({
    queryKey: ["recipients"],
    queryFn: async () => {
      const response = await axiosInstance.get("/wallet/recipients");
      return response.data;
    },
    retry: 1,
  });
};

export const useGetBanks = () => {
  return useQuery({
    queryKey: ["banks"],
    queryFn: async () => {
      const response = await axiosInstance.get("/wallet/banks");
      return response.data;
    },
    staleTime: Infinity,
  });
};

export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      busha_recipient_id: string;
      amount: number;
      withdrawal_type?: string;
      network?: string;
      address?: string;
      currency?: string;
    }) => {
      const response = await axiosInstance.post("/wallet/withdraw", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Withdrawal initiated", {
        description: "Your withdrawal is being processed.",
      });
    },
    onError: (error: any) => {
      toast.error("Withdrawal failed", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useWithdrawFundsCrypto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      network: string;
      address: string;
      currency: string;
      memo?: string;
    }) => {
      const response = await axiosInstance.post("/wallet/withdraw/crypto", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Withdrawal initiated", {
        description: "Your withdrawal is being processed.",
      });
    },
    onError: (error: any) => {
      toast.error("Withdrawal failed", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useWithdrawNOWPayments = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      currency?: string;
      address?: string;
    }) => {
      const response = await axiosInstance.post("/npayments/withdraw", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Crypto withdrawal initiated", {
        description: "Your withdrawal is being processed.",
      });
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      // Extract the inner Busha error message
      const extractedMessage =
        rawMessage?.match(/"message":"([^"]+)"/)?.[1] || rawMessage;

      toast.error("Failed to initiate withdrawal", {
        description: extractedMessage,
      });
    },
  });
};

export const useFundWalletCrypto = () => {
  const queryClient = useQueryClient();
  const mutationFn = async (data: {
    amount: number;
    source_currency?: string;
    target_currency?: string;
    pay_in_type?: string;
    network?: string;
  }) => {
    const response = await axiosInstance.post(`wallet/fund`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      // Refresh wallet balance immediately for real-time updates
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      // Extract the inner Busha error message
      const extractedMessage =
        rawMessage?.match(/"message":"([^"]+)"/)?.[1] || rawMessage;

      toast.error("Failed to initiate crypto funding", {
        description: extractedMessage,
      });
    },
  });

  return mutation;
};

export const useFundWalletNOWPayments = () => {
  const queryClient = useQueryClient();
  const mutationFn = async (data: {
    amount: number;
    source_currency?: string;
    target_currency?: string;
    pay_in_type?: string;
    network?: string;
  }) => {
    const response = await axiosInstance.post(`/npayments/deposit`, {
      price_amount: data.amount,
      pay_currency: data.source_currency?.toLowerCase(),
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      // Refresh wallet balance immediately for real-time updates
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      // Extract the inner Busha error message
      const extractedMessage =
        rawMessage?.match(/"message":"([^"]+)"/)?.[1] || rawMessage;

      toast.error("Failed to initiate crypto funding", {
        description: extractedMessage,
      });
    },
  });

  return mutation;
};

export const useFundWalletNgn = () => {
  const queryClient = useQueryClient();
  const mutationFn = async (data: {
    amount: number;
    source_currency?: string;
    target_currency?: string;
    pay_in_type?: string;
  }) => {
    const response = await axiosInstance.post(`wallet/fund/ngn`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message;

      // Extract the inner Busha error message
      const extractedMessage =
        rawMessage?.match(/"message":"([^"]+)"/)?.[1] || rawMessage;

      toast.error("Failed to initiate crypto funding", {
        description: extractedMessage,
      });
    },
  });

  return mutation;
};

export const useWithdrawAffiliate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await axiosInstance.post(
        "/wallet/affiliate/withdraw",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["affiliate-dashboard"] });
      toast.success("Affiliate Withdrawal Requested", {
        description:
          "Your request has been submitted to the admin for vetting.",
      });
    },
    onError: (error: any) => {
      toast.error("Withdrawal Request Failed", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useGetAffiliateDashboard = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<UserAffiliateDashboard>(
      `/wallet/affiliate/dashboard`
    );
    return response?.data;
  };

  return useQuery({ queryKey: ["affiliate-dashboard"], queryFn, retry: 1 });
};

export const useGetPayoutDetails = (marketId: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(
      `/orders/payout/${marketId}/details`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["payout-details", marketId],
    queryFn,
    enabled: !!marketId,
    retry: 1,
  });
};

export const useGetPayoutDetailsByTx = (transactionId: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(
      `/orders/payout/transaction/${transactionId}/details`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["payout-details-by-tx", transactionId],
    queryFn,
    enabled: !!transactionId,
    retry: 1,
  });
};

export const useGetPortfolioStats = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get("/orders/portfolio/stats");
    return response?.data;
  };

  return useQuery({
    queryKey: ["portfolio-stats"],
    queryFn,
    retry: 1,
  });
};

export const useGetNotifications = (limit: number = 20, offset: number = 0, enabled: boolean = true) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/markets/notifications?limit=${limit}&offset=${offset}`);
    return response?.data;
  };

  return useQuery({
    queryKey: ["notifications", limit, offset],
    queryFn,
    enabled,
    refetchInterval: 15000, // Poll every 15s for new notifications
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await axiosInstance.patch(`/markets/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch(`/markets/notifications/read-all`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
