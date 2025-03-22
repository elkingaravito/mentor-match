import { motion, MotionProps } from 'framer-motion';

interface ScaleInProps extends MotionProps {
  children: React.ReactNode;
  delay?: number;
}

const ScaleIn = ({ children, delay = 0, ...props }: ScaleInProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;