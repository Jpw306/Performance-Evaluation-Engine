import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Props as RechartsProps } from 'recharts/types/component/DefaultLegendContent';

interface Member {
  id: string;
  name: string;
  photoIcon?: string;
  commits: number;
  winRate: number;
  
}

import { GroupContext } from '@/lib/types';
import { dangerZone } from '@/lib/clash_helper_functions';

interface Props {
  members: Member[];
  groupContext: GroupContext | null;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; commits: number; winRate?: number } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (active && payload?.length) {
    const d = payload[0].payload;
    const safeWinRate = typeof d.winRate === 'number' ? d.winRate : 0;
    return (
      <div className='bg-clash-dark px-4 py-3 rounded-lg border-2 border-clash-gold shadow-lg'>
        <p className='font-clash text-sm text-clash-gold uppercase font-bold'>{d.name}</p>
        <p className='text-xs text-clash-light mt-1'>Commits: {d.commits}</p>
        <p className='text-xs text-clash-light'>Win Rate: {safeWinRate.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
}

type CustomScatterShapeProps = {
  cx?: number;
  cy?: number;
  payload?: {
    id: string;
    avatar: string;
    githubUsername: string;
  };
  usersInDanger: string[];
}

// Custom shape to render user avatars with a yellow border
function CustomScatterShape(props: CustomScatterShapeProps) {
  const { cx = 0, cy = 0, payload, usersInDanger } = props;
  
  if (!payload) {
    return null;
  }

  const avatar = payload.avatar;
  const isInDanger = usersInDanger.includes(payload.githubUsername);

  return (
    <svg x={cx - 20} y={cy - 20} width={40} height={40}>
      {/* Colored border based on danger status */}
      <circle 
        cx="20" 
        cy="20" 
        r="20" 
        fill="none" 
        stroke={isInDanger ? "#ef4444" : "#FFD700"} 
        strokeWidth="2" 
      />
      {isInDanger && (
        <circle 
          cx="20" 
          cy="20" 
          r="20" 
          fill="none" 
          stroke="#ef4444" 
          strokeWidth="2" 
          opacity="0.5"
          className="animate-pulse"
        />
      )}
      <defs>
        <clipPath id={`circleClip-${payload.id}`}>
          <circle cx="20" cy="20" r="18" />
        </clipPath>
      </defs>
      {/* Avatar image */}
      <image
        href={avatar}
        width="40"
        height="40"
        clipPath={`url(#circleClip-${payload.id})`}
      />
    </svg>
  );
}

export default function CompassGrid({ members, groupContext }: Props) {
  // Get list of users in danger zone
  const usersInDanger = useMemo(() => groupContext ? dangerZone(groupContext) : [], [groupContext]);

  const data = useMemo(() => {
    return members.map((m) => ({
      id: m.id, // Include unique ID for clipPath
      name: m.name,
      commits: m.commits,
      winRate: typeof m.winRate === 'number' ? Number(m.winRate.toFixed(1)) : 0,
      score: m.commits + (typeof m.winRate === 'number' ? m.winRate : 0),
      avatar: m.photoIcon, // Include the avatar URL
    }));
  }, [members]);

  return (
    <div className="w-full max-w-[800px] bg-clash-dark rounded-2xl border-4 border-clash-gold p-6 shadow-[0_8px_0_#945021,0_12px_24px_rgba(0,0,0,0.5)]">
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
              value: 'Commits',
              position: 'insideBottom',
              offset: -10,
              style: { fill: '#FFD700', fontWeight: 700, fontSize: 14 },
            }}
          />
          <YAxis
            type="number"
            dataKey="winRate"
            name="Win Rate"
            stroke="#F5F6FA"
            label={{
              value: 'Win Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#FFD700', fontWeight: 700, fontSize: 14 },
            }}
          />
          <Tooltip content={CustomTooltip} cursor={{ strokeDasharray: '3 3', stroke: '#FFD700' }} />
          <Scatter
            data={data}
            // Recharts expects a shape function with a looser param type (unknown).
            // Accept unknown here and cast to our CustomScatterShapeProps before rendering.
            shape={(props: unknown) => {
              const p = props as CustomScatterShapeProps;
              return <CustomScatterShape {...p} usersInDanger={usersInDanger} />;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
