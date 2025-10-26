"use client";

import { useMemo } from "react";
import Image from "next/image";
import { mockPlayers as dataPlayers } from "@/lib/mockData";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";

interface Player {
  id: number;
  name: string;
  commits: number;
  wins: number;
  losses: number;
  avatar?: string;
}

interface ChartDataPoint {
  name: string;
  commits: number;
  winRate: number;
  score: number;
  avatar?: string;
}

export default function PerformanceBubbleChart() {
  const chartData = useMemo(() => {
    return dataPlayers.map((p: Player) => ({
      name: p.name,
      commits: p.commits,
      winRate: Number(((p.wins / (p.wins + p.losses || 1)) * 100).toFixed(1)),
      score: p.commits + (p.wins / (p.wins + p.losses || 1)) * 100,
      avatar: p.avatar,
    }));
  }, []);

  const COLORS = {
    high: "#FFD700",
    mid: "#1A8FE3",
    low: "#945021",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDataPoint;
      return (
        <div className="bg-clash-dark px-4 py-3 rounded-lg border-2 border-clash-gold shadow-lg">
          <p className="font-clash text-sm text-clash-gold uppercase font-bold">
            {data.name}
          </p>
          <p className="text-xs text-clash-light mt-1">
            Commits: {data.commits}
          </p>
          <p className="text-xs text-clash-light">
            Win Rate: {data.winRate}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-[800px] bg-clash-dark rounded-2xl border-[3px] border-clash-goldDark p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-clash text-2xl uppercase tracking-tightest text-clash-gold">
          Performance Analysis
        </h3>
        <p className="text-sm text-clash-light/70 font-clash uppercase tracking-tightest mt-1">
          Commits vs Win Rate
        </p>
      </div>

      {/* Chart */}
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
              style: { fill: "#FFD700", fontWeight: 700, fontSize: 14 }
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
              style: { fill: "#FFD700", fontWeight: 700, fontSize: 14 }
            }}
          />
          
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#FFD700" }}
            content={<CustomTooltip />}
          />
          
          <Scatter data={chartData} fill="#1A8FE3">
            {chartData.map((entry, index) => (
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

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFD700]" />
          <span className="text-xs text-clash-light font-clash uppercase">High Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#1A8FE3]" />
          <span className="text-xs text-clash-light font-clash uppercase">Mid Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#945021]" />
          <span className="text-xs text-clash-light font-clash uppercase">Low Performer</span>
        </div>
      </div>
    </div>
  );
}