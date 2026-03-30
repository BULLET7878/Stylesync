// Central API base URL — works in dev (localhost) and production (Vercel)
const API_URL = import.meta.env.VITE_API_URL || '';
export default API_URL;
