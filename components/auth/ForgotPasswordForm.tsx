"use client";
import { useResetAccountPassword } from "@/hooks/auth";
import { ForgotPasswordTypes } from "@/types/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordTypes>();
  const router = useRouter();

  const { mutate, isPending } = useResetAccountPassword();

  const onSubmit = (data: ForgotPasswordTypes) => {
    mutate(data, {
      onSuccess: () => {
        router.push("/confirm-reset?email=" + data.email);
      },
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute bg-black rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bg-black rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img src="/logo-white.png" className="w-1/2" alt="Logo" />
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Trade on outcomes in Forex, crypto, stocks, and more!
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="your@example.com"
                className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
              />
            </div>
            {errors.email && (
              <span className="text-[14px] text-red-600">
                {errors.email.message}
              </span>
            )}
          </div>

          <button
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-black hover:to-blue-500 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Loading..." : "Forgot Password"}
          </button>

          <div className="text-center space-y-2">
            <Link
              href="/login"
              className="text-sm text-blue-300 hover:text-blue-400 transition block w-full"
            >
              Back to Sign In
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
