import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import GroupDetailsPage from './pages/GroupDetailsPage.jsx';
import GroupManagementPage from './pages/GroupManagementPage.jsx';

// Placeholder pages for phases 3-8 — filled in as we progress.
function Placeholder({ title }) {
  return <div className="page-content"><h2>{title}</h2><p>Coming soon.</p></div>;
}

// Redirects unauthenticated users to /login.
function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth();
  if (authLoading) return <div className="page-content"><p>Loading…</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

// Redirects already-logged-in users away from /login and /register.
function GuestRoute({ children }) {
  const { currentUser, authLoading } = useAuth();
  if (authLoading) return <div className="page-content"><p>Loading…</p></div>;
  if (currentUser) return <Navigate to="/feed" replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected routes */}
        <Route path="/feed" element={<ProtectedRoute><Placeholder title="Feed" /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
        <Route path="/groups/:id/manage" element={<ProtectedRoute><GroupManagementPage /></ProtectedRoute>} />
        <Route path="/my-posts" element={<ProtectedRoute><Placeholder title="My Posts" /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Placeholder title="Advanced Search" /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Placeholder title="Chat" /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><Placeholder title="Statistics" /></ProtectedRoute>} />
        <Route path="/about" element={<Placeholder title="About" />} />

        {/* User routes */}
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Default: redirect to feed if logged in, login if not */}
        <Route
          path="/"
          element={currentUser ? <Navigate to="/feed" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
