import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface ExpandableNarrativeProps {
  text: string;
  maxLength?: number;
  className?: string;
  variant?: string;
}

export function ExpandableNarrative({ text, maxLength = 400, className = '' }: ExpandableNarrativeProps) {
  const [expanded, setExpanded] = useState(true); // Start expanded by default
  const shouldTruncate = text.length > maxLength;
  const displayText = expanded || !shouldTruncate ? text : text.slice(0, maxLength) + '...';

  return (
    <div className={`space-y-2 ${className}`}>
      <motion.p
        className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {displayText}
      </motion.p>

      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground -ml-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Read more
            </>
          )}
        </Button>
      )}
    </div>
  );
}

interface NarrativeCardProps {
  title: string;
  text: string;
  icon?: React.ReactNode;
  maxLength?: number;
  children?: React.ReactNode;
  borderColor?: string;
}

export function NarrativeCard({
  title,
  text,
  icon,
  maxLength = 600,
  children,
  borderColor = 'border-accent/50'
}: NarrativeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-lg border-2 ${borderColor} p-4 space-y-4`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <ExpandableNarrative text={text} maxLength={maxLength} />
      {children}
    </motion.div>
  );
}
