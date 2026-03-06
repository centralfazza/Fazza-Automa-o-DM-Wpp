import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Automations } from './pages/Automations';
import NewAutomation from './pages/NewAutomation';
import { Conversations } from './pages/Conversations';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Audience } from './pages/Audience';
import { GrowthTools } from './pages/GrowthTools';
import { Integrations } from './pages/Integrations';

const ProtectedRoute: React.FC<{ children: React.ReactNode; withLayout?: boolean }> = ({ children, withLayout = true }) => {
  // In a real app, check auth state here
  const isAuthenticated = true;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return withLayout ? <Layout>{children}</Layout> : <>{children}</>;
};

import { ToastProvider } from './components/ui/ToastContext';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
          <Route path="/automations/new" element={<ProtectedRoute withLayout={false}><NewAutomation /></ProtectedRoute>} />
          <Route path="/automations/edit/:id" element={<ProtectedRoute withLayout={false}><NewAutomation /></ProtectedRoute>} />
          <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
          <Route path="/audience" element={<ProtectedRoute><Audience /></ProtectedRoute>} />
          <Route path="/growth-tools" element={<ProtectedRoute><GrowthTools /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;