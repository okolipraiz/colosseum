"use client";

import { useAdminDeleteMarket } from "@/hooks/admin/markets";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteMarket({ market }: { market: any }) {
  const marketId = market.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate, isPending } = useAdminDeleteMarket(marketId);

  const onSubmit = () => {
    const toastId = toast.loading("Submitting, please wait...");

    mutate({} as any, {
      onSuccess: () => {
        toast.success("Submitted successfully!", { id: toastId });
        router.push("/admin");
        queryClient.invalidateQueries({ queryKey: ["markets"] });
      },

      onError: (error: any) => {
        toast.error(error?.message || "Something went wrong.", {
          id: toastId,
        });
      },
    });
  };

  return (
    <>
      <div>
        {confirmDelete ? (
          <div className="bg-[#0a0a0b]/60 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden w-full">
            <p className="text-sm text-red-500 mb-4">
              Are you sure you want to delete this market? This action cannot be
              undone.
            </p>

            <div className="flex items-center gap-2 w-full">
              <button
                onClick={onSubmit}
                disabled={isPending}
                type="button"
                className="w-full py-4 text-[12px] rounded-xl bg-red-600 hover:bg-red-500 font-semibold shadow-lg transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isPending ? "Deleting..." : "Yes, Delete Market"}
              </button>

              <button
                onClick={() => setConfirmDelete(false)}
                type="button"
                className="w-full py-4 text-[12px] rounded-xl bg-gray-600 hover:bg-gray-500 font-semibold shadow-lg transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-[#0a0a0b]/60 backdrop-blur-2xl rounded-[2.5rem] p-5 sm:p-8 border border-white/5 shadow-2xl relative overflow-hidden w-full">
              <button
                onClick={() => setConfirmDelete(true)}
                type="button"
                className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 font-semibold shadow-lg transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Delete Market
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
