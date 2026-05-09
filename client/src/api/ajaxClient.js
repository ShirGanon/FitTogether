// Centralized jQuery Ajax wrapper for FitTogether.
//
// The course requires extensive use of jQuery + jQuery Ajax. Every API file in
// the project (authApi, usersApi, groupsApi, postsApi, messagesApi, statsApi)
// MUST go through this module so we have a single, consistent place that:
//   - sets the JSON content type and dataType,
//   - sends cookies (withCredentials) so server sessions work,
//   - normalizes errors into a plain Error object the UI can render.

import $ from 'jquery';

export function ajaxRequest({ method, url, data, params }) {
  let finalUrl = url;
  if (params) {
    const qs = $.param(params);
    if (qs) finalUrl += (url.includes('?') ? '&' : '?') + qs;
  }

  const settings = {
    method,
    url: finalUrl,
    contentType: 'application/json',
    dataType: 'json',
    xhrFields: { withCredentials: true },
  };

  if (data !== undefined && method !== 'GET') {
    settings.data = JSON.stringify(data);
  }

  // Wrap in Promise.resolve() so callers get a native Promise with .finally().
  // jQuery's deferred has .then() and .catch() but not .finally().
  return Promise.resolve(
    $.ajax(settings).then(
      (response) => response,
      (jqXHR) => {
        const message =
          (jqXHR.responseJSON && jqXHR.responseJSON.error) ||
          jqXHR.statusText ||
          'Network error';
        const err = new Error(message);
        err.status = jqXHR.status;
        throw err;
      }
    )
  );
}
