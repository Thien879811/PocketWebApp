import axios from 'axios'

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', // Use environment variables
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: Attach Token (if available)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // Use secure storage or store access in Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global Error Handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Logic for 401 Unauthorized: Logout, clear store, redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
