import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
