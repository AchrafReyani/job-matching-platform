'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Sender {
  id: string;
  email: string;
  role: string;
}

interface Message {
  id: number;
  senderId: string;
  messageText: string;
  sentAt: string;
  sender: Sender;
}

interface ApplicationInfo {
  jobSeeker: {
    id: string;
    fullName: string;
    userId: string;
  };
  vacancy: {
    title: string;
    role?: string;
  };
}

export default function CompanyChatPage() {
  const router = useRouter();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [applicationInfo, setApplicationInfo] = useState<ApplicationInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Decode JWT to extract user ID (sub)
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch {
        console.warn('Failed to decode token');
      }
    }
  }, [token]);

  /** Fetch application info */
  const fetchApplicationInfo = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/applications/details/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch application info');
      const data = await res.json();
      setApplicationInfo(data);
    } catch (err) {
      console.error(err);
      setError('Could not load application info.');
    }
  };

  /** Fetch messages */
  const fetchMessages = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationInfo();
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId: Number(id),
          messageText: newMessage.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error(err);
      setError('Could not send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-10 text-[var(--color-text)]">Loading...</div>;
  if (error) return <div className="text-[var(--color-error-dark)] text-center mt-10">{error}</div>;

  const jobSeekerName = applicationInfo?.jobSeeker.fullName;
  const jobSeekerUserId = applicationInfo?.jobSeeker.userId;
  const vacancyTitle = applicationInfo?.vacancy.title;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-6 flex flex-col items-center text-[var(--color-text)]">
      <Card className="w-full max-w-3xl p-6 flex flex-col bg-[var(--color-secondary)] text-[var(--color-text)]">
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-2xl font-bold text-center">
            {jobSeekerName ? `Chat with ${jobSeekerName}` : 'Chat'}
          </h1>
          {vacancyTitle && (
            <p className="text-[var(--color-muted)] mt-1 text-center">
              Regarding position: <span className="font-medium">{vacancyTitle}</span>
            </p>
          )}
          {jobSeekerUserId && (
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={() => router.push(`/profiles/${jobSeekerUserId}`)}
                className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-accent)]"
              >
                View Job Seeker Profile
              </Button>
            </div>
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-[var(--color-bg)] h-[60vh] mb-4 flex flex-col">
          {messages.length === 0 ? (
            <p className="text-[var(--color-muted)] text-center mt-4">No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isSent = msg.senderId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${isSent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isSent
                        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-br-none'
                        : 'bg-[var(--color-muted-light)] text-[var(--color-text)] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.messageText}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isSent
                          ? 'text-[var(--color-on-primary)] text-right'
                          : 'text-[var(--color-text)] text-left' // <-- dynamic, adapts to light/dark
                      }`}
                    >
                      {new Date(msg.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--color-primary)] bg-[var(--color-bg)] text-[var(--color-text)]"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={sending}
          />
          <Button onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard/company/messages')}>
            Back to Messages
          </Button>
        </div>
      </Card>
    </div>
  );
}
