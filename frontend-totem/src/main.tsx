import { createRoot } from 'react-dom/client'
import { Component, type ReactNode } from 'react'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: 'red', background: '#1e1e1e', minHeight: '100vh' }}>
          <h2 style={{ color: '#ff6b6b' }}>Erro de Runtime</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#ffd700' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
