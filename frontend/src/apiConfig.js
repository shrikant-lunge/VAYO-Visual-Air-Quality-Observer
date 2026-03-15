// Unified API configuration.
// By using a relative path with Vite's proxy, this works perfectly on:
// 1. Localhost (desktop)
// 2. Local IP (mobile/network)
// 3. Ngrok/Public tunnels (single tunnel only)

export const API_BASE_URL = ''; // Relative path, Vite proxy handles the rest
