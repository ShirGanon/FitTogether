import { ajaxRequest } from './ajaxClient.js';

export function getPostsByWorkoutType() {
  return ajaxRequest({ method: 'GET', url: '/api/stats/posts-by-workout-type' });
}

export function getPostsByMonth() {
  return ajaxRequest({ method: 'GET', url: '/api/stats/posts-by-month' });
}
