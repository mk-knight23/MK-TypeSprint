/**
 * Analytics helper — pushes events into the GTM/GA4 dataLayer when analytics
 * are configured at build time. No-ops entirely when no dataLayer exists.
 */
export function track(event, params = {}) {
  // Only fire if GTM/GA4 is configured
  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({ event, ...params });
  }
  // Debug mode
  if (localStorage.getItem('analytics_debug') === 'true') {
    console.log('[Analytics]', event, params);
  }
}
