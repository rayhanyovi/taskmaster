export interface AuthSession {
  email: string
  token: string
  loggedInAt: string
}

export interface LoginPayload {
  email: string
  password: string
}
