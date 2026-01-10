'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface VitalRecord {
  id: number;
  tdee?: number;
  bmr?: number;
  recordedAt: string;
  [key: string]: any;
}

interface TDEEChartProps {
  vitalsHistory: VitalRecord[];
  title?: string;
  height?: number;
}

export function TDEEChart({ 
  vitalsHistory = [], 
  title = 'TDEE Trend Analysis',
  height = 400 
}: TDEEChartProps) {
  // Transform vitals data for the chart
  const chartData = vitalsHistory
    .slice()
    .reverse() // Show oldest to newest
    .map((vital, index) => ({
      date: new Date(vital.recordedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      fullDate: new Date(vital.recordedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      tdee: vital.tdee ? Math.round(vital.tdee) : null,
      bmr: vital.bmr ? Math.round(vital.bmr) : null,
      index,
    }))
    .filter(item => item.tdee !== null);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200">
        <p className="text-gray-500 text-center">
          No TDEE data available yet. Record vitals to start tracking.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const tdeeValues = chartData.map(d => d.tdee).filter(v => v !== null) as number[];
  const minTdee = Math.min(...tdeeValues);
  const maxTdee = Math.max(...tdeeValues);
  const avgTdee = Math.round(tdeeValues.reduce((a, b) => a + b, 0) / tdeeValues.length);
  const currentTdee = chartData[chartData.length - 1].tdee;
  const previousTdee = chartData.length > 1 ? chartData[chartData.length - 2].tdee : currentTdee;
  const tdeeChange = currentTdee && previousTdee ? currentTdee - previousTdee : 0;
  const tdeeChangePercent = previousTdee && tdeeChange ? ((tdeeChange / previousTdee) * 100).toFixed(1) : '0';

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Monitor your daily energy expenditure trends</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Current TDEE</p>
          <p className="text-2xl lg:text-3xl font-bold text-blue-900">{currentTdee}</p>
          <p className="text-xs text-blue-600 mt-1">kcal/day</p>
        </div>

        <div className={`bg-gradient-to-br ${
          tdeeChange >= 0 
            ? 'from-green-50 to-green-100' 
            : 'from-red-50 to-red-100'
        } rounded-lg p-4`}>
          <p className={`text-sm font-medium mb-1 ${
            tdeeChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>Change</p>
          <p className={`text-2xl lg:text-3xl font-bold ${
            tdeeChange >= 0 ? 'text-green-900' : 'text-red-900'
          }`}>
            {tdeeChange >= 0 ? '+' : ''}{tdeeChange}
          </p>
          <p className={`text-xs mt-1 ${
            tdeeChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>{tdeeChangePercent}% from previous</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium mb-1">Average TDEE</p>
          <p className="text-2xl lg:text-3xl font-bold text-purple-900">{avgTdee}</p>
          <p className="text-xs text-purple-600 mt-1">kcal/day</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium mb-1">Range</p>
          <p className="text-lg lg:text-xl font-bold text-orange-900">{maxTdee - minTdee}</p>
          <p className="text-xs text-orange-600 mt-1">variation</p>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96 lg:h-96 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="tdeeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: 'TDEE (kcal)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: any) => [value ? `${value} kcal` : 'N/A', 'TDEE']}
              labelFormatter={(label) => `Date: ${label}`}
              cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Area
              type="monotone"
              dataKey="tdee"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#tdeeGradient)"
              dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2 }}
              isAnimationActive={true}
              name="TDEE (kcal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">📊 Insight:</span> Your TDEE shows {
            tdeeChange > 0 
              ? 'an increase, indicating higher energy expenditure.' 
              : tdeeChange < 0 
              ? 'a decrease, indicating lower energy expenditure.' 
              : 'stable energy expenditure patterns.'
          }
        </p>
      </div>
    </div>
  );
}
