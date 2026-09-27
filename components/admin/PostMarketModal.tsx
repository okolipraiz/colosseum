"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Copy, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetMarket } from "@/hooks/markets";
import { isMultiOutcomeMarket } from "@/types/market";

interface PostMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMarketId: string;
}

const COLORS = [
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function PostMarketModal({
  isOpen,
  onClose,
  selectedMarketId,
}: PostMarketModalProps) {
  const { data: details, isLoading, error } = useGetMarket(selectedMarketId);
  const market = details;

  const wrapText = (text: string, maxChars = 28) => {
    if (!text) return [];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    words.forEach((word) => {
      if ((currentLine + " " + word).trim().length <= maxChars) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleExport = (action: "download" | "copy" | "share") => {
    const svgElement = document.getElementById("post-market-svg");
    if (!svgElement) {
      toast.error("Card graphic not found.");
      return;
    }

    if (action === "share") {
      const shareUrl = `${window.location.origin}/markets/${selectedMarketId}`;
      if (navigator?.share) {
        navigator
          .share({
            title: market?.question || "Check out this market!",
            text: `Trade on: ${market?.question}`,
            url: shareUrl,
          })
          .then(() => toast.success("Shared successfully!"))
          .catch((err) => console.error("Native share failed:", err));
      } else {
        navigator?.clipboard
          ?.writeText(shareUrl)
          .then(() => toast.success("Link copied to clipboard!"))
          .catch(() => toast.error("Sharing not supported on this browser."));
      }
      return;
    }

    toast.loading("Generating card image...");

    const FONT_WOFF2_URL =
      "https://cdn.fontshare.com/wf/TX2N2Q6ZO2LBO34H72H5RVJTBQFGU4GV/ZICVNTLTT4V7CCIJPWNY363N6LIP2AET/OUUAK2X2MEGEKC6ULA4CFSBY4PE5EGPV.woff2";

    const toBase64 = (buffer: ArrayBuffer): string => {
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    const exportCard = async () => {
      try {
        let fontFaceBlock = "";
        try {
          const fontRes = await fetch(FONT_WOFF2_URL);
          if (fontRes.ok) {
            const buffer = await fontRes.arrayBuffer();
            const base64 = toBase64(buffer);
            fontFaceBlock = `
              @font-face {
                font-family: 'Plus Jakarta Sans';
                src: url('data:font/woff2;base64,${base64}') format('woff2');
                font-weight: 100 900;
                font-style: normal;
              }
            `;
          }
        } catch (e) {
          console.warn("Font fetch failed:", e);
        }

        let logoBase64 = "";
        try {
          const logoRes = await fetch("/logo-white.png");
          if (logoRes.ok) {
            const buffer = await logoRes.arrayBuffer();
            logoBase64 = `data:image/png;base64,${toBase64(buffer)}`;
          }
        } catch (e) {
          console.warn("Logo fetch failed:", e);
        }

        const svgClone = svgElement.cloneNode(true) as SVGElement;
        const oldStyle = svgClone.querySelector("defs style");
        if (oldStyle) oldStyle.textContent = fontFaceBlock;

        const logoImage = svgClone.querySelector("image");
        if (logoImage && logoBase64) {
          logoImage.setAttribute("href", logoBase64);
        }

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const blobURL = URL.createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
          const SCALE = 3;
          const canvas = document.createElement("canvas");
          canvas.width = 400 * SCALE;
          canvas.height = 600 * SCALE;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            toast.dismiss();
            toast.error("Failed to initialize canvas context.");
            URL.revokeObjectURL(blobURL);
            return;
          }

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.scale(SCALE, SCALE);
          ctx.drawImage(image, 0, 0, 400, 600);
          URL.revokeObjectURL(blobURL);
          toast.dismiss();

          if (action === "download") {
            const pngURL = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngURL;
            a.download = `forecast_market_${selectedMarketId}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Card downloaded!");
          } else if (action === "copy") {
            canvas.toBlob(async (blob) => {
              if (!blob) {
                toast.error("Failed to generate image blob.");
                return;
              }
              try {
                await navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob }),
                ]);
                toast.success("Card copied to clipboard!");
              } catch {
                toast.error("Clipboard copy failed. Try downloading instead.");
              }
            }, "image/png");
          }
        };

        image.onerror = () => {
          URL.revokeObjectURL(blobURL);
          toast.dismiss();
          toast.error("Failed to render graphic asset.");
        };

        image.src = blobURL;
      } catch (e) {
        toast.dismiss();
        console.error(e);
        toast.error("Error generating card image.");
      }
    };

    exportCard();
  };

  if (!isOpen) return null;

  const isMulti = isMultiOutcomeMarket(market);
  const outcomes: any = isMulti ? market?.outcomes || [] : [];
  const buyPercentage = market?.buy_percentage || 50;
  const sellPercentage = market?.sell_percentage || 50;
  const category = market?.category || "general";
  const questionLines = market ? wrapText(market.question, 28) : [];

  const domainName =
    typeof window !== "undefined"
      ? window.location.host.toUpperCase()
      : "FORECAST.ANOMALY.MARKETS";

  const font = "'Plus Jakarta Sans', sans-serif";

  // === Dynamic Line Chart Data ===
  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const createDynamicLinePoints = (finalPct: number, pointCount = 5) => {
    const points: number[] = [];
    for (let i = 0; i < pointCount; i++) {
      const progress = i / (pointCount - 1);
      let value = Math.round(
        finalPct * progress * (0.85 + Math.random() * 0.3),
      );
      value = Math.max(3, Math.min(97, value));
      points.push(value);
    }
    return points;
  };

  const chartData = isMulti
    ? outcomes.slice(0, 4).map((o: any, idx: number) => ({
        name: o.name,
        percentage: o.percentage,
        color: COLORS[idx % COLORS.length],
        points: createDynamicLinePoints(o.percentage),
      }))
    : [];

  const createdDate = market?.created_at
    ? formatShortDate(market.created_at)
    : "Created";

  const updatedDate = market?.updated_at
    ? formatShortDate(market.updated_at)
    : "Now";

  const xLabels = [createdDate, "", "", updatedDate];

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0b0b0c] border border-white/10 rounded-3xl max-w-sm p-6 overflow-hidden shadow-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-wider text-center text-sm">
            Share Market
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Loading Market Details...
            </span>
          </div>
        ) : error || !market ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-red-400 text-sm font-bold uppercase tracking-wide">
              Failed to load market details.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs uppercase font-black"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-full aspect-[2/3] max-w-[320px] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black relative">
              <svg
                id="post-market-svg"
                viewBox="0 0 400 600"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                className="select-none block"
              >
                <defs>
                  <style>{`@import url('https://api.fontshare.com/v2/css?f[]=plus-jakarta-sans@400&display=swap');`}</style>
                  <linearGradient
                    id="bgGrad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#0a0a0c" />
                    <stop offset="60%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#08080a" />
                  </linearGradient>
                  <filter id="blurFilter">
                    <feGaussianBlur stdDeviation="35" />
                  </filter>
                </defs>

                {/* Background */}
                <rect width="400" height="600" fill="url(#bgGrad)" />

                {/* Glow spheres */}
                <circle
                  cx="320"
                  cy="120"
                  r="130"
                  fill="#2563eb"
                  fillOpacity="0.14"
                  filter="url(#blurFilter)"
                />
                <circle
                  cx="80"
                  cy="480"
                  r="110"
                  fill="#1d4ed8"
                  fillOpacity="0.12"
                  filter="url(#blurFilter)"
                />

                {/* Logo */}
                <image
                  href="/logo-white.png"
                  x="150"
                  y="28"
                  width="100"
                  height="36"
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* Category pill */}
                <rect
                  x="25"
                  y="82"
                  width="80"
                  height="20"
                  rx="6"
                  fill="#2563eb"
                  fillOpacity="0.15"
                />
                <text
                  x="65"
                  y="95"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="8"
                  fill="#60a5fa"
                  textAnchor="middle"
                  letterSpacing="0.5px"
                >
                  {category.toUpperCase()}
                </text>

                {/* Bigger Question */}
                {questionLines.map((line, idx) => (
                  <text
                    key={idx}
                    x="25"
                    y={135 + idx * 26}
                    fontFamily={font}
                    fontWeight="800"
                    fontSize="20"
                    fill="white"
                    letterSpacing="-0.6px"
                  >
                    {line}
                  </text>
                ))}

                {/* YES / NO Bar */}
                {!isMulti ? (
                  <g>
                    <rect
                      x="25"
                      y="245"
                      width="350"
                      height="42"
                      rx="10"
                      fill="#1f2937"
                    />
                    <rect
                      x="25"
                      y="245"
                      width={350 * (buyPercentage / 100)}
                      height="42"
                      rx="10"
                      fill="#2563eb"
                    />
                    <text
                      x="45"
                      y="272"
                      fontFamily={font}
                      fontWeight="900"
                      fontSize="13"
                      fill="white"
                    >
                      YES {buyPercentage}%
                    </text>
                    <text
                      x="355"
                      y="272"
                      fontFamily={font}
                      fontWeight="900"
                      fontSize="13"
                      fill="white"
                      textAnchor="end"
                    >
                      NO {sellPercentage}%
                    </text>
                  </g>
                ) : (
                  /* === MULTI-OUTCOME LINE CHART === */
                  <g>
                    {/* Chart Area */}
                    <rect
                      x="28"
                      y="235"
                      width="344"
                      height="168"
                      rx="12"
                      fill="#111113"
                      stroke="#27272a"
                      strokeWidth="1"
                    />

                    {/* Grid lines */}
                    {[20, 53, 86, 119, 152].map((y, i) => (
                      <line
                        key={i}
                        x1="38"
                        y1={235 + y}
                        x2="362"
                        y2={235 + y}
                        stroke="#27272a"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Dynamic X-axis labels */}
                    {xLabels.map((label, i) => (
                      <text
                        key={i}
                        x={38 + i * 78}
                        y="415"
                        fontFamily={font}
                        fontWeight="600"
                        fontSize="8.5"
                        fill="#52525b"
                        textAnchor="middle"
                      >
                        {label}
                      </text>
                    ))}

                    {/* Lines */}
                    {chartData.map((outcome: any, idx: number) => {
                      const points = outcome.points;
                      const chartTop = 235 + 20;
                      const chartBottom = 235 + 152;
                      const chartHeight = chartBottom - chartTop;
                      const stepX = 324 / (points.length - 1);

                      let pathD = "";
                      points.forEach((p: any, i: number) => {
                        const x = 38 + i * stepX;
                        const y = chartBottom - (p / 100) * chartHeight;
                        pathD += `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)} `;
                      });

                      return (
                        <g key={idx}>
                          <path
                            d={pathD}
                            fill="none"
                            stroke={outcome.color}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx={38 + (points.length - 1) * stepX}
                            cy={
                              chartBottom -
                              (points[points.length - 1] / 100) * chartHeight
                            }
                            r="3.5"
                            fill={outcome.color}
                          />
                        </g>
                      );
                    })}

                    {/* Legend */}
                    <g>
                      {chartData.slice(0, 3).map((outcome: any, idx: number) => (
                        <g key={idx}>
                          <circle
                            cx={38 + idx * 115}
                            cy="435"
                            r="4"
                            fill={outcome.color}
                          />
                          <text
                            x={48 + idx * 115}
                            y="439"
                            fontFamily={font}
                            fontWeight="700"
                            fontSize="9.5"
                            fill="#e2e8f0"
                          >
                            {outcome.name.length > 11
                              ? outcome.name.substring(0, 11) + "…"
                              : outcome.name}{" "}
                            {outcome.percentage}%
                          </text>
                        </g>
                      ))}
                    </g>
                  </g>
                )}

                {/* Closing & Resolution Info */}
                <g>
                  <text
                    x="45"
                    y={isMulti ? 490 : 325}
                    fontFamily={font}
                    fontWeight="800"
                    fontSize="9"
                    fill="#52525b"
                    letterSpacing="0.5px"
                  >
                    CLOSES
                  </text>
                  <text
                    x="45"
                    y={isMulti ? 510 : 345}
                    fontFamily={font}
                    fontWeight="700"
                    fontSize="13"
                    fill="#f87171"
                  >
                    {new Date(market.closing_time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </text>

                  <text
                    x="355"
                    y={isMulti ? 490 : 325}
                    fontFamily={font}
                    fontWeight="800"
                    fontSize="9"
                    fill="#52525b"
                    textAnchor="end"
                    letterSpacing="0.5px"
                  >
                    RESOLVES
                  </text>
                  <text
                    x="355"
                    y={isMulti ? 510 : 345}
                    fontFamily={font}
                    fontWeight="700"
                    fontSize="13"
                    fill="#60a5fa"
                    textAnchor="end"
                  >
                    {new Date(market.resolution_time).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </text>
                </g>

                {/* Footer */}
                <text
                  x="200"
                  y="575"
                  fontFamily={font}
                  fontWeight="800"
                  fontSize="11"
                  fill="#3f3f46"
                  textAnchor="middle"
                  letterSpacing="1px"
                >
                  {domainName}
                </text>
              </svg>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleExport("download")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-slate-300 hover:text-white"
              >
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Save
                </span>
              </button>
              <button
                onClick={() => handleExport("copy")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-slate-300 hover:text-white"
              >
                <Copy className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Copy
                </span>
              </button>
              <button
                onClick={() => handleExport("share")}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer text-white shadow-lg shadow-blue-500/20"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Share
                </span>
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
