import { BrowserRouter } from 'react-router-dom'
import { Toast } from '../components/ui/Toast'
import { useAppState } from '../context/AppStateContext'
import { AppRouter } from './router'

export const App = () => {
  const { toast, clearToast } = useAppState()

  return (
    <BrowserRouter>
      <AppRouter />
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={clearToast} />}
    </BrowserRouter>
  )
}
