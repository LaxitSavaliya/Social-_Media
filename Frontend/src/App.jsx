import { Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import SignUpPage from './Pages/SignUpPage';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import OnboardingPage from './Pages/OnboardingPage';
import ProfilePage from './Pages/ProfilePage';
import Notification from './Pages/Notification';
import PostPage from './Pages/PostPage';
import UpdateProfile from './Pages/UpdateProfile';
import PageNotFound from './Pages/PageNotFound';

import PageLoader from './Components/PageLoader';
import Layout from './Components/Layout';
import useAuthUser from './Hooks/useAuthUser';

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (!isAuthenticated) return <Navigate to='/login' />;
  if (!isOnboarded) return <Navigate to='/onboarding' />;

  return children;
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = { duration: 0.3, ease: 'easeInOut' };

const App = () => {
  const { isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <div className='h-screen gradient-bg'>
      <AnimatePresence exitBeforeEnter>
        <Routes>
          {/* Public Routes */}
          <Route path='/signup' element={<PageMotion><SignUpPageRedirect /></PageMotion>} />
          <Route path='/login' element={<PageMotion><LoginPageRedirect /></PageMotion>} />
          <Route path='/onboarding' element={<PageMotion><OnboardingRedirect /></PageMotion>} />

          {/* Protected Routes */}
          <Route path='/' element={<ProtectedRoute><Layout showRightSidebar><PageMotion><HomePage /></PageMotion></Layout></ProtectedRoute>} />
          <Route path='/profile/:userName' element={<ProtectedRoute><Layout><PageMotion><ProfilePage /></PageMotion></Layout></ProtectedRoute>} />
          <Route path='/notifications' element={<ProtectedRoute><Layout><PageMotion><Notification /></PageMotion></Layout></ProtectedRoute>} />
          <Route path='/post/:postId' element={<ProtectedRoute><Layout><PageMotion><PostPage /></PageMotion></Layout></ProtectedRoute>} />
          <Route path='/profile/:userName/update-profile' element={<ProtectedRoute><Layout><PageMotion><UpdateProfile /></PageMotion></Layout></ProtectedRoute>} />

          {/* 404 */}
          <Route path='*' element={<PageMotion><PageNotFound /></PageMotion>} />
        </Routes>
      </AnimatePresence>
      <Toaster />
    </div>
  );
};

// --- Motion Wrapper ---
const PageMotion = ({ children }) => (
  <motion.div
    initial='initial'
    animate='in'
    exit='out'
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

// --- Redirect Helpers for Public Routes ---
const SignUpPageRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  return !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} />;
};

const LoginPageRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  return !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? '/' : '/onboarding'} />;
};

const OnboardingRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;
  return isAuthenticated && !isOnboarded ? <OnboardingPage /> : <Navigate to={isAuthenticated ? '/' : '/login'} />;
};

export default App;