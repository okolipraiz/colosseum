"use client";

import { useGetPayoutDetailsByTx } from "@/hooks/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Copy, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
}

export default function ShareWinModal({
  isOpen,
  onClose,
  transactionId,
}: ShareWinModalProps) {
  const {
    data: details,
    isLoading,
    error,
  } = useGetPayoutDetailsByTx(transactionId);

  const wrapText = (text: string, maxChars = 24) => {
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

  // const handleExport = (action: "download" | "copy" | "share") => {
  //   const svgElement = document.getElementById("win-card-svg");
  //   if (!svgElement) {
  //     toast.error("Win card graphic not found.");
  //     return;
  //   }

  //   if (action === "share") {
  //     const shareUrl = `${window.location.origin}/share/win/${transactionId}`;
  //     if (navigator?.share) {
  //       navigator
  //         .share({
  //           title: "My Prediction Win!",
  //           text: `I just resolved a successful prediction on Forecast! Details: ${details?.question}`,
  //           url: shareUrl,
  //         })
  //         .then(() => {
  //           toast.success("Shared successfully!");
  //         })
  //         .catch((err) => {
  //           console.error("Native share failed:", err);
  //         });
  //     } else {
  //       navigator?.clipboard
  //         ?.writeText(shareUrl)
  //         .then(() => {
  //           toast.success("Share link copied to clipboard!");
  //         })
  //         .catch(() => {
  //           toast.error("Sharing not supported on this browser.");
  //         });
  //     }
  //     return;
  //   }

  //   toast.loading("Generating win card image...");

  //   try {
  //     // Embed the font as base64 in the SVG for canvas rendering
  //     const svgWithFont = svgElement.cloneNode(true) as SVGElement;
  //     const styleEl = document.createElementNS(
  //       "http://www.w3.org/2000/svg",
  //       "style",
  //     );
  //     styleEl.textContent = `@import url('https://api.fontshare.com/v2/css?f[]=plus-jakarta-sans@400&display=swap');`;
  //     svgWithFont.insertBefore(styleEl, svgWithFont.firstChild);

  //     const svgString = new XMLSerializer().serializeToString(svgWithFont);
  //     const svgBlob = new Blob([svgString], {
  //       type: "image/svg+xml;charset=utf-8",
  //     });
  //     const URL = window.URL || window.webkitURL || window;
  //     const blobURL = URL.createObjectURL(svgBlob);

  //     const image = new Image();
  //     image.onload = () => {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = 400;
  //       canvas.height = 600;
  //       const context = canvas.getContext("2d");

  //       if (context) {
  //         context.clearRect(0, 0, 400, 600);
  //         context.drawImage(image, 0, 0, 400, 600);

  //         toast.dismiss();

  //         if (action === "download") {
  //           const pngURL = canvas.toDataURL("image/png");
  //           const downloadLink = document.createElement("a");
  //           downloadLink.href = pngURL;
  //           downloadLink.download = `forecast_win_${transactionId}.png`;
  //           document.body.appendChild(downloadLink);
  //           downloadLink.click();
  //           document.body.removeChild(downloadLink);
  //           toast.success("Win card downloaded!");
  //         } else if (action === "copy") {
  //           canvas.toBlob(async (blob) => {
  //             if (blob) {
  //               try {
  //                 await navigator.clipboard.write([
  //                   new ClipboardItem({ "image/png": blob }),
  //                 ]);
  //                 toast.success("Win card copied to clipboard!");
  //               } catch (err) {
  //                 console.error("Clipboard copy failed:", err);
  //                 toast.error(
  //                   "Clipboard copy failed on this browser. Try downloading instead.",
  //                 );
  //               }
  //             } else {
  //               toast.error("Failed to generate image blob.");
  //             }
  //           }, "image/png");
  //         }
  //       } else {
  //         toast.dismiss();
  //         toast.error("Failed to initialize canvas context.");
  //       }
  //       URL.revokeObjectURL(blobURL);
  //     };
  //     image.onerror = () => {
  //       toast.dismiss();
  //       toast.error("Failed to render graphic asset.");
  //     };
  //     image.src = blobURL;
  //   } catch (e) {
  //     toast.dismiss();
  //     console.error(e);
  //     toast.error("Error generating share image.");
  //   }
  // };

  const handleExport = (action: "download" | "copy" | "share") => {
    const svgElement = document.getElementById("win-card-svg");
    if (!svgElement) {
      toast.error("Win card graphic not found.");
      return;
    }

    if (action === "share") {
      const shareUrl = `${window.location.origin}/share/win/${transactionId}`;
      if (navigator?.share) {
        navigator
          .share({
            title: "My Prediction Win!",
            text: `I just win a successful prediction on Forecast! Details: ${details?.question}`,
            url: shareUrl,
          })
          .then(() => toast.success("Shared successfully!"))
          .catch((err) => console.error("Native share failed:", err));
      } else {
        navigator?.clipboard
          ?.writeText(shareUrl)
          .then(() => toast.success("Share link copied to clipboard!"))
          .catch(() => toast.error("Sharing not supported on this browser."));
      }
      return;
    }

    toast.loading("Generating win card image...");

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
        // Fetch the woff2 font and embed as base64
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
          console.warn("Font fetch failed, canvas will use fallback font:", e);
        }

        // Fetch logo as base64
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

        // Clone SVG, inject font + replace logo href with base64
        const svgClone = svgElement.cloneNode(true) as SVGElement;

        const oldStyle = svgClone.querySelector("defs style");
        if (oldStyle) oldStyle.textContent = fontFaceBlock;

        // Replace logo href with base64 data URL
        const logoImage = svgClone.querySelector("image");
        if (logoImage && logoBase64) {
          logoImage.setAttribute("href", logoBase64);
        }

        // Clone SVG, strip old style, inject embedded font
        // const svgClone = svgElement.cloneNode(true) as SVGElement;
        // const oldStyle = svgClone.querySelector("defs style");
        // if (oldStyle) oldStyle.textContent = fontFaceBlock;

        const svgString = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgString], {
          type: "image/svg+xml;charset=utf-8",
        });
        const blobURL = URL.createObjectURL(svgBlob);

        const image = new Image();

        // image.onload = () => {
        //   const canvas = document.createElement("canvas");
        //   canvas.width = 400;
        //   canvas.height = 600;
        //   const ctx = canvas.getContext("2d");

        //   if (!ctx) {
        //     toast.dismiss();
        //     toast.error("Failed to initialize canvas context.");
        //     URL.revokeObjectURL(blobURL);
        //     return;
        //   }

        //   ctx.clearRect(0, 0, 400, 600);
        //   ctx.drawImage(image, 0, 0, 400, 600);
        //   URL.revokeObjectURL(blobURL);
        //   toast.dismiss();

        //   if (action === "download") {
        //     const pngURL = canvas.toDataURL("image/png");
        //     const a = document.createElement("a");
        //     a.href = pngURL;
        //     a.download = `forecast_win_${transactionId}.png`;
        //     document.body.appendChild(a);
        //     a.click();
        //     document.body.removeChild(a);
        //     toast.success("Win card downloaded!");
        //   } else if (action === "copy") {
        //     canvas.toBlob(async (blob) => {
        //       if (!blob) {
        //         toast.error("Failed to generate image blob.");
        //         return;
        //       }
        //       try {
        //         await navigator.clipboard.write([
        //           new ClipboardItem({ "image/png": blob }),
        //         ]);
        //         toast.success("Win card copied to clipboard!");
        //       } catch {
        //         toast.error("Clipboard copy failed. Try downloading instead.");
        //       }
        //     }, "image/png");
        //   }
        // };

        image.onload = () => {
          const SCALE = 3; // 3x = 1200×1800px — crisp on all screens
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
          ctx.scale(SCALE, SCALE); // scale the context, not the image
          ctx.drawImage(image, 0, 0, 400, 600); // draw at original dimensions
          URL.revokeObjectURL(blobURL);
          toast.dismiss();

          if (action === "download") {
            // quality arg (0–1) only applies to jpeg; for png it's lossless
            const pngURL = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngURL;
            a.download = `forecast_win_${transactionId}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Win card downloaded!");
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
                toast.success("Win card copied to clipboard!");
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
        toast.error("Error generating share image.");
      }
    };

    exportCard();
  };

  if (!isOpen) return null;

  const questionLines = details ? wrapText(details.question, 24) : [];
  const payoutUSD = details ? details.payout : 0;
  const investmentUSD = details ? details.investment : 0;
  const profitUSD = payoutUSD - investmentUSD;
  const roi = investmentUSD > 0 ? (profitUSD / investmentUSD) * 100 : 0;
  const shares = details?.shares || 0;
  const quota = details?.quota || 0;
  const category = details?.category || "general";
  const side = details?.side || "Yes";

  const investmentFormatted =
    investmentUSD >= 1000
      ? `${(investmentUSD / 1000).toFixed(1).replace(".0", "")}k`
      : investmentUSD.toFixed(2);

  const payoutFormatted =
    payoutUSD >= 1000
      ? `${(payoutUSD / 1000).toFixed(1).replace(".0", "")}k`
      : payoutUSD.toFixed(2);

  const isYes = ["yes", "buy"].includes(side.toLowerCase());

  const badgeWidth = Math.max(50, side.length * 7 + 12);
  const badgeX = 350 - badgeWidth;

  const domainName =
    typeof window !== "undefined"
      ? window.location.host.toUpperCase()
      : "FORECAST.ANOMALY.MARKETS";

  const font = "'Plus Jakarta Sans', sans-serif";

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-[#0b0b0c] border border-white/10 rounded-3xl max-w-sm p-6 overflow-hidden shadow-2xl text-white">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-wider text-center text-sm">
            Share Your Win
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Loading Win Details...
            </span>
          </div>
        ) : error || !details ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-red-400 text-sm font-bold uppercase tracking-wide">
              Failed to load win details.
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
            {/* SVG Render Container */}
            <div className="w-full aspect-[2/3] max-w-[320px] mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black relative">
              <svg
                id="win-card-svg"
                viewBox="0 0 400 600"
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                className="select-none block"
              >
                <defs>
                  <style>{`@import url('https://api.fontshare.com/v2/css?f[]=plus-jakarta-sans@400&display=swap');`}</style>

                  {/* ↓ purple stop replaced with blue #1d4ed8 */}
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

                  <linearGradient
                    id="cardGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#121215" />
                    <stop offset="100%" stopColor="#0a0a0c" />
                  </linearGradient>

                  <filter id="blurFilter">
                    <feGaussianBlur stdDeviation="35" />
                  </filter>
                </defs>

                {/* Base Background */}
                <rect width="400" height="600" fill="url(#bgGrad)" />

                {/* Glow Spheres — both blue now */}
                <circle
                  cx="320"
                  cy="120"
                  r="130"
                  fill="#2563eb"
                  fillOpacity="0.14"
                  filter="url(#blurFilter)"
                />
                {/* ↓ was purple #a855f7, now blue #1d4ed8 */}
                <circle
                  cx="80"
                  cy="480"
                  r="110"
                  fill="#1d4ed8"
                  fillOpacity="0.12"
                  filter="url(#blurFilter)"
                />

                {/* Header Logo */}
                <image
                  href="/logo-white.png"
                  x="150"
                  y="32"
                  width="100"
                  height="36"
                  preserveAspectRatio="xMidYMid meet"
                />

                {/* Paid Off Badge */}
                {/* <rect
                  x="245"
                  y="34"
                  width="120"
                  height="32"
                  rx="16"
                  fill="#065f46"
                  fillOpacity="0.15"
                  stroke="#059669"
                  strokeWidth="1"
                />
                <text
                  x="310"
                  y="53"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="10"
                  fill="#34d399"
                  textAnchor="middle"
                  letterSpacing="1px"
                >
                  PAID OFF ✓
                </text> */}

                {/* Card Title */}
                <text
                  x="200"
                  y="125"
                  fontFamily={font}
                  fontWeight="700"
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                  letterSpacing="0.8px"
                >
                  YOU GOT PAID
                </text>

                {/* Payout Amount */}
                <text
                  x="200"
                  y="170"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="32"
                  fill="#10b981"
                  textAnchor="middle"
                  letterSpacing="-0.5px"
                >
                  +$
                  {payoutUSD.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </text>

                {/* Market Card */}
                <rect
                  x="25"
                  y="210"
                  width="350"
                  height="285"
                  rx="26"
                  fill="url(#cardGrad)"
                  stroke="#27272a"
                  strokeWidth="1"
                />

                {/* Category Pill */}
                <rect
                  x="45"
                  y="235"
                  width="85"
                  height="22"
                  rx="7"
                  fill="#2563eb"
                  fillOpacity="0.1"
                />
                <text
                  x="87.5"
                  y="249"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="9"
                  fill="#60a5fa"
                  textAnchor="middle"
                  letterSpacing="0.5px"
                >
                  {category.toUpperCase()}
                </text>

                {/* Won Outcome Badge */}
                <rect
                  x={badgeX}
                  y="235"
                  width={badgeWidth}
                  height="22"
                  rx="7"
                  fill={isYes ? "#047857" : "#b91c1c"}
                />
                <text
                  x={badgeX + badgeWidth / 2}
                  y="249"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="9"
                  fill="white"
                  textAnchor="middle"
                  letterSpacing="0.5px"
                >
                  {side.toUpperCase()}
                </text>

                {/* Question Lines */}
                {questionLines.map((line, idx) => (
                  <text
                    key={idx}
                    x="45"
                    y={300 + idx * 24}
                    fontFamily={font}
                    fontWeight="800"
                    fontSize="18"
                    fill="white"
                    letterSpacing="-0.2px"
                  >
                    {line}
                  </text>
                ))}

                {/* Divider */}
                <line
                  x1="45"
                  y1="390"
                  x2="355"
                  y2="390"
                  stroke="#27272a"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />

                {/* Column Labels */}
                <text
                  x="45"
                  y="418"
                  fontFamily={font}
                  fontWeight="800"
                  fontSize="9"
                  fill="#52525b"
                  textAnchor="start"
                  letterSpacing="0.5px"
                >
                  TRADE
                </text>
                <text
                  x="200"
                  y="418"
                  fontFamily={font}
                  fontWeight="800"
                  fontSize="9"
                  fill="#52525b"
                  textAnchor="middle"
                  letterSpacing="0.5px"
                >
                  INVESTMENT
                </text>
                <text
                  x="355"
                  y="418"
                  fontFamily={font}
                  fontWeight="800"
                  fontSize="9"
                  fill="#52525b"
                  textAnchor="end"
                  letterSpacing="0.5px"
                >
                  PAYOUT
                </text>

                {/* Column Values */}
                <text
                  x="45"
                  y="442"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="14"
                  fill="white"
                  textAnchor="start"
                >
                  {shares.toFixed(0)} shares
                </text>
                <text
                  x="45"
                  y="464"
                  fontFamily={font}
                  fontWeight="700"
                  fontSize="12"
                  fill="#71717a"
                  textAnchor="start"
                >
                  @ ${quota.toFixed(2)}
                </text>

                <text
                  x="200"
                  y="442"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="14"
                  fill="white"
                  textAnchor="middle"
                >
                  ${investmentFormatted}
                </text>

                <text
                  x="355"
                  y="442"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="14"
                  fill="white"
                  textAnchor="end"
                >
                  ${payoutFormatted}
                </text>
                <text
                  x="355"
                  y="464"
                  fontFamily={font}
                  fontWeight="900"
                  fontSize="12"
                  fill="#10b981"
                  textAnchor="end"
                >
                  +{roi.toFixed(0)}%
                </text>

                {/* Footer */}
                <text
                  x="200"
                  y="545"
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

            {/* Actions Grid */}
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
