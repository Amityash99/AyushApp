import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data, dataKey, xKey }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={dataKey} fill="#1e3a6f" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;