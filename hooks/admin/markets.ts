import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types/error";
import { useRouter } from "next/navigation";

export const useAdminCreateMarkets = (marketType: string) => {
  const config = {
    headers: {
      token: `I Love Brian`,
      "Content-Type": "application/json",
    },
  };

  const mutationFn = async (data: any) => {
    if (marketType === "multi-outcome") {
      // Handle multi-outcome market creation logic
      const response = await axiosInstance.post(
        `/markets/multi-outcome`,
        data,
        config,
      );
      return response.data;
    } else {
      const response = await axiosInstance.post(`/markets/`, data, config);
      return response.data;
    }
  };

  const mutation = useMutation({
    mutationFn,
    onError: (error: ApiErrorResponse) => {
      console.log("Error: ", error);
      toast.error("Something went wrong... Try Again", {
        description: error?.response?.data?.detail || error.message,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const useAdminResolveMarkets = (id: string) => {
  const config = {
    headers: {
      token: `I Love Brian`,
      "Content-Type": "application/json",
    },
  };

  const mutationFn = async (data: any) => {
    // Handle multi-outcome market creation logic
    const response = await axiosInstance.patch(
      `/markets/${id}/resolve`,
      data,
      config,
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onError: (error: ApiErrorResponse) => {
      console.log("Error: ", error);
      toast.error("Something went wrong... Try Again", {
        description: error?.response?.data?.detail || error.message,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const useAdminDeleteMarket = (id: string) => {
  const config = {
    headers: {
      token: `I Love Brian`,
      "Content-Type": "application/json",
    },
  };

  const mutationFn = async () => {
    const response = await axiosInstance.delete(
      `/markets/${id}`,
      config,
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onError: (error: ApiErrorResponse) => {
      console.log("Error: ", error);
      toast.error("Something went wrong... Try Again", {
        description: error?.response?.data?.detail || error.message,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const useGetPendingMarkets = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/admin/markets/pending`);
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-pending-markets"], queryFn });
};

export const useGetAllMarketsAdmin = (status?: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/admin/markets/all`, {
      params: status ? { status } : {},
    });
    return response?.data;
  };

  return useQuery({ queryKey: ["admin-all-markets", status], queryFn });
};

export const useVerifyMarket = () => {
  const queryClient = useQueryClient();

  const mutationFn = async ({ marketId, action, reason }: { marketId: string; action: "approve" | "reject"; reason?: string }) => {
    const response = await axiosInstance.patch(`/admin/markets/${marketId}/verify`, {
      action,
      reason,
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-markets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      toast.success(
        variables.action === "approve"
          ? "Market verified & approved successfully!"
          : "Market rejected."
      );
    },
    onError: (error: ApiErrorResponse) => {
      console.log("Error: ", error);
      toast.error("Verification update failed", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });

  return mutation;
};
