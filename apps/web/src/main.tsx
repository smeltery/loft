import './styles.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@fontsource-variable/inter'

const root = document.getElementById('root')
if (!root) throw new Error('missing #root')
createRoot(root).render(<App />)
