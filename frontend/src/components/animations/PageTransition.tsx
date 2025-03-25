import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { variants, transitions } from './utils';

interface PageTransitionProps extends PropsWithChildren {
  mode?: 'fade' | 'scale' | 'slide';
}

const PageTransition: FC<PageTransitionProps> = ({ children, mode = 'fade' }) => {
  const getVariants = () => {
    switch (mode) {
      case 'scale':
        return variants.scale;
      case 'slide':
        return variants.slideUp;
      case 'fade':
      default:
        return variants.fadeIn;
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={getVariants()}
      transition={transitions.default}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
