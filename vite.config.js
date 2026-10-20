import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed at the root of avrabina.com (Hostinger). Override with
// VITE_BASE=/Personal-and-Creative-Portfolio/ if ever building for
// the GitHub Pages project URL again.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
})
