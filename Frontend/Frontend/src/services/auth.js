import api from './api'

export async function loginUser(credentials) {
  const response = await api.post('/auth/login/', credentials)
  return response.data
}

export async function registerSchool(payload) {
  const response = await api.post('/auth/register-school/', payload)
  return response.data
}

export async function activateAccount(payload) {
  const response = await api.post('/auth/activate-account/', payload)
  return response.data
}
