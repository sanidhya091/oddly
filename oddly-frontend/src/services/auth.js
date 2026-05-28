import { login, register, saveToken } from './api'

export const loginUser = async (email, password) => {
  const data = await login({ email, password })
  saveToken(data.token)
  localStorage.setItem('oddly_user', JSON.stringify({
    id: data.id,
    name: data.name,
    email: data.email,
    handle: data.handle,
  }))
  return data
}

export const registerUser = async (name, email, password) => {
  const data = await register({ name, email, password })
  saveToken(data.token)
  localStorage.setItem('oddly_user', JSON.stringify({
    id: data.id,
    name: data.name,
    email: data.email,
    handle: data.handle,
  }))
  return data
}

export const getUser = () => {
  const u = localStorage.getItem('oddly_user')
  return u ? JSON.parse(u) : null
}

export const logoutUser = () => {
  localStorage.removeItem('oddly_token')
  localStorage.removeItem('oddly_user')
}

export const isAuthenticated = () => !!localStorage.getItem('oddly_token')