import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useStorage from "@/utils/useStorage";

export const useGetLeaderBoard = (params: { category?: string; period?: string }) => {
  const queryFn = async () => {
      const response = await axiosInstance.get(`/leaderboard/`, {
        params
      });
    return response?.data;
  };

  return useQuery({ queryKey: ["leaderboard", params], queryFn, retry: 1 });
};
