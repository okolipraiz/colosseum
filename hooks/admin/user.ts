import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GetUsersResponse, ReferralsResponse, AuditLogsResponse, AffiliateWithdrawalRequest } from "@/types/admin";

export const useGetAllUsers = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<GetUsersResponse>(`/admin/users/forecast/list?limit=1000`);
    return response?.data;
  };

  return useQuery({ queryKey: ["all-users"], queryFn, retry: 1 });
};

export const useAdminGetUserPortfolio = (userId: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(
      `/admin/orders/portfolio/stats/${userId}`,
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["portfolio-stats", userId],
    queryFn,
    retry: 1,
    enabled: !!userId,
  });
};

export const useGetReferrals = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<ReferralsResponse>(`/admin/referrals`);
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-referrals"], queryFn, retry: 1 });
};

export const useGetAuditLogs = (skip = 0, limit = 100) => {
  const queryFn = async () => {
    const response = await axiosInstance.get<AuditLogsResponse>(
      `/admin/audit-logs?skip=${skip}&limit=${limit}`
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["admin-audit-logs", skip, limit],
    queryFn,
    retry: 1,
  });
};

export const useGetAffiliateWithdrawals = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get<AffiliateWithdrawalRequest[]>(
      `/wallet/admin/affiliate/withdrawals`
    );
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-affiliate-withdrawals"], queryFn, retry: 1 });
};

export const useApproveAffiliateWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.post(
        `/wallet/admin/affiliate/withdrawals/${requestId}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast.success("Affiliate withdrawal approved successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to approve withdrawal", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useRejectAffiliateWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await axiosInstance.post(
        `/wallet/admin/affiliate/withdrawals/${requestId}/reject`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast.success("Affiliate withdrawal rejected successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to reject withdrawal", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};

export const useAdminGetUserAffiliateConfig = (userId: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(
      `/admin/users/${userId}/affiliate-config`
    );
    return response?.data;
  };

  return useQuery({
    queryKey: ["admin-user-affiliate-config", userId],
    queryFn,
    retry: 1,
    enabled: !!userId,
  });
};

export const useAdminUpdateUserAffiliateConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        custom_referral_signup_bonus?: number | null;
        custom_affiliate_fee_share_percentage?: number | null;
        static_referral_enabled?: boolean;
        dynamic_referral_enabled?: boolean;
      };
    }) => {
      const response = await axiosInstance.put(
        `/admin/users/${userId}/affiliate-config`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-user-affiliate-config", variables.userId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
      toast.success("User affiliate configuration updated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to update affiliate configuration", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};
