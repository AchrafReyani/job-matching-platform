// Shared Jest setup for API tests
// Provide a sane default API base URL so fetch() receives a valid absolute URL
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// We no longer start MSW globally here. Suites that need MSW should manage the
// server themselves (see mocks/server). This prevents global interceptors from
// clashing with tests that mock fetch().
