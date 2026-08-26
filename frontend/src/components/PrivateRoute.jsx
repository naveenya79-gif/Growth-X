import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.user);

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (!userInfo.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default PrivateRoute;
