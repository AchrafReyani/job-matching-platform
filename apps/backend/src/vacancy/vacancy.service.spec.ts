import { Test, TestingModule } from '@nestjs/testing';
import { VacancyService } from './vacancy.service';

describe('VacancyService', () => {
  let service: VacancyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VacancyService],
    }).compile();

    service = module.get<VacancyService>(VacancyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
