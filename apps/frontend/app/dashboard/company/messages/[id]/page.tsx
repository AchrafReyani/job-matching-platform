'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Message {
  id: number;
  senderId: string;
  messageText: string;
  sentAt: string;
}

export default function CompanyChatPage() {
  const router = useRouter();
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  // Fetch messages for this application
  const fetchMessages = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/application/${id}`, {
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
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
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

  if (loading) return <div className="flex justify-center mt-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <Card className="w-full max-w-3xl p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-4 text-center">Chat</h1>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-white h-[60vh] mb-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center mt-4">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                  msg.senderId === 'COMPANY'
                    ? 'bg-blue-100 self-end ml-auto'
                    : 'bg-gray-100'
                }`}
              >
                <p className="text-gray-800">{msg.messageText}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.sentAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
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

        <div className="mt-6 text-center">
          <Button onClick={() => router.push('/dashboard/company/messages')}>
            Back to Messages
          </Button>
        </div>
      </Card>
    </div>
  );
}
