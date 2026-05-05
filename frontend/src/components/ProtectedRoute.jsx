import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, doctor } = useAuthStore();
  const token = localStorage.getItem('token');

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(doctor?.role)) {
    if (doctor?.role === 'specialist') {
      return <Navigate to="/dashboard-specialist" replace />;
    }
    return <Navigate to="/dashboard-generalist" replace />;
  }

  return children;
};

export default ProtectedRoute;
