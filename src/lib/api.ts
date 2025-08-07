import { apiUrl } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function apiRequest<T = any>(
  path: string, 
  options: RequestInit = {}
): Promise<{ response: Response; data: ApiResponse<T> }> {
  const url = apiUrl(path)
  
  const defaultOptions: RequestInit = {
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  const finalOptions = { ...defaultOptions, ...options }
  
  try {
    console.log('🌐 API Request:', {
      url,
      method: finalOptions.method || 'GET',
      headers: finalOptions.headers,
    })
    
    const response = await fetch(url, finalOptions)
    
    console.log('📡 API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    })
    
    let data: ApiResponse<T>
    try {
      data = await response.json()
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      data = {
        success: false,
        error: 'Invalid JSON response from server'
      }
    }
    
    return { response, data }
  } catch (error) {
    console.error('❌ API Request failed:', {
      url,
      error: error instanceof Error ? error.message : error,
    })
    
    throw error
  }
}

export async function apiGet<T = any>(path: string): Promise<ApiResponse<T>> {
  const { data } = await apiRequest<T>(path, { method: 'GET' })
  return data
}

export async function apiPost<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await apiRequest<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
  return data
}

export async function apiPut<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  const { data } = await apiRequest<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
  return data
}

export async function apiDelete<T = any>(path: string): Promise<ApiResponse<T>> {
  const { data } = await apiRequest<T>(path, { method: 'DELETE' })
  return data
}
