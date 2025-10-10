/**
 * React hook for real-time carousel generation progress via WebSocket.
 *
 * Subscribes to WebSocket updates for a specific carousel and provides
 * real-time status, progress, and cost information.
 *
 * @example
 * ```tsx
 * const { status, progress, currentStep, totalCost, isConnected } = useCarouselProgress(carouselId)
 *
 * return (
 *   <div>
 *     <div>Status: {status}</div>
 *     <div>Progress: {progress}%</div>
 *     <div>Step: {currentStep}</div>
 *     <div>Cost: ${totalCost.toFixed(2)}</div>
 *   </div>
 * )
 * ```
 */
import { useEffect, useState, useCallback, useRef } from 'react'

export interface CarouselProgressData {
  status: string
  progress: number
  currentStep: string
  totalCost: number
  isConnected: boolean
  error: string | null
}

export interface WebSocketEvent {
  event: string
  data: {
    status?: string
    progress_percentage?: number
    current_step?: string
    total_cost?: number
    error?: string
    message?: string
    progress?: string
    step?: string
    slide_count?: number
  }
}

export function useCarouselProgress(carouselId: string | null): CarouselProgressData {
  const [status, setStatus] = useState<string>('pending')
  const [progress, setProgress] = useState<number>(0)
  const [currentStep, setCurrentStep] = useState<string>('Queued')
  const [totalCost, setTotalCost] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef<number>(0)

  const connect = useCallback(() => {
    if (!carouselId) return

    // Don't reconnect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
      const ws = new WebSocket(`${wsUrl}/api/v1/ws/carousel/${carouselId}/progress`)

      ws.onopen = () => {
        console.log('WebSocket connected:', carouselId)
        setIsConnected(true)
        setError(null)
        reconnectAttempts.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data)

          switch (data.event) {
            case 'connected':
              console.log('WebSocket connection confirmed')
              break

            case 'status_update':
              if (data.data.status) setStatus(data.data.status)
              if (data.data.progress_percentage !== undefined) {
                setProgress(data.data.progress_percentage)
              }
              if (data.data.current_step) setCurrentStep(data.data.current_step)
              if (data.data.total_cost !== undefined) {
                setTotalCost(data.data.total_cost)
              }
              break

            case 'step_progress':
              if (data.data.current_step) setCurrentStep(data.data.current_step)
              if (data.data.progress_percentage !== undefined) {
                setProgress(data.data.progress_percentage)
              }
              if (data.data.progress) {
                // Progress like "3/8"
                setCurrentStep(prev => `${prev} (${data.data.progress})`)
              }
              break

            case 'cost_update':
              if (data.data.total_cost !== undefined) {
                setTotalCost(data.data.total_cost)
              }
              break

            case 'completed':
              setStatus('completed')
              setProgress(100)
              setCurrentStep('Complete')
              if (data.data.total_cost !== undefined) {
                setTotalCost(data.data.total_cost)
              }
              console.log('Carousel generation completed!')
              break

            case 'error':
              setStatus('failed')
              setError(data.data.message || 'Generation failed')
              setCurrentStep('Error')
              console.error('Carousel generation failed:', data.data.message)
              break

            case 'ping':
              // Respond to server ping
              ws.send(JSON.stringify({ type: 'pong' }))
              break

            default:
              console.log('Unknown WebSocket event:', data.event)
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        setError('Connection error')
      }

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        setIsConnected(false)

        // Attempt to reconnect if not a normal closure and not completed
        if (event.code !== 1000 && status !== 'completed' && status !== 'failed') {
          reconnectAttempts.current += 1

          if (reconnectAttempts.current <= 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/5)`)

            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, delay)
          } else {
            setError('Connection lost. Please refresh the page.')
          }
        }
      }

      wsRef.current = ws
    } catch (err) {
      console.error('Failed to create WebSocket:', err)
      setError('Failed to connect')
    }
  }, [carouselId, status])

  // Connect on mount and when carouselId changes
  useEffect(() => {
    if (carouselId) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (wsRef.current) {
        // Send close frame
        wsRef.current.close(1000, 'Component unmounted')
        wsRef.current = null
      }
    }
  }, [carouselId, connect])

  // Send periodic pings to keep connection alive
  useEffect(() => {
    if (!isConnected) return

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, 25000) // Every 25 seconds

    return () => clearInterval(pingInterval)
  }, [isConnected])

  return {
    status,
    progress,
    currentStep,
    totalCost,
    isConnected,
    error,
  }
}
