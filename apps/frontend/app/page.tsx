'use client';

import { useState, useEffect } from 'react';

interface Job {
  id: number;
  title: string;
  description: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/jobs')
      .then(res => res.json())
      .then(data => setJobs(data));
  }, []);

  const submitJob = async () => {
    await fetch('http://localhost:3001/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const res = await fetch('http://localhost:3001/jobs');
    setJobs(await res.json());
    setTitle('');
    setDescription('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Job Matching</h1>
      <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <button onClick={submitJob}>Add Job</button>

      <ul>
        {jobs.map(job => (
          <li key={job.id}>{job.title}: {job.description}</li>
        ))}
      </ul>
    </div>
  );
}
