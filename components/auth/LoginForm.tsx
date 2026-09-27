"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SignInInputsTypes } from "@/types/auth";
import { useForm } from "react-hook-form";
import { useLoginAccount } from "@/hooks/auth";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
import { useSearchParams, useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { setUpLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInputsTypes>();
  const { mutate, isPending } = useLoginAccount();

  const onSubmit = (values: SignInInputsTypes) => {
    const payload = {
      username: values.email.toLowerCase().trim(),
      password: values.password,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { ...payload },
          {
            onSuccess: async (response) => {
              if (response.is_verified) {
                setUpLogin({
                  access_token: response.access_token,
                  refresh_token: response.refresh_token,
                });

                router.push(next || "/markets");
                router.refresh();
              }
              resolve(response);
            },
            onError: (error) => {
              console.log(error, "error");
              if (
                error?.status === 403 &&
                error?.response?.data?.detail === "Email verification required"
              ) {
                router.push(
                  `/verify?email=${values.email.toLowerCase().trim()}`,
                );
              }
              reject(error);
            },
          },
        );
      }),
      {
        loading: "Submitting, please wait...",
      },
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glass Background Shapes */}
      <div className="absolute bg-black rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bg-black rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      {/* Glassmorphic Form */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img src="/logo-white.png" className="w-1/2" alt="Logo" />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Trade on outcomes in Forex, crypto, stocks, and more!
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                  })}
                  placeholder="your@example.com"
                  className={`w-full bg-white/10 border light:bg-[#4f4f4f4] border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />
              </div>
              {errors.email && (
                <span className="text-[12px] text-red-500">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`w-full bg-white/10 border light:bg-[#4f4f4f4] border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="text-[12px] text-red-500">
                  {errors.password.message}
                </span>
              )}
              {!errors.password && (
                <span className="text-[12px] text-[#6B7280]">
                  Must be at least 8 characters.
                </span>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-blue-300 hover:text-blue-400 transition"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="my-4  w-full py-4 rounded-xl bg-black hover:to-blue-500 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Logging in..." : "Sign in"}
          </button>

          <div className="text-center space-y-2">
            <Link
              href="/signup"
              className="text-sm text-blue-300 hover:text-blue-400 transition block w-full"
            >
              Proceed to Sign Up
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/tos" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
