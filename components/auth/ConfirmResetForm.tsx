"use client";

import { useConfirmResetAccountPassword } from "@/hooks/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  token: "string";
  new_password: "string";
  confirm_password: "string";
};

export function ConfirmResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const { mutate, isPending } = useConfirmResetAccountPassword();

  const onSubmit = (values: Inputs) => {
    if (values.new_password !== values.confirm_password) {
      toast("Uhh, something went wrong!", {
        description: "Password and Confirm Password do not match",
        action: {
          label: "Close",
          onClick: () => console.log("Undo"),
        },
      });
      return;
    } else {
      const payload = {
        new_password: values.new_password,
        code: values.token,
        email: email,
      };

      toast.promise(
        new Promise((resolve, reject) => {
          mutate(
            { ...payload },
            {
              onSuccess: async (response) => {
                router.push(`/login`);
                resolve(response);
              },
              onError: (error) => {
                reject(error);
              },
            },
          );
        }),
        {
          loading: "Submitting, please wait...",
        },
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glass Background Shapes */}
      <div className="absolute bg-black rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bg-black rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      {/* Glassmorphic Form */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-4xl font-bold mb-1 bg-white bg-clip-text text-transparent">
            Forecast by <span className="text-[#3399ff]">Anomaly</span>
          </h1>
          <p className="text-slate-300 text-sm">
            The Best Financial Prediction Markets
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Trade on outcomes in Forex, crypto, stocks, and more!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type="number"
                  {...register("token", {
                    required: "Token is required",
                  })}
                  placeholder="Enter Token Received"
                  className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />
                {errors.token && (
                  <span className="text-[12px] text-red-500">
                    {errors.token.message}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  {...register("new_password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.new_password && (
                <span className="text-[12px] text-red-500">
                  {errors.new_password.message}
                </span>
              )}
              {!errors.new_password && (
                <span className="text-[12px] text-[#6B7280]">
                  Must be at least 8 characters.
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  {...register("confirm_password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && (
                <span className="text-[12px] text-red-500">
                  {errors.confirm_password.message}
                </span>
              )}
              {!errors.confirm_password && (
                <span className="text-[12px] text-[#6B7280]">
                  Must be at least 8 characters.
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="my-4  w-full py-4 rounded-xl bg-black hover:to-blue-500 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Resetting password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
