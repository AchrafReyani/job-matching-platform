import { Test, TestingModule } from '@nestjs/testing';
import { CreateMessageUseCase } from './create-message.usecase';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as messageRepository from '../repository/message.repository';

describe('CreateMessageUseCase', () => {
  let useCase: CreateMessageUseCase;
  const mockRepo = {
    create: jest.fn(),
    findApplicationWithParticipants: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMessageUseCase,
        {
          provide: messageRepository.MESSAGE_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateMessageUseCase>(CreateMessageUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a message successfully', async () => {
    const application = {
      id: 1,
      status: 'ACCEPTED',
      jobSeeker: { user: { id: 'user-1' } },
      vacancy: { company: { user: { id: 'company-1' } } },
    };
    mockRepo.findApplicationWithParticipants.mockResolvedValue(application);
    mockRepo.create.mockResolvedValue({
      id: 100,
      applicationId: 1,
      senderId: 'user-1',
      messageText: 'Hello!',
    });

    const dto = { applicationId: 1, messageText: 'Hello!' };
    const result = await useCase.execute('user-1', dto);

    expect(mockRepo.findApplicationWithParticipants).toHaveBeenCalledWith(1);
    expect(mockRepo.create).toHaveBeenCalledWith(1, 'user-1', 'Hello!');
    expect(result).toEqual({
      id: 100,
      applicationId: 1,
      senderId: 'user-1',
      messageText: 'Hello!',
    });
  });

  it('should throw NotFoundException if application not found', async () => {
    mockRepo.findApplicationWithParticipants.mockResolvedValue(null);

    const dto = { applicationId: 999, messageText: 'Hello!' };
    await expect(useCase.execute('user-1', dto)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException if application not accepted', async () => {
    const application = {
      id: 1,
      status: 'APPLIED',
      jobSeeker: { user: { id: 'user-1' } },
      vacancy: { company: { user: { id: 'company-1' } } },
    };
    mockRepo.findApplicationWithParticipants.mockResolvedValue(application);

    const dto = { applicationId: 1, messageText: 'Hello!' };
    await expect(useCase.execute('user-1', dto)).rejects.toThrow(
      ForbiddenException,
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

    const dto = { applicationId: 1, messageText: 'Hello!' };
    await expect(useCase.execute('other-user', dto)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
