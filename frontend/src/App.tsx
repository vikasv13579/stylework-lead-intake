import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Routes will be wired in Phase 7 */}
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route
            path="/leads"
            element={
              <div className="flex min-h-screen items-center justify-center text-slate-400">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-indigo-400 mb-2">Stylework</h1>
                  <p className="text-slate-500">Lead Intake Service — Phase 1 running ✓</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
