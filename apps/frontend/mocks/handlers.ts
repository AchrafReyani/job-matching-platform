import { http, HttpResponse } from 'msw';

// Only RELATIVE URLs — NO env vars, NO localhost
export const handlers = [
  http.get('/vacancies', () => {
    return HttpResponse.json([
      { id: 1, title: 'Dev' }
    ]);
  }),

  http.get('/test', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/secure', () => {
    return HttpResponse.json({ ok: true });
  }),
];
