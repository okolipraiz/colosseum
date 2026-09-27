import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types/error";

export interface SystemSettingsData {
  referral_signup_bonus: number;
  static_referral_enabled: boolean;
  affiliate_fee_sharing_enabled: boolean;
  default_affiliate_fee_share_percentage: number;
}

export const useGetSystemSettings = () => {
  return useQuery<SystemSettingsData>({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await axiosInstance.get("/admin/settings");
      return response.data;
    },
    retry: 1,
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<SystemSettingsData>) => {
      const response = await axiosInstance.put("/admin/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("General settings updated successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error("Failed to update settings", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};
