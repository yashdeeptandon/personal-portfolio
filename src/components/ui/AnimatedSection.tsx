"use client";

import { memo, ReactNode } from "react";
import { motion, Variants } from "framer-motion";

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
};

interface Props {
  children: ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  duration?: number;
  className?: string;
}

const AnimatedSection = memo(function AnimatedSection({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  className,
}: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: cubicEase }}
    >
      {children}
    </motion.div>
  );
});

export default AnimatedSection;
export { variants };
