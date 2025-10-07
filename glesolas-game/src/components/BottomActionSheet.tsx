import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import type { ReactNode } from 'react';

interface BottomActionSheetProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}

export function BottomActionSheet({ open, onClose, title, children }: BottomActionSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - reduced blur so content above is still visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t-2 border-primary/50 shadow-2xl max-h-[70vh] overflow-hidden flex flex-col"
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            {(title || onClose) && (
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0 ml-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <div className="p-4 pb-8 safe-area-bottom">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ActionSheetButtonProps {
  onClick: () => void;
  disabled?: boolean;
  locked?: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline';
}

export function ActionSheetButton({
  onClick,
  disabled,
  locked,
  title,
  description,
  icon,
  variant = 'default'
}: ActionSheetButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || locked}
      variant={locked ? 'outline' : variant}
      className="w-full h-auto p-4 text-left justify-start whitespace-normal min-h-[80px]"
    >
      <div className="flex items-start gap-3 w-full">
        {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-base">{title}</span>
            {locked && <span className="text-xs text-destructive">🔒 Locked</span>}
          </div>
          {description && (
            <p className={`text-sm whitespace-normal ${locked ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    </Button>
  );
}
