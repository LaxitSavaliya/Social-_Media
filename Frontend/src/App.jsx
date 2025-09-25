import { Navigate, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import HomePage from "./Pages/HomePage";
import OnboardingPage from "./Pages/OnboardingPage";
import ProfilePage from "./Pages/ProfilePage";
import Notification from "./Pages/Notification";
import PostPage from "./Pages/PostPage";

import PageLoader from "./Components/PageLoader";
import Layout from "./Components/Layout";
import useAuthUser from "./Hooks/useAuthUser";
import PageNotFound from "./Pages/PageNotFound";
import UpdateProfile from "./Pages/UpdateProfile";

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isOnboarded) return <Navigate to="/onboarding" />;

  return children;
};

const App = () => {
  const { isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen gradient-bg">
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUpPageRedirect />} />
        <Route path="/login" element={<LoginPageRedirect />} />
        <Route path="/onboarding" element={<OnboardingRedirect />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout showRightSidebar>
                <HomePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userName"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Layout>
                <Notification />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <Layout>
                <PostPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userName/update-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <UpdateProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<PageNotFound />} />

      </Routes>

      <Toaster />
    </div>
  );
};

// --- Redirect Helpers for Public Routes ---
const SignUpPageRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  return !isAuthenticated ? (
    <SignUpPage />
  ) : (
    <Navigate to={isOnboarded ? "/" : "/onboarding"} />
  );
};

const LoginPageRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  return !isAuthenticated ? (
    <LoginPage />
  ) : (
    <Navigate to={isOnboarded ? "/" : "/onboarding"} />
  );
};

const OnboardingRedirect = () => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  return isAuthenticated && !isOnboarded ? (
    <OnboardingPage />
  ) : (
    <Navigate to={isAuthenticated ? "/" : "/login"} />
  );
};

export default App;