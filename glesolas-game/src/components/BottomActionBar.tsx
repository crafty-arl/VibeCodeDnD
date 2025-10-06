import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ReactNode } from 'react';

interface BottomActionBarProps {
  children: ReactNode;
  show?: boolean;
}

export function BottomActionBar({ children, show = true }: BottomActionBarProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border shadow-2xl"
    >
      <div className="max-w-4xl mx-auto p-4">
        {children}
      </div>
    </motion.div>
  );
}

interface PrimaryActionProps {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: 'default' | 'outline' | 'destructive';
  className?: string;
}

export function PrimaryAction({ onClick, disabled, children, variant = 'default', className }: PrimaryActionProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size="lg"
      className={className || "w-full h-12 text-base font-semibold"}
    >
      {children}
    </Button>
  );
}

interface SplitActionProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
}

export function SplitAction({ primaryAction, secondaryAction }: SplitActionProps) {
  return (
    <div className="flex gap-3">
      {secondaryAction && (
        <Button
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          variant="outline"
          size="lg"
          className="flex-1 h-12 text-base font-semibold"
        >
          {secondaryAction.label}
        </Button>
      )}
      <Button
        onClick={primaryAction.onClick}
        disabled={primaryAction.disabled}
        variant="default"
        size="lg"
        className={`h-12 text-base font-semibold ${secondaryAction ? 'flex-1' : 'w-full'}`}
      >
        {primaryAction.label}
      </Button>
    </div>
  );
}
