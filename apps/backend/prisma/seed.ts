import { PrismaClient, Role, ApplicationStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.message.deleteMany();
  await prisma.application.deleteMany();
  await prisma.vacancy.deleteMany();
  await prisma.jobSeeker.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // Hash for all demo passwords: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // ============================================
  // CREATE USERS
  // ============================================

  // Job Seekers
  const alice = await prisma.user.create({
    data: {
      id: '5012671a-46ed-4355-80af-86940fcb9b3c',
      email: 'alice@example.com',
      passwordHash,
      role: Role.JOB_SEEKER,
    },
  });

  const bob = await prisma.user.create({
    data: {
      id: 'a71faead-997c-4230-9fe8-b1d1848e548d',
      email: 'bob@example.com',
      passwordHash,
      role: Role.JOB_SEEKER,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      id: '432427e1-02a8-469b-99a8-7c80b7c819dd',
      email: 'charlie@example.com',
      passwordHash,
      role: Role.JOB_SEEKER,
    },
  });

  const diana = await prisma.user.create({
    data: {
      id: '5c343f01-8817-4dbe-910f-e65fd80ca658',
      email: 'diana@example.com',
      passwordHash,
      role: Role.JOB_SEEKER,
    },
  });

  const evan = await prisma.user.create({
    data: {
      id: 'f6731b37-6601-49fc-9d31-07c651e42f19',
      email: 'evan@example.com',
      passwordHash,
      role: Role.JOB_SEEKER,
    },
  });

  // Companies
  const techCorpUser = await prisma.user.create({
    data: {
      id: '4ed8ecab-7760-4c1e-94bc-3f7feaae1fc4',
      email: 'hr@techcorp.com',
      passwordHash,
      role: Role.COMPANY,
    },
  });

  const innovateUser = await prisma.user.create({
    data: {
      id: 'e4f66676-ec04-4ff8-acf6-d67475f93369',
      email: 'hr@innovate.io',
      passwordHash,
      role: Role.COMPANY,
    },
  });

  const startupUser = await prisma.user.create({
    data: {
      id: '7a2d3f49-d1a8-4db3-a1fd-5fd73267b370',
      email: 'hr@startup.dev',
      passwordHash,
      role: Role.COMPANY,
    },
  });

  const acmeUser = await prisma.user.create({
    data: {
      id: '87ab05a1-988f-4bde-bf84-36b024ac12f5',
      email: 'hr@acme.com',
      passwordHash,
      role: Role.COMPANY,
    },
  });

  // ============================================
  // CREATE JOB SEEKER PROFILES
  // ============================================

  const aliceProfile = await prisma.jobSeeker.create({
    data: {
      userId: alice.id,
      fullName: 'Alice Johnson',
      portfolioUrl: 'https://alice-portfolio.dev',
      experienceSummary:
        '3 years of frontend development experience with React, TypeScript, and Next.js. Passionate about creating accessible and performant web applications.',
    },
  });

  const bobProfile = await prisma.jobSeeker.create({
    data: {
      userId: bob.id,
      fullName: 'Bob Smith',
      portfolioUrl: 'https://bobsmith.io',
      experienceSummary:
        'Full-stack developer with 5 years experience. Skilled in Node.js, Python, and cloud infrastructure (AWS, GCP).',
    },
  });

  const charlieProfile = await prisma.jobSeeker.create({
    data: {
      userId: charlie.id,
      fullName: 'Charlie Brown',
      portfolioUrl: null,
      experienceSummary:
        'Junior developer looking for opportunities to grow. Recently completed a coding bootcamp specializing in JavaScript.',
    },
  });

  const dianaProfile = await prisma.jobSeeker.create({
    data: {
      userId: diana.id,
      fullName: 'Diana Prince',
      portfolioUrl: 'https://diana.dev',
      experienceSummary:
        'Senior software engineer with 8 years of experience. Expert in distributed systems, microservices, and DevOps practices.',
    },
  });

  const evanProfile = await prisma.jobSeeker.create({
    data: {
      userId: evan.id,
      fullName: 'Evan Williams',
      portfolioUrl: 'https://evanwilliams.tech',
      experienceSummary:
        'Backend engineer specializing in Go and Rust. Experience with high-performance systems and real-time applications.',
    },
  });

  // ============================================
  // CREATE COMPANY PROFILES
  // ============================================

  const techCorp = await prisma.company.create({
    data: {
      userId: techCorpUser.id,
      companyName: 'TechCorp Solutions',
      websiteUrl: 'https://techcorp.com',
      description:
        'Leading enterprise software company building innovative solutions for Fortune 500 clients. We value collaboration, innovation, and work-life balance.',
    },
  });

  const innovate = await prisma.company.create({
    data: {
      userId: innovateUser.id,
      companyName: 'Innovate.io',
      websiteUrl: 'https://innovate.io',
      description:
        'Fast-growing startup disrupting the fintech space with AI-powered solutions. Join us to shape the future of finance.',
    },
  });

  const startup = await prisma.company.create({
    data: {
      userId: startupUser.id,
      companyName: 'Startup Labs',
      websiteUrl: 'https://startup.dev',
      description:
        'Early-stage startup building developer tools. Small team, big impact. Equity compensation available.',
    },
  });

  const acme = await prisma.company.create({
    data: {
      userId: acmeUser.id,
      companyName: 'Acme Corporation',
      websiteUrl: 'https://acme.com',
      description:
        'Established company with 50+ years of history. We build everything from software to rockets. Great benefits and job security.',
    },
  });

  // ============================================
  // CREATE VACANCIES
  // ============================================

  const vacancy1 = await prisma.vacancy.create({
    data: {
      companyId: techCorp.id,
      title: 'Senior Frontend Developer',
      salaryRange: '$120k - $150k',
      role: 'Frontend',
      jobDescription:
        'We are looking for a Senior Frontend Developer to join our product team. You will be responsible for building and maintaining our customer-facing web applications using React and TypeScript. Requirements: 5+ years of experience, strong TypeScript skills, experience with state management (Redux/Zustand).',
    },
  });

  const vacancy2 = await prisma.vacancy.create({
    data: {
      companyId: techCorp.id,
      title: 'Backend Engineer',
      salaryRange: '$130k - $160k',
      role: 'Backend',
      jobDescription:
        'Join our backend team to build scalable APIs and services. You will work with Node.js, PostgreSQL, and AWS. Requirements: 3+ years of backend experience, familiarity with microservices architecture, experience with SQL databases.',
    },
  });

  const vacancy3 = await prisma.vacancy.create({
    data: {
      companyId: innovate.id,
      title: 'Full Stack Developer',
      salaryRange: '$100k - $130k',
      role: 'Full Stack',
      jobDescription:
        'Looking for a versatile developer to work on our fintech platform. You will work across the entire stack, from React frontend to Python/Django backend. Startup experience preferred.',
    },
  });

  const vacancy4 = await prisma.vacancy.create({
    data: {
      companyId: innovate.id,
      title: 'DevOps Engineer',
      salaryRange: '$140k - $170k',
      role: 'DevOps',
      jobDescription:
        'Help us scale our infrastructure! You will manage our Kubernetes clusters, CI/CD pipelines, and monitoring systems. Experience with Terraform and cloud platforms required.',
    },
  });

  const vacancy5 = await prisma.vacancy.create({
    data: {
      companyId: startup.id,
      title: 'Founding Engineer',
      salaryRange: '$90k - $120k + Equity',
      role: 'Full Stack',
      jobDescription:
        'Join as one of our first engineers and shape the technical direction of the company. Looking for a generalist who can wear many hats. Significant equity package included.',
    },
  });

  const vacancy6 = await prisma.vacancy.create({
    data: {
      companyId: acme.id,
      title: 'Junior Developer',
      salaryRange: '$60k - $80k',
      role: 'Junior',
      jobDescription:
        'Great opportunity for recent graduates or bootcamp completers. You will learn from senior engineers while contributing to real projects. Mentorship program included.',
    },
  });

  // ============================================
  // CREATE APPLICATIONS
  // ============================================

  const app1 = await prisma.application.create({
    data: {
      vacancyId: vacancy1.id,
      jobSeekerId: aliceProfile.id,
      status: ApplicationStatus.ACCEPTED,
    },
  });

  const app2 = await prisma.application.create({
    data: {
      vacancyId: vacancy3.id,
      jobSeekerId: dianaProfile.id,
      status: ApplicationStatus.ACCEPTED,
    },
  });

  const app3 = await prisma.application.create({
    data: {
      vacancyId: vacancy5.id,
      jobSeekerId: dianaProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  const app4 = await prisma.application.create({
    data: {
      vacancyId: vacancy2.id,
      jobSeekerId: bobProfile.id,
      status: ApplicationStatus.ACCEPTED,
    },
  });

  const app5 = await prisma.application.create({
    data: {
      vacancyId: vacancy6.id,
      jobSeekerId: charlieProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  const app6 = await prisma.application.create({
    data: {
      vacancyId: vacancy4.id,
      jobSeekerId: evanProfile.id,
      status: ApplicationStatus.REJECTED,
    },
  });

  const app7 = await prisma.application.create({
    data: {
      vacancyId: vacancy1.id,
      jobSeekerId: evanProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  // ============================================
  // CREATE MESSAGES (for accepted applications)
  // ============================================

  // Conversation between Alice and TechCorp about Senior Frontend position
  await prisma.message.createMany({
    data: [
      {
        applicationId: app1.id,
        senderId: techCorpUser.id,
        messageText:
          'Hi Alice! Thanks for applying. Your portfolio looks impressive. When would you be available for a technical interview?',
        sentAt: new Date('2025-10-15T10:00:00Z'),
        readAt: new Date('2025-10-15T10:30:00Z'),
      },
      {
        applicationId: app1.id,
        senderId: alice.id,
        messageText:
          "Thank you! I'm available any day next week in the afternoon. Looking forward to it!",
        sentAt: new Date('2025-10-15T10:35:00Z'),
        readAt: new Date('2025-10-15T11:00:00Z'),
      },
      {
        applicationId: app1.id,
        senderId: techCorpUser.id,
        messageText:
          "Perfect! Let's schedule for Tuesday at 2 PM. I'll send you a calendar invite with the meeting link.",
        sentAt: new Date('2025-10-15T11:05:00Z'),
        readAt: new Date('2025-10-15T11:10:00Z'),
      },
      {
        applicationId: app1.id,
        senderId: alice.id,
        messageText: 'Sounds great! See you then.',
        sentAt: new Date('2025-10-15T11:15:00Z'),
      },
    ],
  });

  // Conversation between Diana and Innovate about Full Stack position
  await prisma.message.createMany({
    data: [
      {
        applicationId: app2.id,
        senderId: innovateUser.id,
        messageText:
          "Diana, we loved your application! Your experience with distributed systems is exactly what we need. Are you open to discussing the role?",
        sentAt: new Date('2025-10-20T09:00:00Z'),
        readAt: new Date('2025-10-20T09:15:00Z'),
      },
      {
        applicationId: app2.id,
        senderId: diana.id,
        messageText:
          "Absolutely! I'm very interested in the fintech space. Could you tell me more about the tech stack and team structure?",
        sentAt: new Date('2025-10-20T09:20:00Z'),
        readAt: new Date('2025-10-20T09:30:00Z'),
      },
      {
        applicationId: app2.id,
        senderId: innovateUser.id,
        messageText:
          "We use React/Next.js on the frontend and Python/Django on the backend. The team is about 12 engineers, split into feature teams. We're growing fast!",
        sentAt: new Date('2025-10-20T09:35:00Z'),
        readAt: new Date('2025-10-20T10:00:00Z'),
      },
      {
        applicationId: app2.id,
        senderId: diana.id,
        messageText:
          "That sounds exciting! I have extensive experience with both React and Python. What's the interview process like?",
        sentAt: new Date('2025-10-20T10:05:00Z'),
        readAt: new Date('2025-10-20T10:15:00Z'),
      },
      {
        applicationId: app2.id,
        senderId: innovateUser.id,
        messageText:
          "It's a 3-stage process: initial chat, technical assessment (take-home or live coding, your choice), and final team fit interview. Usually wraps up in 2 weeks.",
        sentAt: new Date('2025-10-20T10:20:00Z'),
      },
    ],
  });

  // Conversation between Bob and TechCorp about Backend position
  await prisma.message.createMany({
    data: [
      {
        applicationId: app4.id,
        senderId: techCorpUser.id,
        messageText:
          'Hi Bob! Your full-stack experience caught our attention. We think you would be a great fit for our backend team.',
        sentAt: new Date('2025-10-18T14:00:00Z'),
        readAt: new Date('2025-10-18T14:30:00Z'),
      },
      {
        applicationId: app4.id,
        senderId: bob.id,
        messageText:
          "Thanks for reaching out! I've been wanting to focus more on backend work. What projects would I be working on?",
        sentAt: new Date('2025-10-18T14:35:00Z'),
        readAt: new Date('2025-10-18T15:00:00Z'),
      },
      {
        applicationId: app4.id,
        senderId: techCorpUser.id,
        messageText:
          "You'd be working on our core API platform that serves millions of requests daily. Lots of interesting scaling challenges!",
        sentAt: new Date('2025-10-18T15:10:00Z'),
      },
    ],
  });

  console.log('Seeding completed successfully!');
  console.log('');
  console.log('Demo accounts (all passwords: "password123"):');
  console.log('');
  console.log('Job Seekers:');
  console.log('  - alice@example.com');
  console.log('  - bob@example.com');
  console.log('  - charlie@example.com');
  console.log('  - diana@example.com');
  console.log('  - evan@example.com');
  console.log('');
  console.log('Companies:');
  console.log('  - hr@techcorp.com (TechCorp Solutions)');
  console.log('  - hr@innovate.io (Innovate.io)');
  console.log('  - hr@startup.dev (Startup Labs)');
  console.log('  - hr@acme.com (Acme Corporation)');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
