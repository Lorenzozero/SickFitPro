import dynamic from 'next/dynamic';
import React from 'react';

// Utility to create safe dynamic imports for Recharts components
// This prevents TypeScript errors with defaultProps type incompatibilities
function createSafeDynamic<T = any>(componentName: string) {
  return dynamic(async () => {
    const recharts = await import('recharts');
    const Component = (recharts as any)[componentName];
    const WrappedComponent = (props: T) => React.createElement(Component, props);
    return WrappedComponent;
  }, { ssr: false });
}

// Lazy load heavy Recharts components only on client with safe wrappers
const ResponsiveContainer = createSafeDynamic('ResponsiveContainer');
const LineChart = createSafeDynamic('LineChart');
const XAxis = createSafeDynamic('XAxis');
const YAxis = createSafeDynamic('YAxis');
const Tooltip = createSafeDynamic('Tooltip');
const CartesianGrid = createSafeDynamic('CartesianGrid');
const Line = createSafeDynamic('Line');

export interface LazyLineChartProps {
  data: Array<Record<string, number | string>>;
  xKey: string;
  yKey: string;
  height?: number;
}

export function LazyLineChart({ data, xKey, yKey, height = 260 }: LazyLineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke="#8884d8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
