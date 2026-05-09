import { ajaxRequest } from './ajaxClient.js';

export function listGroups() {
  return ajaxRequest({ method: 'GET', url: '/api/groups' });
}

export function searchGroups(params) {
  return ajaxRequest({ method: 'GET', url: '/api/groups/search', params });
}

export function getGroup(id) {
  return ajaxRequest({ method: 'GET', url: `/api/groups/${id}` });
}

export function createGroup(data) {
  return ajaxRequest({ method: 'POST', url: '/api/groups', data });
}

export function updateGroup(id, data) {
  return ajaxRequest({ method: 'PUT', url: `/api/groups/${id}`, data });
}

export function deleteGroup(id) {
  return ajaxRequest({ method: 'DELETE', url: `/api/groups/${id}` });
}

export function joinGroup(id) {
  return ajaxRequest({ method: 'POST', url: `/api/groups/${id}/join` });
}

export function requestJoin(id) {
  return ajaxRequest({ method: 'POST', url: `/api/groups/${id}/request` });
}

export function approveRequest(groupId, userId) {
  return ajaxRequest({ method: 'POST', url: `/api/groups/${groupId}/approve/${userId}` });
}

export function rejectRequest(groupId, userId) {
  return ajaxRequest({ method: 'POST', url: `/api/groups/${groupId}/reject/${userId}` });
}

export function removeMember(groupId, userId) {
  return ajaxRequest({ method: 'DELETE', url: `/api/groups/${groupId}/members/${userId}` });
}
