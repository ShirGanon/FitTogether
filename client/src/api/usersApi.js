import { ajaxRequest } from './ajaxClient.js';

export function listUsers() {
  return ajaxRequest({ method: 'GET', url: '/api/users' });
}

export function searchUsers(params) {
  return ajaxRequest({ method: 'GET', url: '/api/users/search', params });
}

export function getUser(id) {
  return ajaxRequest({ method: 'GET', url: `/api/users/${id}` });
}

export function updateUser(id, data) {
  return ajaxRequest({ method: 'PUT', url: `/api/users/${id}`, data });
}

export function deleteUser(id) {
  return ajaxRequest({ method: 'DELETE', url: `/api/users/${id}` });
}

export function addFriend(id) {
  return ajaxRequest({ method: 'POST', url: `/api/users/${id}/friends` });
}

export function removeFriend(id) {
  return ajaxRequest({ method: 'DELETE', url: `/api/users/${id}/friends` });
}
