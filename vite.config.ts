import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress Rolldown false-positive for react-router sub-path exports
        if (
          warning.code === 'UNRESOLVED_IMPORT' &&
          typeof warning.message === 'string' &&
          warning.message.includes('react-router/dom')
        ) {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }

          if (id.includes('node_modules/react-router')) {
            return 'react'
          }

          if (id.includes('node_modules/@radix-ui')) {
            return 'radix'
          }

          if (
            id.includes('node_modules/@tanstack/react-query') ||
            id.includes('node_modules/axios') ||
            id.includes('node_modules/zustand')
          ) {
            return 'data'
          }
        },
      },
    },
  },
})
