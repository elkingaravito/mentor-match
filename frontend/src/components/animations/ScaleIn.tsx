import type { FC, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { variants, transitions } from './utils';

const ScaleIn: FC<PropsWithChildren> = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants.scale}
      transition={transitions.scale}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
