// Okta Configuration
// Replace these values with your actual Okta app details from the Okta Admin Console

export const oktaConfig = {
  issuer: import.meta.env.VITE_OKTA_DOMAIN || 'https://dev-12345.okta.com',
  clientId: import.meta.env.VITE_OKTA_CLIENT_ID || '0oa1234567890ABCDEF0',
  redirectUri: `${window.location.origin}/login/callback`,
  scopes: ['openid', 'profile', 'email'],
  postLogoutRedirectUri: `${window.location.origin}/login`,
};

