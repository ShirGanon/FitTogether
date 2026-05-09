import { ajaxRequest } from './ajaxClient.js';

export function getConversation(userId) {
  return ajaxRequest({ method: 'GET', url: `/api/messages/conversation/${userId}` });
}

export function searchMessages(params) {
  return ajaxRequest({ method: 'GET', url: '/api/messages/search', params });
}

export function markRead(id) {
  return ajaxRequest({ method: 'PUT', url: `/api/messages/${id}/read` });
}

export function deleteMessage(id) {
  return ajaxRequest({ method: 'DELETE', url: `/api/messages/${id}` });
}
