import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { variants, transitions } from './utils';

interface FadeInProps extends PropsWithChildren {
  delay?: number;
}

const FadeIn: FC<FadeInProps> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants.fadeIn}
      transition={{ ...transitions.default, delay }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
