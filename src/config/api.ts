import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_PREFIX = import.meta.env.VITE_API_PREFIX || ''

const getApiUrl = () => {
  const baseUrl = API_BASE_URL.replace(/\/$/, '')
  const prefix = API_PREFIX.replace(/^\/|\/$/g, '')
  return prefix ? `${baseUrl}/${prefix}` : baseUrl
}

export const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      if (response.data.success === true && 'result' in response.data) {
        response.data = response.data.result
      }
    }

    return response
  },
  (error) => Promise.reject(error),
)

export default api
