'use client';

import { useState, useEffect } from 'react';
import { adminService, type DashboardStats } from '@/lib/services/adminService';
import { logger } from '@/lib/utils/logger';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: number;
  delay?: number;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, color, trend, delay = 0, isLoading }: StatCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      if (typeof value === 'number' && !isLoading) {
        const duration = 1000;
        const steps = 30;
        const increment = value / steps;
        let current = 0;

        const counter = setInterval(() => {
          current += increment;
          if (current >= value) {
            setAnimatedValue(value);
            clearInterval(counter);
          } else {
            setAnimatedValue(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(counter);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 animate-pulse lg:rounded-2xl lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded mb-2 w-3/4 lg:h-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 lg:h-8"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl lg:w-16 lg:h-16 lg:rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-4 transform transition-all duration-700 hover:scale-105 hover:shadow-xl lg:rounded-2xl lg:p-6 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 mb-1 truncate lg:text-sm lg:mb-2">{title}</p>
          <p className="text-xl font-bold text-gray-900 lg:text-3xl">
            {typeof value === 'number' ? animatedValue.toLocaleString() : value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center mt-1 text-xs lg:mt-2 lg:text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg className={`w-3 h-3 mr-1 lg:w-4 lg:h-4 ${trend >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline lg:inline">{Math.abs(trend)}% from last month</span>
              <span className="sm:hidden lg:hidden">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white text-lg transform transition-transform duration-300 hover:rotate-12 shrink-0 ml-3 lg:w-16 lg:h-16 lg:rounded-2xl lg:text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminService.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError('Failed to load statistics');
      }
    } catch (error) {
      setError('Failed to load statistics');
      logger.error('Error loading stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <p className="text-red-600 text-sm lg:text-base">{error}</p>
          <button 
            onClick={loadStats}
            className="text-red-700 hover:text-red-900 font-medium text-sm lg:text-base"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Generate stat cards with real data or loading state
  const statCards = [
    {
      title: 'Total Doctors',
      value: stats?.totalDoctors ?? 0,
      icon: '👨‍⚕️',
      color: 'bg-blue-500',
      trend: 12,
      delay: 0
    },
    {
      title: 'Total Patients',
      value: stats?.totalPatients ?? 0,
      icon: '🏥',
      color: 'bg-green-500',
      trend: 8,
      delay: 100
    },
    {
      title: 'Cured Patients',
      value: stats?.curedPatients ?? 0,
      icon: '💚',
      color: 'bg-emerald-500',
      trend: 15,
      delay: 200
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: '⏳',
      color: 'bg-yellow-500',
      trend: stats?.pendingApprovals ? (stats.pendingApprovals > 0 ? -5 : 0) : 0,
      delay: 300
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4 lg:gap-6 xl:gap-8 2xl:grid-cols-4 2xl:gap-10">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
