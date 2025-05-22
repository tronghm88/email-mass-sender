import React, { useState } from 'react';
import { ListGuesser, useDataProvider, useNotify, useRefresh } from 'react-admin';

interface SenderEmail {
  id: number;
  email: string;
}

const mockEmails: SenderEmail[] = [
  { id: 1, email: 'sender1@example.com' },
  { id: 2, email: 'sender2@example.com' },
];

const SenderEmailManager: React.FC = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await dataProvider.create('senders', { data: { email } });
      notify('Email added successfully', { type: 'success' });
      refresh();
      setEmail('');
    } catch (error) {
      notify('Error adding email', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý email sender</h2>
      <form className="flex flex-col sm:flex-row gap-3 mb-8" onSubmit={handleAddEmail}>
        <input
          type="email"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
          placeholder="Nhập địa chỉ email..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading}
        >
          Xác thực email
        </button>
      </form>
      <ListGuesser />
    </div>
  );
};

export default SenderEmailManager;
