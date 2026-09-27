"use client";

import { useState, useEffect } from "react";
import { CreateMarketPayload, MarketType } from "@/types/admin";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAdminCreateMarkets } from "@/hooks/admin/markets";
import { useGetUserInfo } from "@/hooks/user";

export function CreateMarkets() {
  const router = useRouter();
  const { data: profile } = useGetUserInfo();
  const isSubadmin = profile?.is_subadmin || profile?.role === "subadmin";

  const categories = [
    "Socials",
    "BB Naija 👁️",
    "Crypto",
    "Politics",
    "Sports",
    "Forex",
    "Commodities",
    "Entertainment",
    "Weather",
    "World Cup",
    "Other",
  ];

  const MarketType = [
    { label: "Financial", value: "financial" },
    { label: "Non Financial", value: "non-financial" },
    { label: "Multi Outcome", value: "multi-outcome" },
  ];

  const [selectedMarketType, setSelectedMarketType] = useState<MarketType | "">(
    "",
  );

  const [selectedIsTrending, setSelectedIsTrending] = useState<boolean | "">("");
  const [outcomeInput, setOutcomeInput] = useState("");
  const [multiMarketOptions, setMultiMarketOptions] = useState<string[]>([]);
  const [showYieldSelection, setShowYieldSelection] = useState(false);
  const [yieldPools, setYieldPools] = useState<{ id: string; name: string; asset: string }[]>([]);
  const [selectedYieldPoolId, setSelectedYieldPoolId] = useState<string>("");
  const [selectedYieldStrategy, setSelectedYieldStrategy] = useState<string>("pro_rata_all");

  useEffect(() => {
    async function loadYieldPools() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";
        const res = await fetch(`${baseUrl}/vaults`);
        if (res.ok) {
          const data = await res.json();
          setYieldPools(data);
        }
      } catch (err) {
        console.warn("Could not load yield pools for selection:", err);
      }
    }
    loadYieldPools();
  }, []);

  const handleAddOutcome = () => {
    const value = outcomeInput.trim();

    if (!value) return;

    // prevent duplicates
    if (multiMarketOptions.includes(value)) {
      setOutcomeInput("");
      toast.error("Outcome already added");
      return;
    }

    setMultiMarketOptions((prev) => [...prev, value]);
    setOutcomeInput("");
  };

  const removeOutcome = (value: string) => {
    setMultiMarketOptions((prev) => prev.filter((item) => item !== value));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMarketPayload>();
  const { mutate, isPending } = useAdminCreateMarkets(selectedMarketType);

  const onSubmit = (values: CreateMarketPayload) => {
    // Validate multi outcome before submission
    if (
      selectedMarketType === "multi-outcome" &&
      multiMarketOptions.length < 2
    ) {
      toast.error("Please add at least two outcome");
      return;
    }

    const isYieldLinked = (selectedMarketType === "financial" || selectedMarketType === "non-financial") && showYieldSelection && selectedYieldPoolId;

    const basePayload: any = {
      question: values.question,
      description: values.description,
      is_trending: selectedIsTrending === "" ? false : selectedIsTrending,
      asset: "this market",
      category: values.category,
      data_source: values.data_source,
      closing_time: values.closing_time,
      resolution_time: values.resolution_time,
    };

    if (selectedMarketType !== "multi-outcome") {
      basePayload.yield_pool_id = isYieldLinked ? selectedYieldPoolId : null;
      basePayload.yield_strategy = isYieldLinked ? selectedYieldStrategy : "pro_rata_all";
    }

    let payload: any;

    // Multi outcome market
    if (selectedMarketType === "multi-outcome") {
      payload = {
        ...basePayload,
        market_type: "multi-outcome",
        outcomes: multiMarketOptions.map((option) => ({
          name: option,
          initial_price: 0.1,
        })),
      };
    }

    // Financial market
    else if (selectedMarketType === "financial") {
      payload = {
        ...basePayload,
        asset: values.asset,
        market_type: "financial",
        current_price: values.current_price,
        strike_price: values.strike_price,
      };
    }

    // Non-financial market
    else {
      payload = {
        ...basePayload,
        market_type: "non-financial",
      };
    }

    toast.promise(
      new Promise((resolve, reject) => {
        mutate(payload, {
          onSuccess: async (response) => {
            if (isSubadmin) {
              toast.info("Market submitted successfully! Pending admin verification before going live.");
            } else {
              toast.success("Market created and published!");
            }
            router.push("/admin");
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

  return (
    <>
      {/* Glassmorphic Form */}
      <div className="relative w-full max-w-xl ">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="w-full">
            <label
              htmlFor="question"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Question
            </label>
            <div className="relative">
              <input
                id="text"
                type="text"
                {...register("question", {
                  required: "Question is required",
                })}
                placeholder="Enter your question"
                className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
            </div>
            {errors.question && (
              <span className="text-[12px] text-red-500">
                {errors.question.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="market_type"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Market Type
            </label>
            <select
              className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              id="market_type"
              required
              {...register("market_type", {
                required: "Market is required",
                onChange: (e) =>
                  setSelectedMarketType(e.target.value as MarketType | ""),
              })}
            >
              <option value="" className="bg-slate-900 text-white">Select Market Type</option>
              {MarketType.map((marketType, index) => (
                <option key={index} value={marketType.value} className="bg-slate-900 text-white">
                  {marketType.label}
                </option>
              ))}
            </select>
          </div>

          {selectedMarketType === "financial" && (
            <>
              <div className="w-full">
                <label
                  htmlFor="asset"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Asset
                </label>
                <div className="relative">
                  <input
                    id="asset"
                    type="text"
                    placeholder="Enter Asset"
                    {...register("asset", {
                      required: "Asset is required",
                    })}
                    className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                  />
                </div>
                {errors.asset && (
                  <span className="text-[12px] text-red-500">
                    {errors.asset.message}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-full">
                  <label
                    htmlFor="current_price"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Current Price
                  </label>
                  <div className="relative">
                    <input
                      id="current_price"
                      type="number"
                      step="any"
                      placeholder="Current Price"
                      {...register("current_price", {
                        required: "Current Price is required",
                        valueAsNumber: true,
                      })}
                      className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                    />
                  </div>
                  {errors.current_price && (
                    <span className="text-[12px] text-red-500">
                      {errors.current_price.message}
                    </span>
                  )}
                </div>

                <div className="w-full">
                  <label
                    htmlFor="strike_price"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Strike Price
                  </label>
                  <div className="relative">
                    <input
                      id="strike_price"
                      type="number"
                      step="any"
                      {...register("strike_price", {
                        required: "Strike Price is required",
                        valueAsNumber: true,
                      })}
                      placeholder="Strike Price"
                      className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                    />
                  </div>
                  {errors.strike_price && (
                    <span className="text-[12px] text-red-500">
                      {errors.strike_price.message}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedMarketType === "multi-outcome" && (
            <div className="w-full">
              <label
                htmlFor="outcomes"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Multiple Outcomes
              </label>

              <div className="flex items-center gap-2">
                <input
                  id="outcomes"
                  type="text"
                  value={outcomeInput}
                  onChange={(e) => setOutcomeInput(e.target.value)}
                  placeholder="Type outcome"
                  className="w-[70%] bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />

                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold w-[30%] py-3 rounded-xl transition-colors cursor-pointer"
                  type="button"
                  onClick={handleAddOutcome}
                >
                  Add Outcome
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Press Enter to add an outcome
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                {multiMarketOptions.map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-white"
                  >
                    <div>{option}</div>

                    <button
                      type="button"
                      onClick={() => removeOutcome(option)}
                      className="text-red-400 hover:text-red-300 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full">
            <label
              htmlFor="data_source"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Data Source
            </label>
            <div className="relative">
              <input
                id="text"
                type="text"
                {...register("data_source", {
                  required: "Data Source is required",
                })}
                placeholder="Enter your Data source"
                className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
            </div>
            {errors.data_source && (
              <span className="text-[12px] text-red-500">
                {errors.data_source.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Category
            </label>
            <select
              className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              id="category"
              required
              {...register("category", {
                required: "Country is required",
              })}
            >
              <option value="" className="bg-slate-900 text-white">Select Your Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category} className="bg-slate-900 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Description
            </label>
            <div className="relative">
              <textarea
                id="description"
                rows={10}
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Enter your Description"
                className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              />
            </div>
            {errors.description && (
              <span className="text-[12px] text-red-500">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="w-full">
            <label
              htmlFor="is_trending"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Is Trending
            </label>
            <select
              className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
              id="is_trending"
              required
              {...register("is_trending", {
                required: "Is trending is required",
                onChange: (e) =>
                  setSelectedIsTrending(e.target.value === "true" ? true : false),
              })}
            >
              <option value="" className="bg-slate-900 text-white">Select Is Trending</option>
              <option value="true" className="bg-slate-900 text-white">True</option>
              <option value="false" className="bg-slate-900 text-white">False</option>
            </select>
          </div>

          {/* Yield Pool Integration */}
          {(selectedMarketType === "financial" || selectedMarketType === "non-financial") && (
            <div className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2">
                <input
                  id="link_yield_pool"
                  type="checkbox"
                  checked={showYieldSelection}
                  onChange={(e) => {
                    setShowYieldSelection(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedYieldPoolId("");
                    }
                  }}
                  className="rounded border-white/10 bg-white/[0.03] text-blue-600 focus:ring-blue-500 focus:ring-offset-black w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor="link_yield_pool"
                  className="text-sm font-semibold text-slate-300 cursor-pointer"
                >
                  Deposit Bets into Yield Pool (Earn Yield)
                </label>
              </div>

              {showYieldSelection && (
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="w-full">
                    <label
                      htmlFor="yield_pool_id"
                      className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Select Yield Pool
                    </label>
                    <select
                      id="yield_pool_id"
                      value={selectedYieldPoolId}
                      onChange={(e) => setSelectedYieldPoolId(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-xs"
                      required={showYieldSelection}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">-- Choose Yield Pool --</option>
                      {yieldPools.map((pool) => (
                        <option key={pool.id} value={pool.id} className="bg-slate-900 text-white">
                          {pool.name} ({pool.asset})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full">
                    <label
                      htmlFor="yield_strategy"
                      className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Yield strategy
                    </label>
                    <select
                      id="yield_strategy"
                      value={selectedYieldStrategy}
                      onChange={(e) => setSelectedYieldStrategy(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition text-xs"
                    >
                      <option value="pro_rata_all" className="bg-slate-900 text-white">Pro Rata (All Participants)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="md:flex items-center gap-3 space-y-3 md:space-y-0">
            <div className="w-full">
              <label
                htmlFor="closing_time"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Closing Time
              </label>
              <div className="relative">
                <input
                  id="closing_time"
                  type="datetime-local"
                  {...register("closing_time", {
                    required: "Closing Time is required",
                  })}
                  className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                />
              </div>
              {errors.closing_time && (
                <span className="text-[12px] text-red-500">
                  {errors.closing_time.message}
                </span>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="resolution_time"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Resolution Time
              </label>
              <div className="relative">
                <input
                  id="resolution_time"
                  type="datetime-local"
                  {...register("resolution_time", {
                    required: "Resolution Time is required",
                  })}
                  className={`w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition`}
                />
              </div>
              {errors.resolution_time && (
                <span className="text-[12px] text-red-500">
                  {errors.resolution_time.message}
                </span>
              )}
            </div>
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="mt-5 w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase text-sm transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed border-none"
          >
            {isPending ? "Creating..." : " Create Market"}
          </button>
        </form>
      </div>
    </>
  );
}
