import api from './api'

export async function fetchParentDashboard() {
  const response = await api.get('/parent/dashboard/')
  return response.data
}
