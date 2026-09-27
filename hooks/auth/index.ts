import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/utils/index";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/types/error";
import { useRouter } from "next/navigation";

export const useCreateAccount = () => {
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(`/auth/signup`, data);
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: (response) => {
      console.log(response, "success");
      toast.success("Registration Successful", {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
    onError: (error: ApiErrorResponse) => {
    
      toast.error("Something went wrong... Try Again", {
        description:
          error?.response?.data?.detail ||
          error?.response?.data?.email ||
          error.message,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const useLoginAccount = () => {
  const router = useRouter();
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(`/auth/token`, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    
    onSuccess: () => {
      toast.success("Login Successful", {
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
      router.refresh();
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

export const useVerifyAccount = () => {
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(`/auth/activation`, data);
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

export const useResetAccountPassword = () => {
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(
      `/auth/initiate_password_reset`,
      data,
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success("Reset Password Successful", {
        description: "OTP sent to the provided email and phone number.",
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

export const useConfirmResetAccountPassword = () => {
  const mutationFn = async (data: any) => {
    const response = await axiosInstance.post(
      `/auth/reset_password`,
      data,
    );
    return response.data;
  };

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success("Reset Password Successful", {
        description: "Kindly login with the new login details.",
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
    onError: (error: any) => {
      console.log("Error: ", error);

      let errorMessages = "";

      if (error?.response?.data) {
        const { new_password, token } = error.response.data;

        if (Array.isArray(new_password) && new_password.length > 0) {
          errorMessages += new_password.join(", ");
        }

        if (Array.isArray(token) && token.length > 0) {
          if (errorMessages.length > 0) errorMessages += " ";
          errorMessages += token.join(", ");
        }
      }

      // Fallback to general error message if no specific error fields are found
      if (!errorMessages && error.message) {
        errorMessages = error.message;
      }

      toast.error("Something went wrong... Try Again", {
        description: errorMessages,
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });

  return mutation;
};

export const GetResendVerification = async (email: string | null) => {
  try {
    const response = await axiosInstance.post(`/auth/resend_activation`, {
      email: email,
    });
    return response.data;
  } catch (error) {
    console.log(error)
    throw new Error("Failed to resend verification");
  }
};
