'use client';

import { useState, useEffect, useMemo } from 'react';
import { doctorService, DoctorStats as DoctorStatsData } from '@/lib/services/doctorService';
import { authService } from '@/lib/services/auth';
import { DOCTOR_STATS_LABELS } from '@/lib/constants/doctor';
import { useToast } from '@/lib/hooks/useToast';
import { logger } from '@/lib/utils/logger';

// Memoized stat card component
const StatCard = ({ stat, index }: { stat: any; index: number }) => (
  <div className={`${stat.bgColor} rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
        {stat.icon}
      </div>
      <div className={`text-xs font-medium px-2 py-1 rounded-full ${
        stat.changeType === 'positive' 
          ? 'bg-green-100 text-green-600' 
          : stat.changeType === 'warning'
          ? 'bg-yellow-100 text-yellow-600'
          : stat.changeType === 'neutral'
          ? 'bg-gray-100 text-gray-600'
          : 'bg-red-100 text-red-600'
      }`}>
        {stat.change}
      </div>
    </div>
    
    <div>
      <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
        {typeof stat.value === 'number' && !stat.title.includes('Rating')
          ? stat.value.toLocaleString() 
          : stat.value
        }
      </p>
      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
    </div>
  </div>
);

export function DoctorStats() {
  const { error } = useToast();
  const [stats, setStats] = useState<DoctorStatsData>({
    totalPatients: 0,
    activePatients: 0,
    curedPatients: 0,
    pendingApprovals: 0,
    thisMonthVisits: 0,
    averageRating: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.doctorUID) {
        error('Doctor UID not found');
        setIsLoading(false);
        return;
      }

      const response = await doctorService.getStats(user.doctorUID);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      logger.error('Failed to fetch doctor stats', err);
      error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = useMemo(() => [
    {
      title: DOCTOR_STATS_LABELS.TOTAL_PATIENTS,
      value: stats.totalPatients,
      change: stats.totalPatients > 0 ? 'Real data' : 'No data',
      changeType: stats.totalPatients > 0 ? 'positive' : 'neutral',
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: DOCTOR_STATS_LABELS.ACTIVE_TREATMENTS,
      value: stats.activePatients,
      change: stats.activePatients > 0 ? 'Real data' : 'No data',
      changeType: stats.activePatients > 0 ? 'positive' : 'neutral',
      icon: '🩺',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: DOCTOR_STATS_LABELS.CURED_PATIENTS,
      value: stats.curedPatients,
      change: stats.curedPatients > 0 ? 'Real data' : 'No data',
      changeType: stats.curedPatients > 0 ? 'positive' : 'neutral',
      icon: '✅',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      title: DOCTOR_STATS_LABELS.PENDING_APPROVALS,
      value: stats.pendingApprovals,
      change: stats.pendingApprovals > 0 ? 'Needs attention' : 'All approved',
      changeType: stats.pendingApprovals > 0 ? 'warning' : 'positive',
      icon: '⏳',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ], [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-8 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
}
