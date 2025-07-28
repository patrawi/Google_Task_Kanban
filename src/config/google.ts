export const OAUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID || "",
  REDIRECT_URI: window.location.origin,
  DISCOVERY_DOC: "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
  SCOPES:
    "https://www.googleapis.com/auth/tasks https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  RESPONSETYPE: "code",
  ACCESS_TYPE: "offline",
  INCLUDE_GRANTED_SCOPES: "true",
};
