import { Test, TestingModule } from '@nestjs/testing';
import { GetMessagesUseCase } from './get-messages.usecase';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as messageRepository from '../repository/message.repository';

describe('GetMessagesUseCase', () => {
  let useCase: GetMessagesUseCase;
  const mockRepo = {
    findByApplicationId: jest.fn(),
    findApplicationWithParticipants: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMessagesUseCase,
        {
          provide: messageRepository.MESSAGE_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetMessagesUseCase>(GetMessagesUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return messages for a participant (job seeker)', async () => {
    const application = {
      id: 1,
      status: 'ACCEPTED',
      jobSeeker: { user: { id: 'user-1' } },
      vacancy: { company: { user: { id: 'company-1' } } },
    };
    const messages = [
      { id: 1, messageText: 'Hello!' },
      { id: 2, messageText: 'Hi there!' },
    ];
    mockRepo.findApplicationWithParticipants.mockResolvedValue(application);
    mockRepo.findByApplicationId.mockResolvedValue(messages);

    const result = await useCase.execute(1, 'user-1');

    expect(mockRepo.findApplicationWithParticipants).toHaveBeenCalledWith(1);
    expect(mockRepo.findByApplicationId).toHaveBeenCalledWith(1);
    expect(result).toEqual(messages);
  });

  it('should return messages for a participant (company)', async () => {
    const application = {
      id: 1,
      status: 'ACCEPTED',
      jobSeeker: { user: { id: 'user-1' } },
      vacancy: { company: { user: { id: 'company-1' } } },
    };
    const messages = [{ id: 1, messageText: 'Hello!' }];
    mockRepo.findApplicationWithParticipants.mockResolvedValue(application);
    mockRepo.findByApplicationId.mockResolvedValue(messages);

    const result = await useCase.execute(1, 'company-1');

    expect(result).toEqual(messages);
  });

  it('should throw NotFoundException if application not found', async () => {
    mockRepo.findApplicationWithParticipants.mockResolvedValue(null);

    await expect(useCase.execute(999, 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if user is not a participant', async () => {
    const application = {
      id: 1,
      status: 'ACCEPTED',
      jobSeeker: { user: { id: 'user-1' } },
      vacancy: { company: { user: { id: 'company-1' } } },
    };
    mockRepo.findApplicationWithParticipants.mockResolvedValue(application);

    await expect(useCase.execute(1, 'other-user')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
