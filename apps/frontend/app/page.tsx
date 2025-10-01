'use client';

import { useState, useEffect } from 'react';

interface Job {
  id: number;
  title: string;
  description: string;
}
//empty comment
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchJobs = async () => {
    const res = await fetch(`${API_URL}/jobs`);
    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const submitJob = async () => {
    await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    await fetchJobs();
    setTitle('');
    setDescription('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Job Matching</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={submitJob}>Add Job</button>
      </div>

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <strong>{job.title}</strong>: {job.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
