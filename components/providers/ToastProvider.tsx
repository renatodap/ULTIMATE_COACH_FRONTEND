'use client'

/**
 * Toast Provider - INSTANT FEEDBACK SYSTEM
 *
 * Intuitive: Clear success/error messages
 * Mobile-first: Positioned at top, readable on small screens
 * Easy to use: Auto-dismiss after 3 seconds
 *
 * Removes anxiety, builds trust
 */

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        // Success toast
        success: {
          duration: 3000,
          style: {
            background: '#10b981', // green-500
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '16px 24px',
            border: '2px solid #000',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        // Error toast
        error: {
          duration: 4000,
          style: {
            background: '#ef4444', // red-500
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '16px 24px',
            border: '2px solid #000',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        // Loading toast
        loading: {
          style: {
            background: '#3b3b3b', // iron-dark-gray
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '16px 24px',
            border: '2px solid #666',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    />
  )
}
