import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@heroicons/react'], // keep your current exclude for heroicons if needed
    include: ['@mui/icons-material/NoteAdd'], // explicitly include MUI icon to pre-bundle
  }
})
  