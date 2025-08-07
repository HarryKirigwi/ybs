'use client'
import { useState } from 'react'
import AdminProtectedRoute from '../../components/admin/AdminProtectedRoute'
import AdminLayout from '../../components/admin/AdminLayout'

// API utility function - same pattern as other components
const apiUrl = (path: string) => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''
  if (path.startsWith('http')) return path
  return `${BACKEND_URL}${path}`
}

export default function AdminTestPage() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    setTestResult('')

    try {
      console.log('🔍 Testing backend connection...')
      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
      console.log('Full URL:', apiUrl('/admin/auth/verify'))
      console.log('Current domain:', window.location.origin)
      console.log('Current protocol:', window.location.protocol)

      // Test 1: Check if cookies are being sent
      const response = await fetch(apiUrl('/admin/auth/verify'), {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      console.log('Cookies in request:', document.cookie)

      if (response.ok) {
        const data = await response.json()
        setTestResult(`✅ Success! Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`)
      } else {
        const text = await response.text()
        setTestResult(`❌ Error! Status: ${response.status}\nResponse: ${text.substring(0, 500)}`)
      }
    } catch (error: any) {
      console.error('Test error:', error)
      setTestResult(`❌ Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLoginFlow = async () => {
    setLoading(true)
    setTestResult('')

    try {
      console.log('🔐 Testing login flow...')
      
      // Test login first
      const loginResponse = await fetch(apiUrl('/auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
          email: 'admin@ybs.com',
          password: 'test123'
        }),
      })

      console.log('Login response status:', loginResponse.status)
      console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()))

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        console.log('Login successful:', loginData)
        
        // Now test the verify endpoint
        const verifyResponse = await fetch(apiUrl('/admin/auth/verify'), {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
        })

        console.log('Verify response status:', verifyResponse.status)
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json()
          setTestResult(`✅ Login + Verify Success!\nLogin: ${JSON.stringify(loginData, null, 2)}\nVerify: ${JSON.stringify(verifyData, null, 2)}`)
        } else {
          const verifyText = await verifyResponse.text()
          setTestResult(`⚠️ Login OK but Verify Failed!\nLogin: ${JSON.stringify(loginData, null, 2)}\nVerify Error: ${verifyText}`)
        }
      } else {
        const loginText = await loginResponse.text()
        setTestResult(`❌ Login Failed! Status: ${loginResponse.status}\nResponse: ${loginText}`)
      }
    } catch (error: any) {
      console.error('Login test error:', error)
      setTestResult(`❌ Login Test Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout activePage="test">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Backend Connection Test</h1>
            <p className="text-slate-600">Test the connection to the backend API</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Environment Configuration</h3>
              <div className="space-y-2 text-sm">
                <p><strong>NEXT_PUBLIC_BACKEND_URL:</strong> {process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set'}</p>
                <p><strong>Test URL:</strong> {apiUrl('/admin/auth/verify')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={testBackendConnection}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Backend Connection'}
              </button>
              
              <button
                onClick={testLoginFlow}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Login Flow'}
              </button>
            </div>

            {testResult && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Test Result</h3>
                <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-auto max-h-96">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  )
} 