import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { variants, transitions } from './utils';

interface SlideInProps extends PropsWithChildren {
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
}

const SlideIn: FC<SlideInProps> = ({ children, direction = 'up', delay = 0 }) => {
  const slideVariant = variants[`slide${direction.charAt(0).toUpperCase() + direction.slice(1)}`];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={slideVariant}
      transition={{ ...transitions.slide, delay }}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
