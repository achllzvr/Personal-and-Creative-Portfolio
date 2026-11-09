import { ThemeProvider } from './context/ThemeContext'
import StudioPortfolio from './components/studio/StudioPortfolio'
import './studio.css'

export default function App() {
  return (
    <ThemeProvider>
      <StudioPortfolio />
    </ThemeProvider>
  )
}
