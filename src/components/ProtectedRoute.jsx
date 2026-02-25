import React from "react";
import { Navigate } from "react-router-dom";
import { useOktaAuth } from "@okta/okta-react";

// Protected Route Wrapper - ensures user is authenticated before accessing route
function ProtectedRoute({ children }) {
	const { authState } = useOktaAuth();

	if (authState === undefined) {
		// Still loading authentication state
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
					<p className="mt-4 text-gray-600">Loading authentication...</p>
				</div>
			</div>
		);
	}

	if (!authState.isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export default ProtectedRoute;
