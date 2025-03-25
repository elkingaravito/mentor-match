import { Theme } from '@mui/material/styles';
import { keyframes } from "@mui/material";

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const createAnimations = (theme: Theme) => ({
  fadeIn: {
    animation: `${fadeIn} 0.3s ease-in-out`,
  },
  slideUp: {
    animation: `${slideUp} 0.4s ease-out`,
  },
  // Add more animations as needed
  menuItem: {
    transition: theme.transitions.create(['background-color', 'transform'], {
      duration: theme.transitions.duration.shorter,
    }),
  },
  cardHover: {
    transition: theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.standard,
    }),
  },
});

declare module '@mui/material/styles' {
  interface Theme {
    animations: ReturnType<typeof createAnimations>;
  }
  interface ThemeOptions {
    animations?: ReturnType<typeof createAnimations>;
  }
}