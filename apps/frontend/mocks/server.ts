// mocks/server.ts
import { setupServer } from 'msw/node';
import { vacanciesHandlers } from './handlers/vacancies';
import { profilesHandlers } from './handlers/profiles';
import { messagesHandlers } from './handlers/messages';
import { companiesHandlers } from './handlers/companies';
import { authHandlers } from './handlers/auth';
import { applicationsHandlers } from './handlers/applications';

export const server = setupServer(
  ...vacanciesHandlers,
  ...profilesHandlers,
  ...messagesHandlers,
  ...companiesHandlers,
  ...authHandlers,
  ...applicationsHandlers
);
