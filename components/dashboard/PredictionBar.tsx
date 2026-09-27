"use client";

import { isMultiOutcomeMarket } from "@/types/market";

const OUTCOME_COLORS = [
  { bg: "#2563EB", dot: "rgba(37,99,235,0.8)", border: "rgba(37,99,235,0.3)", bgFaint: "rgba(37,99,235,0.1)" },
  { bg: "#9333EA", dot: "rgba(147,51,234,0.8)", border: "rgba(147,51,234,0.3)", bgFaint: "rgba(147,51,234,0.1)" },
  { bg: "#F59E0B", dot: "rgba(245,158,11,0.8)", border: "rgba(245,158,11,0.3)", bgFaint: "rgba(245,158,11,0.1)" },
  { bg: "#10B981", dot: "rgba(16,185,129,0.8)", border: "rgba(16,185,129,0.3)", bgFaint: "rgba(16,185,129,0.1)" },
  { bg: "#F43F5E", dot: "rgba(244,63,94,0.8)", border: "rgba(244,63,94,0.3)", bgFaint: "rgba(244,63,94,0.1)" },
];

export default function PredictionBar({ market }: { market: any }) {
  const isMulti = isMultiOutcomeMarket(market);

  if (isMulti) {
    return (
      <div data-tour="outcome-odds" style={{ width: "100%", fontFamily: "inherit" }}>
        {/* Labels */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          {market.outcomes.map((outcome: any, idx: number) => {
            const color = OUTCOME_COLORS[idx % OUTCOME_COLORS.length];
            return (
              <div
                key={outcome.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: color.bgFaint,
                  border: `1px solid ${color.border}`,
                  borderRadius: "10px",
                  padding: "6px 12px",
                  backdropFilter: "blur(12px)",
                  fontSize: "11px",
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase" as const,
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: color.bg,
                    boxShadow: `0 0 8px ${color.dot}`,
                  }}
                />
                <span style={{ color: "#64748b" }}>{outcome.name}</span>
                <span style={{ color: "#fff" }}>{outcome.percentage}%</span>
              </div>
            );
          })}
        </div>

        {/* Multi-segment bar */}
        {market.outcomes.length < 5 && (
          <div
            style={{
              display: "flex",
              height: "48px",
              borderRadius: "14px",
              overflow: "hidden",
              width: "100%",
            }}
          >
            {market.outcomes.map((outcome: any, idx: number) => {
              const color = OUTCOME_COLORS[idx % OUTCOME_COLORS.length];
              return (
                <div
                  key={outcome.id}
                  style={{
                    width: `${outcome.percentage}%`,
                    background: color.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 900,
                    color: "#fff",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase" as const,
                    transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    whiteSpace: "nowrap" as const,
                    paddingInline: "8px",
                    overflow: "hidden",
                  }}
                >
                  {outcome.percentage >= 15
                    ? `${outcome.name} ${outcome.percentage}%`
                    : `${outcome.percentage}%`}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Binary market (existing logic)
  const { buy_percentage, sell_percentage } = market;
  const yesPrice = (buy_percentage / 100).toFixed(2);
  const noPrice = (sell_percentage / 100).toFixed(2);

  return (
    <div data-tour="outcome-odds" style={{ width: "100%", fontFamily: "inherit" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "12px",
          fontSize: "11px",
          fontWeight: 900,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.3)",
            borderRadius: "10px",
            padding: "6px 12px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 8px rgba(59,130,246,0.8)",
            }}
          />
          <span style={{ color: "#64748b" }}>Yes</span>
          <span style={{ color: "#fff" }}>${yesPrice}</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(220,38,38,0.1)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: "10px",
            padding: "6px 12px",
            backdropFilter: "blur(12px)",
          }}
        >
          <span style={{ color: "#fff" }}>${noPrice}</span>
          <span style={{ color: "#64748b" }}>No</span>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 8px rgba(239,68,68,0.8)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          height: "48px",
          borderRadius: "14px",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            width: `${buy_percentage}%`,
            background: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            whiteSpace: "nowrap",
            paddingInline: "12px",
          }}
        >
          Yes {buy_percentage}%
        </div>

        <div
          style={{
            width: `${sell_percentage}%`,
            background: "#DC2626",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            whiteSpace: "nowrap",
            paddingInline: "12px",
          }}
        >
          No {sell_percentage}%
        </div>
      </div>
    </div>
  );
}
