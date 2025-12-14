import { InviteRole } from '@/lib/hooks/useInviteLink';

interface RoleSelectorProps {
  selectedRole: InviteRole;
  onRoleChange: (role: InviteRole) => void;
  disabled?: boolean;
}

interface RoleOption {
  value: InviteRole;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'DOCTOR',
    label: 'Doctor',
    description: 'Medical Professional',
    icon: '👨‍⚕️',
    color: 'blue'
  },
  {
    value: 'PATIENT',
    label: 'Patient',
    description: 'Healthcare Recipient',
    icon: '🏥',
    color: 'green'
  }
];

export function RoleSelector({ selectedRole, onRoleChange, disabled = false }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 lg:text-base">
        Select User Role
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roleOptions.map((option) => {
          const isSelected = selectedRole === option.value;
          const colorClasses = {
            blue: isSelected 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
            green: isSelected 
              ? 'border-green-500 bg-green-50 text-green-700' 
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
          };

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && onRoleChange(option.value)}
              disabled={disabled}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                colorClasses[option.color as keyof typeof colorClasses]
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} lg:p-6`}
            >
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="text-2xl lg:text-3xl">{option.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm lg:text-base">{option.label}</p>
                  <p className="text-xs text-gray-500 lg:text-sm">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="text-lg lg:text-xl">✓</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
