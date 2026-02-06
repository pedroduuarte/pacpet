import React from "react";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer
} from "recharts";

export default function FeedingsPieChart({ data }) {
  const manual = data.filter(i => i.type === "manual").length;
  const automatic = data.filter(i => i.type === "automatic").length;

  const chartData = [
    { name: "Manual", value: manual },
    { name: "Automático", value: automatic }
  ];

  return (
    <>
      <h3>Tipo de liberação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}
