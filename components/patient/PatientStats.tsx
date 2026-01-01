'use client';

import { useState, useEffect } from 'react';

export function PatientStats() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    prescriptions: 0,
    treatments: 0,
  });

  useEffect(() => {
    // TODO: Fetch actual patient stats from API
    // For now, using mock data
    setStats({
      totalAppointments: 0,
      upcomingAppointments: 0,
      prescriptions: 0,
      treatments: 0,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: '📅',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: '⏰',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
    },
    {
      title: 'Active Prescriptions',
      value: stats.prescriptions,
      icon: '💊',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Treatments',
      value: stats.treatments,
      icon: '🩺',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${stat.bgColor} rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:justify-between">
            <div className="text-center sm:text-left mb-2 sm:mb-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white text-lg sm:text-xl lg:text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
