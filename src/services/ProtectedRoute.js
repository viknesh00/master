import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasSession } from "./TokenStorage";
import { onSessionExpired } from "./ApiService";

/**
 * Gate for authenticated routes.
 *
 * The check is presence of a refresh token - an expired *access* token is
 * normal and gets renewed by the API interceptor on the next request.
 *
 * This is a convenience guard only. The API enforces authentication on every
 * endpoint, so editing localStorage buys an attacker a blank screen, not data.
 *
 * It re-evaluates on three signals, because a plain render-time read goes stale:
 *   - navigation, so a sign-out in this tab takes effect on the next route
 *   - the session-expired event, raised when a token refresh fails
 *   - the storage event, so signing out in one tab ejects the others
 */
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [authenticated, setAuthenticated] = useState(hasSession);

    // Re-check whenever the route changes.
    useEffect(() => {
        setAuthenticated(hasSession());
    }, [location.pathname]);

    useEffect(() => {
        const unsubscribe = onSessionExpired(() => setAuthenticated(false));

        const handleStorage = (event) => {
            // key === null means the whole store was cleared.
            if (event.key === null || event.key === "refreshToken") {
                setAuthenticated(hasSession());
            }
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            unsubscribe();
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    if (!authenticated) {
        // Remember where they were headed so sign-in can return them there.
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }

    return children;
};

export default ProtectedRoute;
