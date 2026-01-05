'use client';

import { THEGI_INFO, ThegiType } from '@/lib/constants/thegi';

interface ThegiCardProps {
  thegi: string;
}

export function ThegiCard({ thegi }: ThegiCardProps) {
  const thegiInfo = THEGI_INFO[thegi as ThegiType];

  if (!thegiInfo) {
    return null;
  }

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      icon: 'bg-blue-100'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      accent: 'text-red-600',
      icon: 'bg-red-100'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      accent: 'text-green-600',
      icon: 'bg-green-100'
    }
  };

  const colors = colorClasses[thegiInfo.color as keyof typeof colorClasses];

  const getElementIcon = (element: string) => {
    if (element.includes('Air')) return '💨';
    if (element.includes('Fire')) return '🔥';
    if (element.includes('Water')) return '💧';
    return '⚡';
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 sm:p-6`}>
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center mr-4`}>
          <span className="text-2xl">{getElementIcon(thegiInfo.element)}</span>
        </div>
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            {thegiInfo.name}
          </h3>
          <p className={`text-sm ${colors.accent} font-medium`}>
            {thegiInfo.element}
          </p>
          <p className={`text-xs ${colors.accent}`}>
            {thegiInfo.description}
          </p>
        </div>
      </div>

      <div>
        <h4 className={`text-sm font-semibold ${colors.text} mb-3`}>
          Your Body Constitution Characteristics:
        </h4>
        <ul className="space-y-2">
          {thegiInfo.characteristics.map((characteristic, index) => (
            <li key={index} className={`flex items-start text-sm ${colors.text}`}>
              <span className={`${colors.accent} mr-2 mt-0.5 flex-shrink-0`}>•</span>
              <span>{characteristic}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-4 p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
        <p className={`text-xs ${colors.accent} font-medium`}>
          💡 This assessment helps your doctor create a personalized Siddha treatment plan for you.
        </p>
      </div>
    </div>
  );
}
