import { Task, TaskList } from "./task";
export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  accessType: string;
  includeGrantedScopes: string;
}

export interface GoogleAuthInstance {
  isSignedIn: {
    get(): boolean;
    listen(callback: (isSignedIn: boolean) => void): void;
  };
  currentUser: {
    get(): GoogleUser;
  };
  signIn(): Promise<GoogleUser>;
  signOut(): Promise<void>;
}

export interface GoogleUser {
  getBasicProfile(): GoogleProfile;
}

export interface GoogleProfile {
  getName(): string;
  getEmail(): string;
  getImageUrl(): string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
}

export interface GoogleApiResponse<T> {
  result?: T;
  items?: T[];
}

export interface GoogleTasksListResponse {
  items?: TaskList[];
}

export interface GoogleTasksResponse {
  items?: Task[];
}
