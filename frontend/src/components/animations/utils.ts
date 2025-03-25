import { Variants } from 'framer-motion';

export const transitions = {
  default: {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  },
  slide: {
    type: "tween",
    duration: 0.4,
    ease: "easeOut",
  },
  scale: {
    type: "spring",
    damping: 20,
    stiffness: 300,
  },
  spring: {
    default: {
      type: "spring",
      damping: 15,
      stiffness: 200,
    },
    gentle: {
      type: "spring",
      damping: 20,
      stiffness: 150,
    }
  },
  tween: {
    default: {
      type: "tween",
      duration: 0.3,
      ease: "easeInOut",
    }
  }
} as const;

export const variants: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: transitions.default
    },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: transitions.slide
    },
    exit: { y: -20, opacity: 0 }
  },
  slideDown: {
    initial: { y: -20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: transitions.slide
    },
    exit: { y: 20, opacity: 0 }
  },
  slideLeft: {
    initial: { x: 20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: transitions.slide
    },
    exit: { x: -20, opacity: 0 }
  },
  slideRight: {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: transitions.slide
    },
    exit: { x: 20, opacity: 0 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: transitions.scale
    },
    exit: { scale: 0.95, opacity: 0 }
  }
};

export const createStaggerVariants = (
  childVariant: Variants,
  staggerChildren = 0.1
): Variants => ({
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren,
    },
  },
  exit: { opacity: 0 },
  children: childVariant,
});

export const createTransition = (
  type: keyof typeof transitions = "default",
  customConfig = {}
) => ({
  ...transitions[type],
  ...customConfig,
});
