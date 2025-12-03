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
  vacancy: {
    title: string;
    role?: string;
    company: {
      companyName: string;
      userId: string;
    };
  };
}

export default function JobSeekerChatPage() {
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

  // Decode JWT to get userId
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

  if (loading)
    return <div className="flex justify-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-(--color-error-dark) text-center mt-10">{error}</div>;

  const companyName = applicationInfo?.vacancy.company.companyName;
  const companyUserId = applicationInfo?.vacancy.company.userId;
  const vacancyTitle = applicationInfo?.vacancy.title;

  return (
    <div className="min-h-screen bg-(--color-bg) p-6 flex flex-col items-center text-(--color-text)">
      <Card className="w-full max-w-3xl p-6 flex flex-col bg-(--color-secondary) text-(--color-text)">
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <h1 className="text-2xl font-bold text-center">
            {companyName ? `Chat with ${companyName}` : 'Chat'}
          </h1>
          {vacancyTitle && (
            <p className="text-(--color-muted) mt-1 text-center">
              Regarding position: <span className="font-medium">{vacancyTitle}</span>
            </p>
          )}
          {companyUserId && (
            <div className="mt-3">
              <Button
                variant="outline"
                className="border-(--color-muted) text-(--color-text) hover:bg-secondary-dark"
                onClick={() => router.push(`/profiles/${companyUserId}`)}
              >
                View Company Profile
              </Button>
            </div>
          )}
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-(--color-bg) h-[60vh] mb-4 flex flex-col">
          {messages.length === 0 ? (
            <p className="text-(--color-muted) text-center mt-4">No messages yet.</p>
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
                        ? 'bg-(--color-primary) text-(--color-on-primary) rounded-br-none'
                        : 'bg-muted-light text-(--color-text) rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.messageText}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isSent
                          ? 'text-(--color-on-primary) text-right'
                          : 'text-(--color-text) text-left'
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
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-(--color-primary) bg-(--color-bg) text-(--color-text)"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={sending}
          />
          <Button
            className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <Button
            className="bg-(--color-primary) hover:bg-primary-dark text-(--color-on-primary)"
            onClick={() => router.push('/dashboard/job-seeker/messages')}
          >
            Back to Messages
          </Button>
        </div>
      </Card>
    </div>
  );
}
