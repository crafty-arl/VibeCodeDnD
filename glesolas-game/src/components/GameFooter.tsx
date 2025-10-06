import { motion } from 'framer-motion';

export function GameFooter() {
  return (
    <footer className="safe-area-bottom border-t border-border/50 bg-secondary/20 backdrop-blur-lg mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground"
        >
          <p className="text-center sm:text-left">
            Made with ⚔️ for adventurers
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">v1.0.0</span>
            <span className="text-center">
              💡 Tip: Swipe cards to explore faster
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
