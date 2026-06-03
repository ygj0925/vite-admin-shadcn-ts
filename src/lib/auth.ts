const TOKEN_KEY = 'continew-token'
const LOGIN_CORP_KEY = 'continew-login-corp'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getLoginCorp(): string | null {
  return localStorage.getItem(LOGIN_CORP_KEY)
}

export function setLoginCorp(corp: string): void {
  localStorage.setItem(LOGIN_CORP_KEY, corp)
}

export function clearLoginCorp(): void {
  localStorage.removeItem(LOGIN_CORP_KEY)
}
