import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
    redirectTo?: () => void;
}

/**
 * Protected Route wrapper component
 * Redirects to login if user is not authenticated
 */
export default function ProtectedRoute({ children, redirectTo }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-appleGray">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        if (redirectTo) {
            redirectTo();
        }
        return null;
    }

    // Render children if authenticated
    return <>{children}</>;
}
