import { ajaxRequest } from './ajaxClient.js';

export function register(data) {
  return ajaxRequest({ method: 'POST', url: '/api/auth/register', data });
}

export function login(data) {
  return ajaxRequest({ method: 'POST', url: '/api/auth/login', data });
}

export function logout() {
  return ajaxRequest({ method: 'POST', url: '/api/auth/logout' });
}

export function getMe() {
  return ajaxRequest({ method: 'GET', url: '/api/auth/me' });
}
