"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { countries } from "@/data/country";
import { SignUpInputsTypes } from "@/types/auth";
import { useCreateAccount } from "@/hooks/auth";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpInputsTypes>();
  const { mutate, isPending } = useCreateAccount();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref") || params.get("code");
      if (ref) {
        setValue("referral_code", ref);
      }
    }
  }, [setValue]);

  const onSubmit = (values: SignUpInputsTypes) => {
    if(values.password.length < 8) {
      toast.error("Uhh, something went wrong!", {
        description: "Password must be at least 8 characters long",
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
      return;
    }
    if (values.password !== values.confirmPassword) {
      toast.error("Uhh, something went wrong!", {
        description: "Password and Confirm Password do not match",
        action: {
          label: "Close",
          onClick: () => console.log("Close"),
        },
      });
      return;
    }

    const payload = {
      email: values.email.toLowerCase().trim(),
      password: values.password,
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      address: values.address,
      country: values.country,
      confirmPassword: values.confirmPassword,
      referral_code: values.referral_code?.trim() || undefined,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(
          { ...payload },
          {
            onSuccess: async (response: any) => {
              if (response?.active) {
                toast.success("Account created successfully!");
                router.push("/login");
              } else {
                router.push(`/verify?email=${values.email}`);
              }
              resolve(response);
            },
            onError: (error) => {
              reject(error);
            },
          },
        );
      }),
      {
        loading: "Sumbitting, please wait...",
      },
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden py-5">
      {/* Glass Background Shapes */}
      <div className="absolute bg-black rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bg-black rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      {/* Glassmorphic Form */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-white/10 light:bg-[#4f4f4f4] border border-white/20 backdrop-blur-md shadow-lg text-white">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img src="/logo-white.png" className="w-1/2" alt="Logo" />
          </div>
          <p className="text-slate-300 text-sm">
            The Best Financial Prediction Markets
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-3">
            <div className="w-full">
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <input
                  id="first_name"
                  type="first_name"
                  placeholder="First Name"
                  {...register("first_name", {
                    required: "First Name is required",
                  })}
                  className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />
              </div>
              {errors.first_name && (
                <span className="text-[12px] text-red-500">
                  {errors.first_name.message}
                </span>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Last Name
              </label>
              <div className="relative">
                <input
                  id="last_name"
                  type="text"
                  {...register("last_name", {
                    required: "Last Name is required",
                  })}
                  placeholder="Last Name"
                  className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />
              </div>
              {errors.last_name && (
                <span className="text-[12px] text-red-500">
                  {errors.last_name.message}
                </span>
              )}
            </div>
          </div>

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
                className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
              />
            </div>
            {errors.email && (
              <span className="text-[12px] text-red-500">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                  {...register("confirmPassword", {
                    required: "Password is required",
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone_number"
                type="tel"
                {...register("phone_number", {
                  required: "Phone number is required",
                })}
                placeholder="Enter Number"
                className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
              />
            </div>
            {errors.phone_number && (
              <span className="text-[12px] text-red-500">
                {errors.phone_number.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Address
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  {...register("address", {
                    required: "Address is required",
                  })}
                  placeholder="Enter your home address"
                  className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                />
              </div>
              {errors.address && (
                <span className="text-[12px] text-red-500">
                  {errors.address.message}
                </span>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="country"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Country
              </label>
              <select
                //   {...form.register("country")}
                className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                id="country"
                required
                {...register("country", {
                  required: "Country is required",
                })}
              >
                <option value="" className="bg-slate-900 text-white">Select Your Country</option>
                {countries.map((country, index) => (
                  <option key={index} value={country.label} className="bg-slate-900 text-white">
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* <div>
            <label
              htmlFor="referral_code"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Referral Code (Optional)
            </label>
            <div className="relative">
              <input
                id="referral_code"
                type="text"
                {...register("referral_code")}
                placeholder="Enter Referral Code"
                className={`w-full bg-white/10 light:bg-[#4f4f4f4] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
              />
            </div>
          </div> */}

          <button
            disabled={isPending}
            className="mt-5 w-full py-4 rounded-xl bg-black hover:to-blue-500 font-semibold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Signing Up..." : " Sign up"}
          </button>
        </form>

        <div className="text-center space-y-2 mt-3">
          <Link
            href="/login"
            className="text-sm text-blue-300 hover:text-blue-400 transition block w-full"
          >
            Back to Sign In
          </Link>
        </div>

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
