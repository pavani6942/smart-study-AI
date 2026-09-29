import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
  showRules?: boolean;
}

export interface PasswordAnalysis {
  score: number; // 0 - 5
  label: 'VERY_WEAK' | 'WEAK' | 'MODERATE' | 'SUFFICIENT' | 'HARDENED';
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

  let label: PasswordAnalysis['label'] = 'VERY_WEAK';
  let color = 'bg-red-600';

  if (password.length === 0) {
    return {
      score: 0,
      label: 'VERY_WEAK',
      color: 'bg-transparent',
      hasMinLength: false,
      hasLower: false,
      hasUpper: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  if (passedCount <= 2) {
    label = 'WEAK';
    color = 'bg-red-600';
  } else if (passedCount === 3) {
    label = 'MODERATE';
    color = 'bg-amber-500';
  } else if (passedCount === 4) {
    label = 'SUFFICIENT';
    color = 'bg-[#0047ff]';
  } else {
    label = 'HARDENED';
    color = 'bg-[#18181a]';
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
        <div className="flex justify-between items-center font-mono-tech text-[10px]">
          <span className="text-[#18181a]/60 uppercase tracking-wider">ENTROPY_RATING:</span>
          <span className={`font-bold tracking-wider ${
            analysis.label === 'HARDENED' ? 'text-[#18181a]' :
            analysis.label === 'SUFFICIENT' ? 'text-[#0047ff]' :
            analysis.label === 'MODERATE' ? 'text-amber-600' : 'text-red-600'
          }`}>
            [{analysis.label}]
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-1.5 w-full bg-[#18181a]/10 p-0.5">
          <div className={`h-full transition-all duration-300 ${analysis.score >= 1 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.score >= 2 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.score >= 3 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.score >= 4 ? analysis.color : 'bg-transparent'}`} />
          <div className={`h-full transition-all duration-300 ${analysis.score >= 5 ? analysis.color : 'bg-transparent'}`} />
        </div>
      </div>

      {/* Rules Checklist */}
      {showRules && (
        <div className="grid grid-cols-2 gap-1 font-mono-tech text-[10px] pt-1 text-[#18181a]/60">
          <div className={`flex items-center gap-1.5 ${analysis.hasMinLength ? 'text-[#0047ff] font-bold' : ''}`}>
            {analysis.hasMinLength ? <Check className="w-3 h-3 text-[#0047ff] shrink-0" /> : <X className="w-3 h-3 text-[#18181a]/30 shrink-0" />}
            <span>MIN_8_CHARS</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasUpper && analysis.hasLower ? 'text-[#0047ff] font-bold' : ''}`}>
            {analysis.hasUpper && analysis.hasLower ? <Check className="w-3 h-3 text-[#0047ff] shrink-0" /> : <X className="w-3 h-3 text-[#18181a]/30 shrink-0" />}
            <span>MIXED_CASE</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasNumber ? 'text-[#0047ff] font-bold' : ''}`}>
            {analysis.hasNumber ? <Check className="w-3 h-3 text-[#0047ff] shrink-0" /> : <X className="w-3 h-3 text-[#18181a]/30 shrink-0" />}
            <span>NUMERIC_DIGIT</span>
          </div>
          <div className={`flex items-center gap-1.5 ${analysis.hasSpecial ? 'text-[#0047ff] font-bold' : ''}`}>
            {analysis.hasSpecial ? <Check className="w-3 h-3 text-[#0047ff] shrink-0" /> : <X className="w-3 h-3 text-[#18181a]/30 shrink-0" />}
            <span>SPECIAL_SYMBOL</span>
          </div>
        </div>
      )}
    </div>
  );
};
