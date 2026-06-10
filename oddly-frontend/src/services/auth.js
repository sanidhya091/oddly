import { login, register, saveToken } from './api'

const TOKEN_KEY = 'token'
const USER_KEY  = 'oddly_user'

export const loginUser = async (email, password) => {
  const data = await login({ email, password })
  saveToken(data.token)
  localStorage.setItem(USER_KEY, JSON.stringify({
    id:     data.id,
    name:   data.name,
    email:  data.email,
    handle: data.handle,
  }))
  return data
}

export const registerUser = async (name, email, password) => {
  const data = await register({ name, email, password })
  saveToken(data.token)
  localStorage.setItem(USER_KEY, JSON.stringify({
    id:     data.id,
    name:   data.name,
    email:  data.email,
    handle: data.handle,
  }))
  return data
}

export const getUser = () => {
  const u = localStorage.getItem(USER_KEY)
  return u ? JSON.parse(u) : null
}

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY)