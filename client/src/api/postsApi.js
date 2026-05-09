import { ajaxRequest } from './ajaxClient.js';

export function getFeed() {
  return ajaxRequest({ method: 'GET', url: '/api/posts/feed' });
}

export function getMyPosts() {
  return ajaxRequest({ method: 'GET', url: '/api/posts/mine' });
}

export function getGroupPosts(groupId) {
  return ajaxRequest({ method: 'GET', url: `/api/posts/group/${groupId}` });
}

export function searchPosts(params) {
  return ajaxRequest({ method: 'GET', url: '/api/posts/search', params });
}

export function createPost(data) {
  return ajaxRequest({ method: 'POST', url: '/api/posts', data });
}

export function updatePost(id, data) {
  return ajaxRequest({ method: 'PUT', url: `/api/posts/${id}`, data });
}

export function deletePost(id) {
  return ajaxRequest({ method: 'DELETE', url: `/api/posts/${id}` });
}
