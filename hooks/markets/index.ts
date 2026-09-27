import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types/error";

export const useGetMarkets = () => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/markets/`);
    return response?.data;
  };

  return useQuery({ queryKey: ["markets"], queryFn });
};

export async function getMarket(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/markets/${id}`);
  if (!res.ok) return null;
  return res.json();
}

// hooks/useGetMarket.ts — hook wraps the shared function
export function useGetMarket(id: string) {
  return useQuery({ queryKey: ["markets", id], queryFn: () => getMarket(id) });
}

// export const useGetMarket = (id: string) => {
//   const queryFn = async () => {
//     const response = await axiosInstance.get(`/markets/${id}`);
//     return response?.data;
//   };

//   return useQuery({ queryKey: ["markets", id], queryFn });
// };

export const useGetMarketActivities = (id: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/markets/${id}/activities`);
    return response?.data;
  };

  return useQuery({
    queryKey: ["markets", id, "activities"],
    queryFn,
    enabled: !!id,
    // refetchInterval: 10000
  });
};

export const useGetMarketOrders = (id: string, userId?: string) => {
  const queryFn = async () => {
    const response = await axiosInstance.get(`/markets/${id}/orders`, {
      params: userId ? { user_id: userId } : {},
    });
    return response?.data;
  };

  return useQuery({
    queryKey: ["markets", id, "orders", userId],
    queryFn,
    enabled: !!id && !!userId,
    // refetchInterval: 10000
  });
};

export const useSellMarketOrders = () => {
  const queryClient = useQueryClient();
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(`/orders/bulk_close`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      // Refresh wallet balance and transactions immediately for real-time updates
      queryClient.invalidateQueries({ queryKey: ["wallet-balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      toast.success("Quotes Sold Successful", {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
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