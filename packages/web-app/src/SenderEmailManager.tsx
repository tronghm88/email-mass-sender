import React, { useState } from 'react';
import { FiCheckCircle, FiTrash2 } from 'react-icons/fi';

interface SenderEmail {
  id: number;
  email: string;
}

const mockEmails: SenderEmail[] = [
  { id: 1, email: 'sender1@example.com' },
  { id: 2, email: 'sender2@example.com' },
];

const SenderEmailManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emails, setEmails] = useState<SenderEmail[]>(mockEmails);
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setEmails(prev => [...prev, { id: Date.now(), email }]);
      setEmail('');
      setLoading(false);
    }, 700);
  };

  const handleDelete = (id: number) => {
    setEmails(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý email sender</h2>
      <form className="flex flex-col sm:flex-row gap-3 mb-8" onSubmit={handleVerify}>
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
          <FiCheckCircle className="mr-2" />
          Xác thực email
        </button>
      </form>
      <div className="divide-y divide-gray-200">
        {emails.length === 0 && (
          <div className="text-gray-500 text-center py-6">Chưa có email sender nào.</div>
        )}
        {emails.map(item => (
          <div key={item.id} className="flex items-center justify-between py-3 group">
            <span className="text-gray-800 font-medium">{item.email}</span>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 rounded-full hover:bg-red-100 text-red-600 transition group-hover:scale-110"
              title="Xoá email"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SenderEmailManager;
