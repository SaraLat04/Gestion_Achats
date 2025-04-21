// src/components/PrivateRouteByRole.js
import { Navigate } from 'react-router-dom';

const PrivateRouteByRole = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRouteByRole;
