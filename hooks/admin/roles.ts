import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types/error";

export interface UserRoleItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "superuser" | "admin" | "subadmin" | "user";
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserRolesResponse {
  total_users: number;
  users: UserRoleItem[];
}

export const useGetAdminUsers = (
  roleFilter?: string,
  skip: number = 0,
  limit: number = 1000,
  search?: string
) => {
  return useQuery<UserRolesResponse>({
    queryKey: ["admin-roles-users", roleFilter, skip, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("skip", skip.toString());
      params.append("limit", limit.toString());
      if (roleFilter && roleFilter !== "all") {
        params.append("role_filter", roleFilter);
      }
      if (search && search.trim()) {
        params.append("search", search.trim());
      }
      const response = await axiosInstance.get(`/admin/roles/users?${params.toString()}`);
      return response.data;
    },
    retry: 1,
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await axiosInstance.patch(`/admin/roles/users/${userId}`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles-users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("User role updated successfully!");
    },
    onError: (error: ApiErrorResponse) => {
      toast.error("Failed to update user role", {
        description: error?.response?.data?.detail || error.message,
      });
    },
  });
};
