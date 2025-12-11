import { http, HttpResponse } from 'msw';
import type { Company, CompanyList } from '../../lib/companies/types';

export const companiesHandlers = [
  http.get('/companies', () => {
    const companies: CompanyList = [
      { id: 1, companyName: 'Acme Corp', userId: 'user-1' },
      { id: 2, companyName: 'Globex', userId: 'user-2' },
    ];
    return HttpResponse.json(companies);
  }),

  http.get('/companies/:id', (req) => {
    const id = Number(req.params.id);
    const company: Company = {
      id,
      companyName: `Company ${id}`,
      userId: `user-${id}`,
    };
    return HttpResponse.json(company);
  }),
];
