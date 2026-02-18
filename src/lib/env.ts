/**
 * Centralized environment configuration.
 * All VITE_ env vars should be accessed through this module.
 */
export const env = {
  /** Backend API URL. Empty string = relative (Vite proxy in dev, Vercel rewrites in prod) */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  
  /** Application display name */
  appName: import.meta.env.VITE_APP_NAME ?? 'GLA Management Portal',
  
  /** Application version */
  appVersion: import.meta.env.VITE_APP_VERSION ?? '2.0.0',
  
  /** Application description */
  appDescription: import.meta.env.VITE_APP_DESCRIPTION ?? 'Premium fleet management and luxury auto services portal',
  
  /** Google reCAPTCHA site key */
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '',
  
  /** Whether PWA is enabled */
  enablePwa: import.meta.env.VITE_ENABLE_PWA !== 'false',
  
  /** Whether analytics is enabled */
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  /** Current environment mode */
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;
