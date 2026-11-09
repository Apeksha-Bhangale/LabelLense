import React from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, MinusCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const norm = (status || '').toUpperCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let icon = <MinusCircle className="w-3.5 h-3.5" />;
  let label = status;

  if (norm === 'PASS' || norm === 'COMPLIANT') {
    bg = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    label = norm === 'PASS' ? 'PASS' : 'COMPLIANT';
  } else if (norm === 'POTENTIAL_VIOLATION' || norm === 'POTENTIAL_VIOLATIONS' || norm === 'VIOLATION') {
    bg = 'bg-red-50 text-red-800 border-red-300';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
    label = norm.includes('POTENTIAL') ? 'POTENTIAL VIOLATION' : 'VIOLATION';
  } else if (norm === 'NEEDS_REVIEW' || norm === 'REVIEW') {
    bg = 'bg-amber-50 text-amber-800 border-amber-300';
    icon = <HelpCircle className="w-3.5 h-3.5 text-amber-600" />;
    label = 'NEEDS REVIEW';
  } else if (norm === 'NOT_APPLICABLE' || norm === 'NA') {
    bg = 'bg-slate-100 text-slate-600 border-slate-200';
    icon = <MinusCircle className="w-3.5 h-3.5 text-slate-400" />;
    label = 'NOT APPLICABLE';
  } else if (norm === 'IN_PROGRESS') {
    bg = 'bg-teal-50 text-teal-800 border-teal-300';
    icon = <Clock className="w-3.5 h-3.5 text-teal-600 animate-spin" />;
    label = 'IN PROGRESS';
  } else if (norm === 'CONFIRMED') {
    bg = 'bg-red-100 text-red-900 border-red-400 font-bold';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-red-700" />;
    label = 'CONFIRMED VIOLATION';
  } else if (norm === 'REJECTED') {
    bg = 'bg-slate-100 text-slate-700 border-slate-300';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    label = 'REJECTED BY INSPECTOR';
  } else if (norm === 'FURTHER_REVIEW') {
    bg = 'bg-amber-100 text-amber-900 border-amber-400';
    icon = <HelpCircle className="w-3.5 h-3.5 text-amber-700" />;
    label = 'FURTHER INQUIRY';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-wide uppercase ${sizeClasses[size]} ${bg} ${className}`}
    >
      {showIcon && icon}
      <span>{label}</span>
    </span>
  );
};
