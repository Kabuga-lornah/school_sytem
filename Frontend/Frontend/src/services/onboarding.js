import api from './api'

export async function fetchTeachers() {
  const response = await api.get('/admin/teachers/')
  return response.data
}

export async function inviteTeacher(payload) {
  const response = await api.post('/admin/teachers/', payload)
  return response.data
}

export async function approveTeacher(teacherId) {
  const response = await api.post(`/admin/teachers/${teacherId}/approve/`)
  return response.data
}

export async function fetchParentsAndStudents() {
  const response = await api.get('/school/parents/')
  return response.data
}

export async function inviteParent(payload) {
  const response = await api.post('/school/parents/', payload)
  return response.data
}
