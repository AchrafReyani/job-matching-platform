export type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED';

export interface Application {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;

  vacancy: {
    id: number;
    title: string;
    company: {
      id: number;
      userId: string;
      companyName: string;
    };
  };

  jobSeeker: {
    id: number;
    userId: string;
    fullName: string;
  };
}

export interface CreateApplicationPayload {
  vacancyId: number;
}

export interface UpdateApplicationPayload {
  status?: ApplicationStatus;
}

export type ApplicationList = Application[];
