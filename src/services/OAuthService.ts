import { OAUTH_CONFIG } from "../config/google";
import { TokenResponse } from "@/types/google";
export class OAuthService {
  private static instance: OAuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  // Generate OAuth 2.0 authorization URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.CLIENT_ID,
      redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
      scope: OAUTH_CONFIG.SCOPES,
      response_type: OAUTH_CONFIG.RESPONSETYPE,
      access_type: OAUTH_CONFIG.ACCESS_TYPE,
      include_granted_scopes: OAUTH_CONFIG.INCLUDE_GRANTED_SCOPES,
      state: this.generateState(),
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Handle OAuth callback and exchange code for tokens
  async handleCallback(code: string): Promise<TokenResponse> {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: OAUTH_CONFIG.CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
          code: code,
          grant_type: "authorization_code",
          redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error(`OAuth token exchange failed: ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.setTokens(tokenData);
      return tokenData;
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      throw error;
    }
  }

  // Set tokens and expiry
  private setTokens(tokenData: TokenResponse): void {
    this.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.refreshToken = tokenData.refresh_token;
    }
    this.tokenExpiry = Date.now() + tokenData.expires_in * 1000;

    // Store in localStorage for persistence
    localStorage.setItem("google_access_token", this.accessToken);
    if (this.refreshToken) {
      localStorage.setItem("google_refresh_token", this.refreshToken);
    }
    localStorage.setItem("google_token_expiry", this.tokenExpiry.toString());
  }

  // Load tokens from localStorage
  loadStoredTokens(): boolean {
    const accessToken = localStorage.getItem("google_access_token");
    const refreshToken = localStorage.getItem("google_refresh_token");
    const tokenExpiry = localStorage.getItem("google_token_expiry");

    if (accessToken && tokenExpiry) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = parseInt(tokenExpiry);

      // Check if token is still valid
      if (this.tokenExpiry > Date.now()) {
        return true;
      } else if (this.refreshToken) {
        // Try to refresh the token
        this.refreshAccessToken();
        return true;
      }
    }
    return false;
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: OAUTH_CONFIG.CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
          refresh_token: this.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const tokenData: TokenResponse = await response.json();
      this.setTokens(tokenData);
    } catch (error) {
      console.error("Error refreshing token:", error);
      this.signOut();
      throw error;
    }
  }

  // Get valid access token (refresh if needed)
  async getValidToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error("No access token available");
    }

    // Check if token is expired and refresh if needed
    if (this.tokenExpiry && this.tokenExpiry <= Date.now() + 60000) {
      // Refresh 1 minute before expiry
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        throw new Error("Token expired and no refresh token available");
      }
    }

    return this.accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return (
      this.accessToken !== null &&
      (this.tokenExpiry === null || this.tokenExpiry > Date.now())
    );
  }

  // Sign out and clear tokens
  signOut(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_refresh_token");
    localStorage.removeItem("google_token_expiry");
  }

  // Generate random state for CSRF protection
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
