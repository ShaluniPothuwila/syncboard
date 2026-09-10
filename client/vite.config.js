import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env }

  // A production build bakes VITE_API_URL into the bundle. Without it the app
  // falls back to localhost:4000, which on a deployed site means every visitor's
  // browser calls their own machine and the app appears broken with no error.
  // Fail the build instead of shipping that.
  if (mode === 'production' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL is not set.\n' +
      'Production builds must point at the deployed API, e.g.\n' +
      '  VITE_API_URL=https://your-service.onrender.com/api\n' +
      'On Vercel set it under Settings -> Environment Variables (include the /api suffix).'
    )
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
  }
})
