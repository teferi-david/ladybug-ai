import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Create Axios instance with proper configuration
const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  timeout: 30000, // 30 second timeout
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
  // POST request for humanize
  async humanizeText(text: string, level: 'highschool' | 'college' | 'graduate' = 'highschool', authToken?: string): Promise<string> {
    try {
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await axiosClient.post('/api/humanize', { text, level }, { headers })
      return response.data.result
    } catch (error: any) {
      console.error('Humanize API error:', error)
      throw new Error(`Humanization failed: ${error.response?.data?.error || error.message}`)
    }
  },

  // POST request for paraphrase
  async paraphraseText(text: string, authToken?: string): Promise<string> {
    try {
      const headers: any = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await axiosClient.post('/api/paraphrase', { text }, { headers })
      return response.data.result
    } catch (error: any) {
      console.error('Paraphrase API error:', error)
      throw new Error(`Paraphrasing failed: ${error.response?.data?.error || error.message}`)
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
