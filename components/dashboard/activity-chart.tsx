import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ActivityChartProps {
  data?: Array<{
    time: string;
    activity: number;
    baseline: number;
  }>;
  className?: string;
}

export const ActivityChart = ({ data, className }: ActivityChartProps) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  if (isMobile) {
    return (
      <Card className={cn("w-full bg-[#141716]/50 backdrop-blur-sm", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            24h Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#99FF19" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#99FF19" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                  tickFormatter={(value) => value.split(':')[0]}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1c1c',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    padding: '4px 8px',
                  }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                  labelStyle={{ color: '#999', fontSize: '11px' }}
                  formatter={(value: number) => [value, '']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="activity"
                  stroke="#99FF19"
                  strokeWidth={1.5}
                  fill="url(#colorActivity)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full bg-[#141716]/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          24h Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="time"
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value) => value.split(':')[0]}
              />
              <YAxis
                stroke="#666"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1c1c',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#999' }}
                formatter={(value: number) => [value, '']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#666"
                strokeWidth={1.5}
                dot={false}
                activeDot={false}
              />
              <Line
                type="monotone"
                dataKey="activity"
                stroke="#99FF19"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  stroke: '#99FF19',
                  strokeWidth: 2,
                  r: 4,
                  fill: '#99FF19'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;