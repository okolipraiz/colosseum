"use client";

import { useAdminResolveMarkets } from "@/hooks/admin/markets";
import { useGetUserInfo } from "@/hooks/user";
import { isMultiOutcomeMarket } from "@/types/market";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Lock, ShieldAlert } from "lucide-react";

interface TradingPanelProps {
  market: any;
}

interface ResolveFormData {
  outcome: string;
}

export default function ResolvePanel({ market }: TradingPanelProps) {
  const marketId = market.id;
  const isMulti = isMultiOutcomeMarket(market);
  const router = useRouter();
  const { data: profile } = useGetUserInfo();

  const isSubadmin = profile?.is_subadmin || profile?.role === "subadmin";
  const isSuperuser = profile?.is_superuser || profile?.role === "superuser";
  const isFullAdmin = profile?.is_full_admin || (profile?.is_staff && !isSubadmin) || isSuperuser;

  const isVerified = market.is_verified ?? (market.verification_status ? market.verification_status === "approved" : true);
  const isCreator = !market.created_by_id || String(market.created_by_id) === String(profile?.id);

  const canResolve = isFullAdmin || (isSubadmin && isCreator && isVerified);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResolveFormData>();
  const { mutate, isPending } = useAdminResolveMarkets(marketId);

  const onSubmit = (values: ResolveFormData) => {
    if (!canResolve) {
      toast.error("You are not authorized to resolve this market.");
      return;
    }

    const payload = {
      outcome: values.outcome,
    };

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(payload, {
          onSuccess: async (response) => {
            router.refresh();
            resolve(response);
          },

          onError: (error) => {
            reject(error);
          },
        });
      }),
      {
        loading: "Submitting, please wait...",
      },
    );
  };

  if (!isVerified) {
    return (
      <div className="bg-[#121214]/80 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden text-center">
        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Resolution Locked</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          This market is pending verification by an admin. Markets cannot be resolved until they are verified and approved.
        </p>
      </div>
    );
  }

  if (isSubadmin && !isCreator) {
    return (
      <div className="bg-[#0a0a0b]/60 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-red-500/20 shadow-2xl relative overflow-hidden text-center">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Resolution Locked</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Subadmins can only resolve markets they created. This market was created by another account.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#0a0a0b]/60 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden w-full"
        >
          {isMulti ? (
            <div className="w-full">
              <label
                htmlFor="outcome"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Multi Outcome Result
              </label>

              <select
                className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                id="outcome"
                required
                {...register("outcome", {
                  required: "Outcome is required",
                })}
              >
                <option value="" className="bg-slate-900 text-white">Select Outcome</option>
                {market.outcomes.map((outcome: any) => (
                  <option key={outcome.id} value={outcome.id} className="bg-slate-900 text-white">
                    {outcome.name}
                  </option>
                ))}
                <option value="neutral" className="bg-slate-900 text-white">Neutral</option>
              </select>
              {errors.outcome && (
                <span className="text-[12px] text-red-500">
                  {errors.outcome.message}
                </span>
              )}
            </div>
          ) : (
            <>
              <div className="w-full">
                <label
                  htmlFor="outcome"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Binary Outcome
                </label>
                <select
                  className={`w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition`}
                  id="outcome"
                  required
                  {...register("outcome", {
                    required: "Outcome is required",
                  })}
                >
                  <option value="" className="bg-slate-900 text-white">Select Binary Outcome</option>
                  <option value="yes" className="bg-slate-900 text-white">Yes</option>
                  <option value="no" className="bg-slate-900 text-white">No</option>
                  <option value="neutral" className="bg-slate-900 text-white">Neutral</option>
                </select>
                {errors.outcome && (
                  <span className="text-[12px] text-red-500">
                    {errors.outcome.message}
                  </span>
                )}
              </div>
            </>
          )}

          <button
            disabled={isPending}
            type="submit"
            className="mt-5 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold shadow-lg transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white"
          >
            {isPending ? "Resolving..." : "Resolve Market"}
          </button>
        </form>
      </div>
    </>
  );
}
