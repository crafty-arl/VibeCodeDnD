import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';

interface ChapterTransitionProps {
  isOpen: boolean;
  chapterNumber: number;
}

export function ChapterTransition({ isOpen, chapterNumber }: ChapterTransitionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="text-center space-y-4 p-8"
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            >
              <Book className="w-20 h-20 text-primary mx-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gradient-solar">
                Chapter {chapterNumber}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Your journey continues...
              </p>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
