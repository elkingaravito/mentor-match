import React from 'react';
import { motion } from 'framer-motion';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
}

interface SlideInProps extends AnimationProps {
  direction: 'left' | 'right' | 'up' | 'down';
}

export const FadeIn: React.FC<AnimationProps> = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay }}
  >
    {children}
  </motion.div>
);

export const SlideIn: React.FC<SlideInProps> = ({ children, direction, delay = 0 }) => {
  const variants = {
    initial: {
      x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      opacity: 0,
    },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};