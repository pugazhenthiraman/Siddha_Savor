'use client';

import { DoctorStats } from '@/lib/types/doctor';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
}

function StatsCard({ icon, label, value, bgColor, textColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4 lg:p-6`}>
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 lg:w-12 lg:h-12 ${textColor} rounded-lg flex items-center justify-center text-white`}>
          <span className="text-lg lg:text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-lg lg:text-xl font-semibold text-black">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface DoctorStatsGridProps {
  stats: DoctorStats;
}

export function DoctorStatsGrid({ stats }: DoctorStatsGridProps) {
  const statsConfig = [
    {
      icon: '👥',
      label: 'Total Patients',
      value: stats.totalPatients,
      bgColor: 'bg-blue-50',
      textColor: 'bg-blue-500'
    },
    {
      icon: '✅',
      label: 'Active Patients',
      value: stats.activePatients,
      bgColor: 'bg-green-50',
      textColor: 'bg-green-500'
    },
    {
      icon: '🏥',
      label: 'Cured Patients',
      value: stats.curedPatients,
      bgColor: 'bg-purple-50',
      textColor: 'bg-purple-500'
    },
    {
      icon: '📊',
      label: 'Vitals Recorded',
      value: stats.totalVitals,
      bgColor: 'bg-orange-50',
      textColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statsConfig.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
