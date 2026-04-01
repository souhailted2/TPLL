import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  "data-testid"?: string;
}

export function AnimatedCard({ children, index = 0, "data-testid": testId }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        opacity: { duration: 0.38, delay: index * 0.045, ease: [0.25, 0.1, 0.25, 1] },
        y:       { duration: 0.38, delay: index * 0.045, ease: [0.25, 0.1, 0.25, 1] },
        scale:   { duration: 0.15 },
      }}
      whileHover={{ scale: 1.025 }}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
}
