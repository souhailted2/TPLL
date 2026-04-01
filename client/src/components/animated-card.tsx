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
      transition={{ duration: 0.38, delay: index * 0.045, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
      data-testid={testId}
    >
      {children}
    </motion.div>
  );
}
