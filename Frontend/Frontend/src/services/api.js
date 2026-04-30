import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

let refreshRequest = null

function redirectToLogin() {
  const role = localStorage.getItem('role') || localStorage.getItem('selected_role') || 'admin'
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_name')
  localStorage.removeItem('role')
  localStorage.setItem('selected_role', role)

  if (window.location.pathname !== `/login`) {
    window.location.href = `/login?role=${role}`
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const refreshToken = localStorage.getItem('refresh_token')

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!refreshToken || originalRequest.url?.includes('/auth/refresh/')) {
      redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshRequest) {
        refreshRequest = axios.post('http://127.0.0.1:8000/api/auth/refresh/', {
          refresh: refreshToken,
        })
      }

      const refreshResponse = await refreshRequest
      const newAccessToken = refreshResponse.data.access
      localStorage.setItem('access_token', newAccessToken)
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      refreshRequest = null
    }
  },
)

export default api
