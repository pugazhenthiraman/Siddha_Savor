'use client';

import { useState, useEffect } from 'react';

interface DoctorStatsData {
  totalPatients: number;
  todayAppointments: number;
  pendingReviews: number;
  completedToday: number;
  thisWeekPatients: number;
  thisMonthRevenue: number;
}

export function DoctorStats() {
  const [stats, setStats] = useState<DoctorStatsData>({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReviews: 0,
    completedToday: 0,
    thisWeekPatients: 0,
    thisMonthRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API
    setTimeout(() => {
      setStats({
        totalPatients: 24,
        todayAppointments: 8,
        pendingReviews: 3,
        completedToday: 5,
        thisWeekPatients: 12,
        thisMonthRevenue: 15000,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      change: '+12%',
      changeType: 'positive',
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      change: '+3 from yesterday',
      changeType: 'positive',
      icon: '📅',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      change: '-2 from yesterday',
      changeType: 'negative',
      icon: '📋',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      change: '+1 from yesterday',
      changeType: 'positive',
      icon: '✅',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'This Week Patients',
      value: stats.thisWeekPatients,
      change: '+8%',
      changeType: 'positive',
      icon: '📈',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.thisMonthRevenue.toLocaleString()}`,
      change: '+15%',
      changeType: 'positive',
      icon: '💰',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
        {[...Array(6)].map((_, i) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {stat.icon}
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full ${
              stat.changeType === 'positive' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-red-100 text-red-600'
            }`}>
              {stat.change}
            </div>
          </div>
          
          <div>
            <p className={`text-2xl font-bold ${stat.textColor} mb-1`}>
              {typeof stat.value === 'number' && stat.title !== 'Monthly Revenue' 
                ? stat.value.toLocaleString() 
                : stat.value
              }
            </p>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
