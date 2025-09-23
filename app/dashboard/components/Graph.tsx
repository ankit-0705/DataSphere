"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ActivityDataPoint {
  month: string;
  datasets: number;
  likes: number;
  comments: number;
}

interface Props {
  data: ActivityDataPoint[];
}

// Define proper types for Tooltip props based on Recharts definitions
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    [key: string]: unknown;
  }> | null;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: "rgba(18, 18, 18, 0.85)", // darker transparent bg
        padding: "6px 10px",
        borderRadius: 8,
        color: "#f9fafb",
        fontSize: 12,
        pointerEvents: "none",
        boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
        maxWidth: 180,
      }}
    >
      <strong>{label}</strong>
      {payload.map((entry) => (
        <div key={entry.name}>
          {entry.name}: {entry.value}
        </div>
      ))}
    </div>
  );
};

const DatasetActivityBarChart: React.FC<Props> = ({ data }) => {
  return (
    <div
      className="w-full h-[320px] rounded-2xl p-6 border bg-white/5
        backdrop-blur-md
        border-white/20
        shadow-md shadow-white/10
        z-30
        text-gray-200"
    >
      <h2 className="text-xl font-bold text-white tracking-wide">
        Monthly Contribution Activity
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          barCategoryGap="20%"
          maxBarSize={35}
        >
          {/* Monochromatic axes */}
          <XAxis dataKey="month" stroke="#d1d5db" />
          <YAxis stroke="#d1d5db" allowDecimals={false} />

          {/* Custom Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend styling */}
          <Legend
            wrapperStyle={{ color: "#d1d5db", fontWeight: 500 }}
            verticalAlign="top"
            height={36}
          />

          {/* Bars with monochromatic shades and no hover highlight */}
          <Bar
            dataKey="datasets"
            name="Datasets Uploaded"
            fill="#f3f4f6"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            fillOpacity={1}
          />
          <Bar
            dataKey="likes"
            name="Likes"
            fill="#9ca3af"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            fillOpacity={1}
          />
          <Bar
            dataKey="comments"
            name="Comments"
            fill="#4b5563"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            fillOpacity={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DatasetActivityBarChart;
