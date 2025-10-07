import { Test, TestingModule } from '@nestjs/testing';
import { VacancyController } from './vacancy.controller';

describe('VacancyController', () => {
  let controller: VacancyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacancyController],
    }).compile();

    controller = module.get<VacancyController>(VacancyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
