const browserHost = typeof window === 'undefined' ? 'localhost' : window.location.hostname
const browserProtocol = typeof window === 'undefined' ? 'http:' : window.location.protocol

// Keep the API on the same machine that serves this dashboard. This also works
// when the demo is opened from another device on the local network.
export const API_BASE = import.meta.env.VITE_API_URL || `${browserProtocol}//${browserHost}:3001/api`
