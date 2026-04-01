import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { ReactNode, useRef } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  index?: number;
  "data-testid"?: string;
}

export function AnimatedCard({ children, index = 0, "data-testid": testId }: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 350, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 350, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: index * 0.045, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        data-testid={testId}
      >
        {children}
      </motion.div>
    </div>
  );
}
