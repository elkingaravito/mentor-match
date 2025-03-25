import { Box, Container, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FadeIn, SlideIn, variants, transitions, createTransition } from './animations';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();
  const theme = useTheme();

  const mainVariants = {
    ...variants.fadeIn,
    animate: {
      ...variants.fadeIn.animate,
      transition: {
        ...transitions.spring.default,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const contentVariants = {
    ...variants.fadeIn,
    animate: {
      ...variants.fadeIn.animate,
      transition: {
        ...transitions.spring.gentle,
        delay: 0.3,
      },
    },
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: (theme) => `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}10 0%, transparent 70%)`,
          opacity: 0.5,
          zIndex: 0,
        },
      }}
    >
      <SlideIn direction="left" delay={0.2}>
        <Sidebar />
      </SlideIn>
      <Box 
        component={motion.main}
        variants={mainVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        sx={{ 
          flexGrow: 1,
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <FadeIn delay={0.1}>
          <Header />
        </FadeIn>
        <Container 
          maxWidth="lg" 
          component={motion.div}
          variants={contentVariants}
          sx={{ 
            mt: 4, 
            mb: 4,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, transparent 100%)`,
              opacity: 0.5,
              borderRadius: 2,
              zIndex: -1,
            }
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={variants.fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={createTransition("spring", { damping: 20, stiffness: 150 })}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
