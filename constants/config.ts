// Prefer environment override, fall back to exam backend.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://todo-list.dobleb.cl';