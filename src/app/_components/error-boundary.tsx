"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "~/components/ui/button"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo })
    console.error("Uncaught error:", error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-900 p-4 text-white">
          <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong</h2>
          <p className="mb-4 text-center">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <div className="mb-6 max-w-2xl overflow-auto rounded bg-gray-800 p-4 text-sm text-gray-300">
            <p className="font-bold text-red-400">{this.state.error?.toString()}</p>
            {this.state.errorInfo && (
              <pre className="mt-2 text-xs text-gray-400">{this.state.errorInfo.componentStack}</pre>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={this.handleReset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go to Home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
