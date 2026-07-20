'use client';

import { ButtonProps } from '../types';
import { cn } from '../lib/utils';

export default function Button({ 
  variant = 'primary', 
  children, 
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-10 py-4 font-fredoka text-lg font-bold tracking-wide uppercase transition-all duration-400 relative overflow-hidden';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-[#FF6B35] text-light-text shadow-[0_4px_20px_rgba(255,51,102,0.4)] hover:shadow-[0_8px_30px_rgba(255,51,102,0.6)] hover:-translate-y-1',
    secondary: 'bg-transparent text-light-text border-2 border-secondary shadow-[0_4px_20px_rgba(0,245,255,0.3)] hover:bg-secondary hover:text-dark-bg hover:shadow-[0_8px_30px_rgba(0,245,255,0.5)] hover:-translate-y-1',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {variant === 'primary' && (
        <span className="absolute top-1/2 left-1/2 w-0 h-0 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-600 group-hover:w-[300px] group-hover:h-[300px]" />
      )}
    </button>
  );
}
