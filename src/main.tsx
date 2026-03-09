import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from "@tanstack/react-query"
import { Toaster, toast } from "sonner"
import App from "./App"
import { AuthProvider } from "./auth/AuthProvider"
import { ApiError } from "./services/apiClient"

import "./styles/index.css"

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return "Something went wrong"
}

const mutationCache = new MutationCache({
  onError: (error: Error) => {
    toast.error(getErrorMessage(error))
  },
})

const queryCache = new QueryCache({
  onError: (error: Error) => {
    toast.error(getErrorMessage(error))
  },
})

const queryClient = new QueryClient({
  mutationCache,
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false
        return failureCount < 1
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
)