import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FadeIn, SlideIn } from './animations';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SlideIn direction="left" delay={0.2}>
        <Sidebar />
      </SlideIn>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <FadeIn delay={0.1}>
          <Header />
        </FadeIn>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
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
