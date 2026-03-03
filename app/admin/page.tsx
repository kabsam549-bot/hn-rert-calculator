'use client';

import { useEffect, useState } from 'react';

type TabKey = 'request' | 'tickets';

type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TicketCategory = 'Clinical Parameters' | 'Dosimetry' | 'UI-UX' | 'Data' | 'Bug';

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  submittedBy: string;
  submittedAt: string | null;
  completedAt: string | null;
}

const ADMIN_PASSWORD = 'phan2026admin';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const statusStyles: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'In Review': 'bg-purple-100 text-purple-700 border-purple-200',
  Done: 'bg-green-100 text-green-700 border-green-200',
  Verified: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<TabKey>('request');

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as TicketPriority,
    category: 'Clinical Parameters' as TicketCategory,
    submittedBy: 'Jack Phan',
  });
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [ticketMessage, setTicketMessage] = useState('');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');

  useEffect(() => {
    if (activeTab !== 'tickets') return;
    const loadTickets = async () => {
      setTicketsLoading(true);
      setTicketsError('');
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Failed to load tickets');
        const data = (await response.json()) as Ticket[];
        setTickets(data);
      } catch {
        setTicketsError('Unable to load tickets.');
      } finally {
        setTicketsLoading(false);
      }
    };
    loadTickets();
  }, [activeTab]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthToken(password);
      setAuthError('');
    } else {
      setAuthError('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken('');
    setPassword('');
  };

  const handleTicketSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTicketStatus('submitting');
    setTicketMessage('');
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: ticketForm.title,
          description: ticketForm.description,
          priority: ticketForm.priority,
          category: ticketForm.category,
          submittedBy: ticketForm.submittedBy,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit ticket');
      setTicketStatus('success');
      setTicketMessage('Ticket submitted successfully. Changes will be reviewed and deployed.');
      setTicketForm({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Clinical Parameters',
        submittedBy: ticketForm.submittedBy,
      });
    } catch {
      setTicketStatus('error');
      setTicketMessage('Unable to submit ticket.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter admin password"
              />
            </div>
            {authError && <p className="text-red-600 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500 text-center">
            Contact the site administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-700 text-white shadow">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">H&N Re-RT Admin</h1>
            <p className="text-sm text-teal-100">Submit change requests and track progress</p>
          </div>
          <button onClick={handleLogout} className="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded text-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'request' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            Request a Change
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tickets' ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            Ticket History
          </button>
        </div>

        {activeTab === 'request' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Request a Change</h3>
            <p className="text-sm text-gray-500 mb-4">Describe what you want changed. Our team will review and deploy the update.</p>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. Update spinal cord constraint to 48 Gy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={5}
                  placeholder="Describe the change in detail. Include specific values, references, or screenshots if helpful."
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as TicketPriority })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value as TicketCategory })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Clinical Parameters">Clinical Parameters</option>
                    <option value="Dosimetry">Dosimetry</option>
                    <option value="UI-UX">UI/UX</option>
                    <option value="Data">Data</option>
                    <option value="Bug">Bug</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={ticketForm.submittedBy}
                    onChange={(e) => setTicketForm({ ...ticketForm, submittedBy: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={ticketStatus === 'submitting'}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  ticketStatus === 'submitting'
                    ? 'bg-gray-400 text-white cursor-wait'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {ticketStatus === 'submitting' ? 'Submitting...' : 'Submit Request'}
              </button>
              {ticketMessage && (
                <p className={`text-sm ${ticketStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {ticketMessage}
                </p>
              )}
            </form>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Ticket History</h3>
            {ticketsLoading ? (
              <div className="text-sm text-gray-500">Loading tickets...</div>
            ) : ticketsError ? (
              <div className="text-sm text-red-600">{ticketsError}</div>
            ) : (
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-sm text-gray-500">No tickets yet.</div>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">{ticket.title}</div>
                          {ticket.description && (
                            <div className="text-sm text-gray-600 mt-1">{ticket.description}</div>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            statusStyles[ticket.status] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {ticket.status || 'Submitted'}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Priority: {ticket.priority || 'Medium'}</span>
                        <span>Category: {ticket.category || 'General'}</span>
                        <span>By: {ticket.submittedBy || 'Unknown'}</span>
                        <span>Submitted: {formatDateTime(ticket.submittedAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
