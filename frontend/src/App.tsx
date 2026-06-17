import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { TpcDashboard } from './pages/tpc/TpcDashboard';
import { GraduationCap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-dark flex flex-col justify-center items-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <GraduationCap className="w-8 h-8 text-teal-accent absolute top-4 left-4" />
        </div>
        <p className="text-sm font-bold text-white tracking-widest uppercase animate-pulse">IPERS Portal</p>
        <p className="text-xs text-slate-500 mt-1">Authenticating session...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Login />;
  }

  // Role based routing
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'tpc':
      return <TpcDashboard />;
    default:
      return <Login />;
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
