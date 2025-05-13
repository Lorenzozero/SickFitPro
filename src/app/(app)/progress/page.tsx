'use client';

import { useState, type ChangeEvent } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { LineChart, UploadCloud, BarChart, Users } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Line, Legend as RechartsLegend, LineProps, BarProps } from "recharts"
import { ChartConfig } from '@/components/ui/chart';

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Bench Press (kg)",
    color: "hsl(var(--chart-1))",
    icon: LineChart,
  },
  mobile: {
    label: "Squat (kg)",
    color: "hsl(var(--chart-2))",
    icon: BarChart,
  },
} satisfies ChartConfig


export default function ProgressPage() {
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>, setImage: (url: string | null) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <PageHeader
        title="Progress Tracking"
        description="Visualize your fitness journey and celebrate your achievements."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-primary" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Track your key lifts and measurements over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPrimitiveLineChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis />
                  <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                  <RechartsLegend content={<ChartLegendContent />} />
                  <Line
                    dataKey="desktop"
                    type="monotone"
                    stroke="var(--color-desktop)"
                    strokeWidth={2}
                    dot={false}
                    name="Bench Press (kg)"
                  />
                  <Line
                    dataKey="mobile"
                    type="monotone"
                    stroke="var(--color-mobile)"
                    strokeWidth={2}
                    dot={false}
                    name="Squat (kg)"
                  />
                </RechartsPrimitiveLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Body Composition
            </CardTitle>
            <CardDescription>Monitor changes in weight, body fat, etc.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{ weight: { label: 'Weight (kg)', color: 'hsl(var(--chart-3))' } }} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPrimitiveBarChart data={chartData.map(d => ({...d, weight: d.desktop / 2 + 50}))}> {/* Mocking weight data */}
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                        <YAxis dataKey="weight" />
                        <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <RechartsLegend content={<ChartLegendContent />} />
                        <Bar dataKey="weight" fill="var(--color-weight)" radius={4} name="Weight (kg)" />
                    </RechartsPrimitiveBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Photo Comparison</CardTitle>
          <CardDescription>Visually track your transformation. Upload 'before' and 'after' photos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {[
            { title: 'Before Photo', photo: photoBefore, setPhoto: setPhotoBefore, hint: "fitness before" },
            { title: 'After Photo', photo: photoAfter, setPhoto: setPhotoAfter, hint: "fitness after" }
          ].map(item => (
            <div key={item.title}>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <div className="relative w-full overflow-hidden border-2 border-dashed rounded-lg aspect-square border-border group">
                {item.photo ? (
                  <Image src={item.photo} alt={item.title} layout="fill" objectFit="cover" data-ai-hint={item.hint} />
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No photo uploaded</p>
                  </div>
                )}
                <label
                  htmlFor={`upload-${item.title.toLowerCase().replace(' ', '-')}`}
                  className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white transition-opacity duration-300 bg-black/50 opacity-0 cursor-pointer group-hover:opacity-100"
                >
                  Click to upload
                  <Input
                    id={`upload-${item.title.toLowerCase().replace(' ', '-')}`}
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, item.setPhoto)}
                  />
                </label>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => document.getElementById(`upload-${item.title.toLowerCase().replace(' ', '-')}`)?.click()}>
                Upload {item.title}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

// Recharts components need to be aliased to avoid conflicts if not already done in ui/chart.tsx
// For simplicity, directly using Recharts components here.
const RechartsPrimitiveLineChart = LineChart;
const RechartsPrimitiveBarChart = BarChart;

