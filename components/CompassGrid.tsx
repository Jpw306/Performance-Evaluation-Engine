"use client";

import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Member {
  id: string;
  name: string;
  photoIcon?: string;
  commits: number;
  winRate: number;
}

interface Props {
  members: Member[];
}

export default function CompassGrid({ members }: Props) {
  const data = useMemo(() => {
    return members.map((m) => ({
      name: m.name,
      commits: m.commits,
      winRate: Number((m.winRate * 100).toFixed(1)),
      score: m.commits + m.winRate * 100,
      avatar: m.photoIcon,
    }));
  }, [members]);

  const COLORS = {
    high: "#FFD700",
    mid: "#1A8FE3",
    low: "#945021",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-clash-dark px-4 py-3 rounded-lg border-2 border-clash-gold shadow-lg">
          <p className="font-clash text-sm text-clash-gold uppercase font-bold">{d.name}</p>
          <p className="text-xs text-clash-light mt-1">Commits: {d.commits}</p>
          <p className="text-xs text-clash-light">Win Rate: {d.winRate}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-[800px] bg-gradient-to-b from-clash-dark to-clash-black rounded-2xl border-[3px] border-clash-goldDark p-6 shadow-[0_8px_0_#945021,0_12px_24px_rgba(0,0,0,0.5)]">
      <h3 className="font-clash text-2xl uppercase tracking-tightest text-clash-gold mb-4 text-center">
        Group Performance
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,215,0,0.2)" />
          <XAxis
            type="number"
            dataKey="commits"
            name="Commits"
            stroke="#F5F6FA"
            label={{
              value: "Commits",
              position: "insideBottom",
              offset: -10,
              style: { fill: "#FFD700", fontWeight: 700, fontSize: 14 },
            }}
          />
          <YAxis
            type="number"
            dataKey="winRate"
            name="Win Rate"
            stroke="#F5F6FA"
            label={{
              value: "Win Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#FFD700", fontWeight: 700, fontSize: 14 },
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#FFD700" }} />
          <Scatter data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.score > 100
                    ? COLORS.high
                    : entry.score > 50
                    ? COLORS.mid
                    : COLORS.low
                }
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
