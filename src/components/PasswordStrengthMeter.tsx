import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showRules?: boolean;
}

export interface PasswordAnalysis {
  score: number; // 0 - 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasMinLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePassword(password: string): PasswordAnalysis {
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let passedCount = 0;
  if (hasMinLength) passedCount++;
  if (hasLower) passedCount++;
  if (hasUpper) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecial) passedCount++;

  let label: PasswordAnalysis['label'] = 'Very Weak';
  let color = 'bg-red-500';

  if (password.length === 0) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-gray-200 dark:bg-gray-700',
      hasMinLength: false,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  if (passedCount <= 2) {
    label = 'Weak';
    color = 'bg-red-500';
  } else if (passedCount === 3) {
    label = 'Fair';
    color = 'bg-amber-500';
  } else if (passedCount === 4) {
    label = 'Good';
    color = 'bg-blue-500';
  } else {
    label = 'Strong';
    color = 'bg-emerald-500';
  }

  return {
    score: passedCount,
    label,
    color,
    hasMinLength,
    hasLower,
    hasUpper,
    hasNumber,
    hasSpecial,
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRules = true,
}) => {
  const analysis = evaluatePassword(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">Password Strength:</span>
          <span className={`font-semibold ${
            analysis.label === 'Strong' ? 'text-emerald-600 dark:text-emerald-400' :
            analysis.label === 'Good' ? 'text-blue-600 dark:text-blue-400' :
            analysis.label === 'Fair' ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'
          }`}>
            {analysis.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
          <div className={`h-full rounded-full transition-all duration-300 ${analysis.score >= 1 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full rounded-full transition-all duration-300 ${analysis.score >= 3 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full rounded-full transition-all duration-300 ${analysis.score >= 4 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full rounded-full transition-all duration-300 ${analysis.score >= 5 ? analysis.color : 'bg-transparent'}`} />
        </div>
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1 text-gray-500 dark:text-gray-400">
          <div className={`flex items-center gap-1.5 ${analysis.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
            {analysis.hasMinLength ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <X className="w-3 h-3 text-gray-400 shrink-0" />}
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasUpper && analysis.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
            {analysis.hasUpper && analysis.hasLower ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <X className="w-3 h-3 text-gray-400 shrink-0" />}
            <span>Upper & lowercase</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
            {analysis.hasNumber ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <X className="w-3 h-3 text-gray-400 shrink-0" />}
            <span>At least 1 number</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
            {analysis.hasSpecial ? <Check className="w-3 h-3 text-emerald-500 shrink-0" /> : <X className="w-3 h-3 text-gray-400 shrink-0" />}
            <span>Special character (@, $, !, etc.)</span>
          </div>
        </div>
      )}
    </div>
  );
};
