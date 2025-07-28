import { useCallback, useState, useEffect } from "react";
import { User } from "@/types";
import { OAuthService } from "../services/OAuthService";
import { GoogleApiService } from "../services";
export const useOAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [oauthService] = useState(() => OAuthService.getInstance());
  const [apiService] = useState(() => new GoogleApiService());

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          setIsLoading(false);
          return;
        }

        if (code) {
          // Handle OAuth callback
          await oauthService.handleCallback(code);
          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else {
          // Try to load stored tokens
          oauthService.loadStoredTokens();
        }

        // Check if authenticated and get user profile
        if (oauthService.isAuthenticated()) {
          const userProfile = await apiService.getUserProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        oauthService.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [oauthService, apiService]);

  const signIn = useCallback(() => {
    const authUrl = oauthService.getAuthUrl();
    window.location.href = authUrl;
  }, [oauthService]);

  const signOut = useCallback(() => {
    oauthService.signOut();
    setIsAuthenticated(false);
    setUser(null);
  }, [oauthService]);

  return {
    isAuthenticated,
    user,
    isLoading,
    apiService,
    signIn,
    signOut,
  };
};
