import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { HumanizeLevel } from '@/lib/humanize-levels'

/** Long-running LLM routes (humanize, paraphrase) need more than default browser/axios limits. */
const LONG_REQUEST_TIMEOUT_MS = 180_000 // 3 minutes

// In the browser, use same-origin (empty baseURL) so /api/* requests send cookies and match the page host.
const axiosBaseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || ''

// Create Axios instance with proper configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: axiosBaseUrl,
  timeout: 60000, // default; humanize/paraphrase override below
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// Request interceptor to add logging
axiosClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to:`, config.url)
    console.log('Request headers:', config.headers)
    console.log('Request data:', config.data)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response from ${response.config.url}:`, response.status)
    console.log('Response headers:', response.headers)
    console.log('Response data:', response.data)
    return response
  },
  (error) => {
    console.error('Response interceptor error:', error)
    
    if (error.response) {
      // Server responded with error status
      console.error('Error response status:', error.response.status)
      console.error('Error response data:', error.response.data)
      
      if (error.response.status === 405) {
        console.error('HTTP 405: Method Not Allowed')
        console.error('Request method:', error.config.method)
        console.error('Request URL:', error.config.url)
        console.error('Expected methods:', error.response.headers.allow)
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request)
    } else {
      // Something else happened
      console.error('Request setup error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// API methods with proper HTTP method handling
export const apiClient = {
  /** Free-tier daily humanizer usage (from GET /api/humanize/usage or POST response). */
  async getHumanizeUsage(authToken?: string): Promise<{
    premium: boolean
    limit: number | null
    usedToday: number | null
    usesRemaining: number | null
    atLimit?: boolean
  }> {
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    const response = await axiosClient.get('/api/humanize/usage', { headers })
    return response.data
  },

  async getParaphraseUsage(authToken?: string): Promise<{
    premium: boolean
    limit: number | null
    usedToday: number | null
    usesRemaining: number | null
    atLimit?: boolean
  }> {
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    const response = await axiosClient.get('/api/paraphrase/usage', { headers })
    return response.data
  },

  async getCitationUsage(authToken?: string): Promise<{
    premium: boolean
    limit: number | null
    usedToday: number | null
    usesRemaining: number | null
    atLimit?: boolean
  }> {
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    const response = await axiosClient.get('/api/citation/usage', { headers })
    return response.data
  },

  // POST request for humanize
  async humanizeText(
    text: string,
    level: HumanizeLevel = 'basic',
    authToken?: string
  ): Promise<{
    result: string
    freeUsage?: { usedToday: number; usesRemaining: number; limit: number }
  }> {
    try {
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await axiosClient.post(
        '/api/humanize',
        { text, level },
        { headers, timeout: LONG_REQUEST_TIMEOUT_MS }
      )
      return {
        result: response.data.result,
        freeUsage: response.data.freeUsage,
      }
    } catch (error: any) {
      console.error('Humanize API error:', error)
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        (typeof error.message === 'string' && error.message.toLowerCase().includes('timeout'))
      if (isTimeout) {
        throw new Error(
          'Request timed out. Long or complex text can take over a minute. Try a shorter passage, or wait and try again.'
        )
      }
      const data = error.response?.data
      const msg =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        error.message
      const err = new Error(msg) as Error & {
        upgradeRequired?: boolean
        freeUsage?: { usedToday: number; usesRemaining: number; limit: number }
        status?: number
      }
      err.upgradeRequired = data?.upgradeRequired === true
      err.freeUsage = data?.freeUsage
      err.status = error.response?.status
      throw err
    }
  },

  // POST request for paraphrase
  async paraphraseText(
    text: string,
    authToken?: string
  ): Promise<{ result: string; freeUsage?: { usedToday: number; usesRemaining: number; limit: number } }> {
    try {
      const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await axiosClient.post(
        '/api/paraphrase',
        { text },
        { headers, timeout: LONG_REQUEST_TIMEOUT_MS }
      )
      return {
        result: response.data.result,
        freeUsage: response.data.freeUsage,
      }
    } catch (error: unknown) {
      console.error('Paraphrase API error:', error)
      const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string }
      throw new Error(
        `Paraphrasing failed: ${err.response?.data?.message || err.response?.data?.error || err.message}`
      )
    }
  },

  // POST request for citation
  async generateCitation(citationData: {
    type: 'apa' | 'mla'
    author?: string
    title?: string
    year?: string
    publisher?: string
    url?: string
    accessDate?: string
  }, authToken?: string): Promise<string> {
    try {
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await axiosClient.post('/api/citation', { text: JSON.stringify(citationData) }, { headers })
      return response.data.result
    } catch (error: any) {
      console.error('Citation API error:', error)
      throw new Error(`Citation generation failed: ${error.response?.data?.error || error.message}`)
    }
  },

  // GET request for health check
  async healthCheck(): Promise<any> {
    try {
      const response = await axiosClient.get('/api/health')
      return response.data
    } catch (error: any) {
      console.error('Health check error:', error)
      throw new Error(`Health check failed: ${error.response?.data?.error || error.message}`)
    }
  }
}

export default axiosClient
