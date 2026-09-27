"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TextChange from "@/components/TextChange";
import { Button } from "@/components/ui/button";
import {
  Zap,
  LineChart,
  Layers,
  Trophy,
  ShieldCheck,
  Smartphone,
  SplitSquareHorizontal,
  ArrowRight,
  Globe as WebGlobe,
} from "lucide-react";
import { toast } from "sonner";

const features = [
  {
    icon: Layers,
    kicker: "Markets",
    title: "Every market, one feed",
    description:
      "Browse live markets across politics, entertainment, crypto, sports and more — filter by category and jump straight in.",
    image: {
      src: "/marketing/markets-grid.png",
      width: 1218,
      height: 345,
    },
  },
  {
    icon: SplitSquareHorizontal,
    kicker: "Outcomes",
    title: "Not just yes or no",
    description:
      "Back a single outcome among many, not just a binary bet. Multi-outcome markets give you sharper positions.",
    image: {
      src: "/marketing/multi-outcome.png",
      width: 332,
      height: 280,
    },
  },
  {
    icon: LineChart,
    kicker: "Pricing",
    title: "Positions that move with the crowd",
    description:
      "Every market re-prices in real time as positions come in, so what you see is what the market actually believes right now.",
    image: {
      src: "/marketing/odds-bar.png",
      width: 830,
      height: 95,
    },
  },
  {
    icon: Zap,
    kicker: "Speed",
    title: "From idea to position in seconds",
    description:
      "Pick a market, pick a side, confirm. No forms, no waiting on approval — your position is live the moment you submit it.",
    image: {
      src: "/marketing/trading-panel.png",
      width: 370,
      height: 475,
    },
  },
  {
    icon: ShieldCheck,
    kicker: "Resolution",
    title: "Every market, resolved in the open",
    description:
      "Outcomes are settled against clear, published rules with a visible audit trail — no guessing how a market was called.",
    image: {
      src: "/marketing/resolution.png",
      width: 830,
      height: 430,
    },
  },
  {
    icon: Trophy,
    kicker: "Leaderboard",
    title: "Prove your edge, climb the ranks",
    description:
      "Every forecaster is ranked on results. Track your standing against everyone else calling the same markets.",
    image: {
      src: "/marketing/leaderboard.png",
      width: 847,
      height: 360,
    },
  },
];

const BrowserFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-[#0d0d0f] overflow-hidden shadow-2xl">
    <div className="h-9 flex items-center gap-1.5 px-4 border-b border-white/10">
      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
    </div>

    {children}
  </div>
);

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-96 mx-auto rounded-[2.5rem] border-4 border-white/10 bg-[#0d0d0f] overflow-hidden shadow-2xl p-1.5">
    <div className="w-16 h-1.5 rounded-full bg-white/15 mx-auto my-2" />

    <div className="rounded-[1.75rem] overflow-hidden">{children}</div>
  </div>
);

const Globe = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let globe:
      | {
          update: (state: Record<string, number>) => void;
          destroy: () => void;
        }
      | undefined;

    let width = 0;
    let destroyed = false;
    let raf = 0;

    const onResize = () => {
      width = canvas.offsetWidth;

      canvas.width = width * 2;
      canvas.height = width * 2;
    };

    onResize();

    window.addEventListener("resize", onResize);

    (async () => {
      const createGlobe = (await import("cobe")).default;

      if (destroyed) return;

      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.25,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.28, 0.35, 0.9],
        markerColor: [0.4, 0.7, 1],
        glowColor: [0.25, 0.6, 1],

        markers: [
          { location: [37.78, -122.44], size: 0.03 },
          { location: [40.71, -74.01], size: 0.03 },
          { location: [51.5, -0.12], size: 0.03 },
          { location: [35.68, 139.65], size: 0.03 },
          { location: [-33.87, 151.21], size: 0.03 },
        ],

        arcs: [
          {
            from: [37.78, -122.44],
            to: [51.5, -0.12],
            color: [0.4, 0.7, 1],
          },
          {
            from: [40.71, -74.01],
            to: [35.68, 139.65],
            color: [0.4, 0.7, 1],
          },
          {
            from: [-33.87, 151.21],
            to: [51.5, -0.12],
            color: [0.4, 0.7, 1],
          },
        ],

        arcColor: [0.4, 0.7, 1],
        arcWidth: 0.6,
        arcHeight: 0.35,
      });

      const animate = () => {
        if (destroyed) return;

        phiRef.current += 0.003;

        globe?.update({
          phi: phiRef.current,
        });

        raf = requestAnimationFrame(animate);
      };

      raf = requestAnimationFrame(animate);
    })();

    return () => {
      destroyed = true;

      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);

      globe?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-[520px] h-auto mx-auto aspect-square"
      aria-label="Interactive globe showing Forecast's global reach"
    />
  );
};

