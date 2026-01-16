import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Export dynamically imported Recharts components
// This splits the 180KB Recharts library from the main bundle
// Charts only load when analytics/dev pages are accessed

export const LineChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.LineChart })),
  { loading: () => <Skeleton className="h-64 w-full" />, ssr: false }
);

export const AreaChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.AreaChart })),
  { loading: () => <Skeleton className="h-64 w-full" />, ssr: false }
);

export const BarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  { loading: () => <Skeleton className="h-64 w-full" />, ssr: false }
);

export const PieChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.PieChart })),
  { loading: () => <Skeleton className="h-64 w-full" />, ssr: false }
);

export const XAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.XAxis })), {
  ssr: false,
});
export const YAxis = dynamic(() => import('recharts').then((mod) => ({ default: mod.YAxis })), {
  ssr: false,
});
export const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);
export const Tooltip = dynamic(() => import('recharts').then((mod) => ({ default: mod.Tooltip })), {
  ssr: false,
});
export const Legend = dynamic(() => import('recharts').then((mod) => ({ default: mod.Legend })), {
  ssr: false,
});
export const Line = dynamic(() => import('recharts').then((mod) => ({ default: mod.Line })), {
  ssr: false,
});
export const Area = dynamic(() => import('recharts').then((mod) => ({ default: mod.Area })), {
  ssr: false,
});
export const Bar = dynamic(() => import('recharts').then((mod) => ({ default: mod.Bar })), {
  ssr: false,
});
export const Pie = dynamic(() => import('recharts').then((mod) => ({ default: mod.Pie })), {
  ssr: false,
});
export const Cell = dynamic(() => import('recharts').then((mod) => ({ default: mod.Cell })), {
  ssr: false,
});
export const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);
