"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { GetResendVerification } from "@/hooks/auth";
import { useVerifyAccount } from "@/hooks/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { VerifyInputType } from "@/types/auth";
import { ApiErrorResponse } from "@/types/error";

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { mutate, isPending } = useVerifyAccount();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(59);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyInputType>();

  const onSubmit = (data: VerifyInputType) => {
    const payload = {
      email: email,
      code: data.code,
    };
    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { ...payload },
          {
            onSuccess: async (response) => {
              toast.success("Verification Successful", {
                description: "Proceed to Login with your credentials",
                action: {
                  label: "Close",
                  onClick: () => console.log("Undo"),
                },
              });

              router.push("/login");
              resolve(response);
            },
            onError: (error) => reject(error),
          },
        );
      }),
      {
        loading: "Sumbitting, please wait...",
      },
    );
  };

  const handleSubmitResend = async () => {
    if (!resendDisabled) {
      try {
        await GetResendVerification(email);
        toast("OTP Resent, Kindly check your mail.", {
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          },
        });
      } catch (error: unknown) {
        console.error(error);

        const apiError = error as ApiErrorResponse;
        toast("Something went wrong... Try Again", {
          description: apiError?.response?.data?.message || apiError?.message,
          action: {
            label: "Close",
            onClick: () => console.log("Undo"),
          },
        });
      } finally {
        setResendDisabled(true);
        setCountdown(59);
      }
    }
  };

  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute bg-black rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bg-black rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img src="/logo-white.png" className="w-1/2" alt="Logo" />
          </div>
          {/* <h1 className="text-4xl font-bold mb-1 bg-white bg-clip-text text-transparent">
            Forecast by <span className="text-[#3399ff]">Anomaly</span>
          </h1> */}

          <div>
            <p className="text-slate-300 text-[12px]"># Verify your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Token
            </label>
            <div className="relative">
              <input
                id="code"
                type="number"
                {...register("code", {
                  required: "Code is required",
                })}
                placeholder="Enter Code Received"
                className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
              />
              {errors.code && (
                <span className="text-[12px] text-red-500">
                  {errors.code.message}
                </span>
              )}
            </div>
            <p className="text-sm mt-2">
              Didn`t receive the code,{" "}
              <span
                className="text-primary cursor-pointer"
                onClick={handleSubmitResend}
                style={{
                  cursor: resendDisabled ? "not-allowed" : "pointer",
                }}
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
              </span>
            </p>
          </div>

          <button
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-black hover:to-blue-500 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Verifying..." : " Verify Account"}
          </button>

          <div className="text-center space-y-2">
            <Link
              href="/signup"
              className="text-sm text-blue-300 hover:text-blue-400 transition block w-full"
            >
              Back to Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