const HomePageClient = () => {
  const [open, setOpen] = useState(false);
  const toggleProfile = () => {
    setOpen((prev) => !prev);
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <header className="sticky top-0 z-100 h-18.5 border-b border-white/10 bg-gray-900/40 backdrop-blur-sm">
        <div className="max-w-300 mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3 group">
            <div>
              <img
                src="/logo-white.png"
                alt="Forecast Logo"
                className="w-24 h-8"
              />
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center h-11 px-4 text-xs font-normal text-slate-400 hover:text-white hover:opacity-80 transition-all"
            >
              Log in
            </Link>

            <Button
              asChild
              className="h-11 rounded-md px-6 text-xs hover:opacity-80 transition-opacity"
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-300 mx-auto px-6">
        {/* Hero */}
        <section className="pt-14 pb-14 sm:pt-24 sm:pb-24 text-center animate-slide-up">
          <span className="inline-flex items-center gap-2 text-xs font-normal uppercase tracking-widest text-slate-400 border border-white/10 rounded-full px-4 h-8 mb-8">
            Playstore Now live 🎉
          </span>

          <h1 className="text-[28px] sm:text-[36px] lg:text-[58px] font-bold tracking-tight leading-[1.05] max-w-3xl mx-auto">
            Earn from all <TextChange /> <br className="block" />
            Decisions you make daily
          </h1>

          <p className="mt-6 text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Forecast turns real world outcomes into markets you can trade — open
            a position in seconds, track it as positions shift, cash out the
            moment it resolves.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="w-full flex items-center justify-center py-3 cursor-pointer rounded-2xl px-6 bg-black border-2 hover:opacity-80 transition-opacity"
              >
                <Smartphone size={20} />
                <span className="text-xs text-white leading-tight ml-1">
                  Download Mobile App
                </span>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute  mt-3 w-56 bg-[#121214]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 z-50 overflow-hidden ${
                  open
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2 space-y-1">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.phaceex.forcastapp"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                  >
                    <Image
                      src={"/playstore.png"}
                      height={20}
                      width={20}
                      alt="playstore"
                    />
                    Get Andriod App
                  </a>
                  <div className="h-px bg-white/5 mx-2" />
                  <div
                    onClick={() => {
                      toast.info("IOS app is not available yet.");
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
                  >
                    <Image
                      src={"/apple.png"}
                      height={20}
                      width={20}
                      alt="apple"
                    />
                    Get IOS App
                  </div>
                </div>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-12 rounded-2xl w-1/2 sm:w-auto px-6 text-xs border-2 hover:opacity-80 transition-opacity"
            >
              <Link href="/markets">
                <WebGlobe className="w-4 h-4" />
                <span>Browse markets</span>
              </Link>
            </Button>
          </div>
        </section>

        {/* Hero showcase */}
        <section className="pb-24">
          <BrowserFrame>
            <Image
              src="/marketing/hero-showcase.png"
              alt="Forecast market trading UI"
              width={1248}
              height={570}
              priority
              className="w-full h-auto block"
            />
          </BrowserFrame>
        </section>

        {/* Product showcase */}
        <section className="pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-9 gap-y-6 md:gap-y-10 items-start">
            {features.map(({ icon: Icon, kicker, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-5 border border-white/10 rounded-2xl p-6 sm:p-8"
              >
                <div className="md:flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/4 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  <div>
                    <span className="text-xs font-normal uppercase tracking-widest text-slate-500">
                      {kicker}
                    </span>

                    <h3 className="mt-1 text-[20px] font-bold tracking-tight leading-tight">
                      {title}
                    </h3>

                    <p className="mt-2 text-base text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Anywhere */}
        <section className="pb-24 border-t border-white/10 pt-16 flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-center">
            <PhoneFrame>
              <Image
                src="/marketing/mobile-markets.png"
                alt="Forecast on mobile"
                width={390}
                height={900}
                className="w-full h-auto block"
              />
            </PhoneFrame>

            <div className="text-center md:text-left">
              <div className="w-9 h-9 rounded-lg bg-white/4 border border-white/10 flex items-center justify-center mb-4 mx-auto md:mx-0">
                <Smartphone className="w-4 h-4 text-white" />
              </div>

              <span className="text-xs font-normal uppercase tracking-widest text-slate-500">
                Anywhere
              </span>

              <h3 className="mt-1 text-[24px] sm:text-[30px] font-bold tracking-tight leading-tight">
                Built for wherever you are
              </h3>

              <p className="mt-2 text-base text-slate-400 leading-relaxed max-w-md mx-auto md:mx-0">
                A fast, responsive layout means checking a market or closing a
                position works the same on your phone as your desktop.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="pb-24 text-center border-t border-white/10 pt-14 sm:pt-24">
          <h2 className="text-[24px] sm:text-[36px] font-bold tracking-tight">
            Your first prediction is a minute away.
          </h2>

          <p className="mt-3 text-base text-slate-400 max-w-md mx-auto">
            Create an account, fund your wallet, and back your first market.
          </p>

          <div className="mt-8">
            <Button
              asChild
              className="h-12 rounded-2xl px-6 text-base hover:opacity-80 transition-opacity"
            >
              <Link href="/signup" className="flex items-center gap-2">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Global reach */}
        <section className="relative pb-24 text-center border-t border-white/10 pt-14 sm:pt-24">
          <span className="text-xs font-normal uppercase tracking-widest text-slate-500">
            Worldwide
          </span>

          <h2 className="mt-2 text-[24px] sm:text-[36px] font-bold tracking-tight">
            Traders on every continent.
          </h2>

          <p className="mt-3 text-base text-slate-400 max-w-xl mx-auto">
            Forecast is live across the globe. Watch activity connect continents
            as forecasters everywhere price the same markets.
          </p>

          <div className="mt-10 relative select-none pointer-events-none">
            <Globe />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="max-w-300 mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500">
            © {new Date().getFullYear()} Forecast by anomaly. All rights
            reserved.
          </span>

          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link
              href="/contact-us"
              className="hover:text-white hover:opacity-80 transition-all"
            >
              Contact
            </Link>

            <Link
              href="/tos"
              className="hover:text-white hover:opacity-80 transition-all"
            >
              Terms
            </Link>

            <Link
              href="/privacy"
              className="hover:text-white hover:opacity-80 transition-all"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageClient;
