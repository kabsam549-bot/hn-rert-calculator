'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  defaultContent,
  type EditableContent,
  type EditableDoseRegimen,
  type EditableGuideline,
  type EditableOARConstraint,
  type EditableReference,
} from '@/lib/editableContent';

type TabKey = 'oar' | 'regimens' | 'guidelines' | 'references' | 'request' | 'tickets' | 'audit';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

type TicketCategory = 'Clinical Parameters' | 'Dosimetry' | 'UI-UX' | 'Data' | 'Bug';

type TicketStatus = 'Submitted' | 'In Progress' | 'Done' | 'Verified';

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

interface AuditEntry {
  timestamp: string;
  author: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

const ADMIN_PASSWORD =
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD ??
  process.env.ADMIN_PASSWORD ??
  'phan2025admin';

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return 'N/A';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const statusStyles: Record<string, string> = {
  Submitted: 'bg-blue-100 text-blue-700 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Done: 'bg-green-100 text-green-700 border-green-200',
  Verified: 'bg-gray-100 text-gray-700 border-gray-200',
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}`;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [authError, setAuthError] = useState('');
  const [editorName, setEditorName] = useState('Jack Phan');

  const [content, setContent] = useState<EditableContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<TabKey>('oar');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState('');

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

  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const response = await fetch('/api/content');
        if (!response.ok) {
          throw new Error('Failed to load content');
        }
        const data = (await response.json()) as EditableContent;
        if (isMounted) {
          setContent(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError('Unable to load content. Using defaults.');
          setContent(defaultContent);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== 'tickets') {
      return;
    }

    const loadTickets = async () => {
      setTicketsLoading(true);
      setTicketsError('');
      try {
        const response = await fetch('/api/tickets');
        if (!response.ok) {
          throw new Error('Failed to load tickets');
        }
        const data = (await response.json()) as Ticket[];
        setTickets(data);
      } catch (error) {
        setTicketsError('Unable to load tickets.');
      } finally {
        setTicketsLoading(false);
      }
    };

    loadTickets();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'audit') {
      return;
    }

    const loadAudit = async () => {
      setAuditLoading(true);
      setAuditError('');
      try {
        const response = await fetch('/api/audit');
        if (!response.ok) {
          throw new Error('Failed to load audit log');
        }
        const data = (await response.json()) as AuditEntry[];
        setAuditLog(data);
      } catch (error) {
        setAuditError('Unable to load audit log.');
      } finally {
        setAuditLoading(false);
      }
    };

    loadAudit();
  }, [activeTab]);

  const tabItems = useMemo(
    () => [
      { key: 'oar', label: 'OAR Constraints' },
      { key: 'regimens', label: 'Dose Regimens' },
      { key: 'guidelines', label: 'Guidelines' },
      { key: 'references', label: 'References' },
      { key: 'request', label: 'Request a Change' },
      { key: 'tickets', label: 'Ticket History' },
      { key: 'audit', label: 'Audit Log' },
    ],
    []
  );

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
    setAuthError('');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    setSaveError('');
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          'x-admin-author': editorName,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Failed to save content');
      }

      const updated = (await response.json()) as EditableContent;
      setContent(updated);
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setSaveError('Save failed. Check your password or KV configuration.');
    }
  };

  const updateOAR = (index: number, updates: Partial<EditableOARConstraint>) => {
    const next = [...content.oarConstraints];
    next[index] = { ...next[index], ...updates };
    setContent({ ...content, oarConstraints: next });
  };

  const addOAR = () => {
    const newItem: EditableOARConstraint = {
      name: 'New OAR',
      tier: 3,
      limitEQD2: 50,
      alphaBeta: 3,
      complication: 'Complication',
      description: 'Description',
    };
    setContent({ ...content, oarConstraints: [...content.oarConstraints, newItem] });
  };

  const deleteOAR = (index: number) => {
    setContent({
      ...content,
      oarConstraints: content.oarConstraints.filter((_, i) => i !== index),
    });
  };

  const updateRegimen = (index: number, updates: Partial<EditableDoseRegimen>) => {
    const next = [...content.doseRegimens];
    next[index] = { ...next[index], ...updates };
    setContent({ ...content, doseRegimens: next });
  };

  const addRegimen = () => {
    const newItem: EditableDoseRegimen = {
      name: 'New Regimen',
      dose: 50,
      fractions: 25,
      intent: 'curative',
      description: 'Description',
    };
    setContent({ ...content, doseRegimens: [...content.doseRegimens, newItem] });
  };

  const deleteRegimen = (index: number) => {
    setContent({
      ...content,
      doseRegimens: content.doseRegimens.filter((_, i) => i !== index),
    });
  };

  const updateGuideline = (index: number, updates: Partial<EditableGuideline>) => {
    const next = [...content.guidelines];
    next[index] = { ...next[index], ...updates };
    setContent({ ...content, guidelines: next });
  };

  const addGuideline = () => {
    const newItem: EditableGuideline = {
      id: createId(),
      title: 'New Guideline',
      content: 'Guideline details',
      category: 'general',
    };
    setContent({ ...content, guidelines: [...content.guidelines, newItem] });
  };

  const deleteGuideline = (index: number) => {
    setContent({
      ...content,
      guidelines: content.guidelines.filter((_, i) => i !== index),
    });
  };

  const updateReference = (index: number, updates: Partial<EditableReference>) => {
    const next = [...content.references];
    next[index] = { ...next[index], ...updates };
    setContent({ ...content, references: next });
  };

  const addReference = () => {
    const newItem: EditableReference = {
      id: createId(),
      citation: 'New reference',
      doi: '',
      category: 'supporting',
    };
    setContent({ ...content, references: [...content.references, newItem] });
  };

  const deleteReference = (index: number) => {
    setContent({
      ...content,
      references: content.references.filter((_, i) => i !== index),
    });
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

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Failed to submit ticket');
      }

      setTicketStatus('success');
      setTicketMessage('Ticket submitted successfully.');
      setTicketForm({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Clinical Parameters',
        submittedBy: ticketForm.submittedBy,
      });
    } catch (error) {
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold">H&amp;N Re-Irradiation Calculator Admin</h1>
            <p className="text-sm text-teal-100">Manage clinical content and tickets</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="text-teal-100">Last updated: {formatDateTime(content.lastUpdated)}</div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">Navigation</div>
            <div className="space-y-1">
              {tabItems.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4 mt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Editor Name</label>
            <input
              type="text"
              value={editorName}
              onChange={(e) => setEditorName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="Editor name"
            />
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{tabItems.find((tab) => tab.key === activeTab)?.label}</h2>
              {loadError && <p className="text-sm text-amber-600 mt-1">{loadError}</p>}
            </div>
            <div className="flex items-center gap-3">
              {saveStatus === 'error' && (
                <span className="text-sm text-red-600">{saveError}</span>
              )}
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  saveStatus === 'saved'
                    ? 'bg-green-600 text-white'
                    : saveStatus === 'saving'
                    ? 'bg-gray-400 text-white cursor-wait'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-center">
              <div className="flex items-center gap-3 text-gray-500">
                <span className="h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                Loading content
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'oar' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-gray-900">OAR Dose Constraints</h3>
                    <button
                      onClick={addOAR}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
                    >
                      Add OAR
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Tier</th>
                          <th className="px-4 py-3 font-semibold">Limit EQD2</th>
                          <th className="px-4 py-3 font-semibold">Alpha/Beta</th>
                          <th className="px-4 py-3 font-semibold">Complication</th>
                          <th className="px-4 py-3 font-semibold">Description</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {content.oarConstraints.map((oar, index) => (
                          <tr key={`${oar.name}-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={oar.name}
                                onChange={(e) => updateOAR(index, { name: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={oar.tier}
                                onChange={(e) => updateOAR(index, { tier: Number(e.target.value) as 1 | 2 | 3 })}
                                className="px-2 py-1 border rounded"
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={oar.limitEQD2}
                                onChange={(e) => updateOAR(index, { limitEQD2: Number(e.target.value) })}
                                className="w-24 px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={oar.alphaBeta}
                                onChange={(e) => updateOAR(index, { alphaBeta: Number(e.target.value) })}
                                className="w-20 px-2 py-1 border rounded"
                                step="0.5"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={oar.complication}
                                onChange={(e) => updateOAR(index, { complication: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={oar.description}
                                onChange={(e) => updateOAR(index, { description: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteOAR(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'regimens' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Standard Dose Regimens</h3>
                    <button
                      onClick={addRegimen}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
                    >
                      Add Regimen
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 font-semibold">Name</th>
                          <th className="px-4 py-3 font-semibold">Dose</th>
                          <th className="px-4 py-3 font-semibold">Fractions</th>
                          <th className="px-4 py-3 font-semibold">Intent</th>
                          <th className="px-4 py-3 font-semibold">Description</th>
                          <th className="px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {content.doseRegimens.map((regimen, index) => (
                          <tr key={`${regimen.name}-${index}`} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={regimen.name}
                                onChange={(e) => updateRegimen(index, { name: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={regimen.dose}
                                onChange={(e) => updateRegimen(index, { dose: Number(e.target.value) })}
                                className="w-24 px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={regimen.fractions}
                                onChange={(e) => updateRegimen(index, { fractions: Number(e.target.value) })}
                                className="w-24 px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={regimen.intent}
                                onChange={(e) => updateRegimen(index, { intent: e.target.value as EditableDoseRegimen['intent'] })}
                                className="px-2 py-1 border rounded"
                              >
                                <option value="curative">Curative</option>
                                <option value="palliative">Palliative</option>
                                <option value="hypofractionated">Hypofractionated</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={regimen.description}
                                onChange={(e) => updateRegimen(index, { description: e.target.value })}
                                className="w-full px-2 py-1 border rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteRegimen(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'guidelines' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Guidelines</h3>
                    <button
                      onClick={addGuideline}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
                    >
                      Add Guideline
                    </button>
                  </div>
                  <div className="space-y-4">
                    {content.guidelines.map((guideline, index) => (
                      <div key={guideline.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between gap-3 mb-2">
                          <input
                            type="text"
                            value={guideline.title}
                            onChange={(e) => updateGuideline(index, { title: e.target.value })}
                            className="w-full px-3 py-2 border rounded font-semibold"
                          />
                          <button
                            onClick={() => deleteGuideline(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <textarea
                          value={guideline.content}
                          onChange={(e) => updateGuideline(index, { content: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                          rows={3}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'references' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-base font-semibold text-gray-900">References</h3>
                    <button
                      onClick={addReference}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
                    >
                      Add Reference
                    </button>
                  </div>
                  <div className="space-y-4">
                    {content.references.map((ref, index) => (
                      <div key={ref.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                          <select
                            value={ref.category}
                            onChange={(e) => updateReference(index, { category: e.target.value as EditableReference['category'] })}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="primary">Primary</option>
                            <option value="supporting">Supporting</option>
                          </select>
                          <button
                            onClick={() => deleteReference(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                        <textarea
                          value={ref.citation}
                          onChange={(e) => updateReference(index, { citation: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
                          rows={2}
                        />
                        <input
                          type="text"
                          value={ref.doi ?? ''}
                          onChange={(e) => updateReference(index, { doi: e.target.value })}
                          placeholder="DOI"
                          className="w-full px-3 py-2 border rounded mt-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'request' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Request a Change</h3>
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        rows={4}
                        required
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={ticketForm.priority}
                          onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as TicketPriority })}
                          className="w-full px-3 py-2 border rounded"
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
                          className="w-full px-3 py-2 border rounded"
                        >
                          <option value="Clinical Parameters">Clinical Parameters</option>
                          <option value="Dosimetry">Dosimetry</option>
                          <option value="UI-UX">UI-UX</option>
                          <option value="Data">Data</option>
                          <option value="Bug">Bug</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                        <input
                          type="text"
                          value={ticketForm.submittedBy}
                          onChange={(e) => setTicketForm({ ...ticketForm, submittedBy: e.target.value })}
                          className="w-full px-3 py-2 border rounded"
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
                        <div className="text-sm text-gray-500">No tickets found.</div>
                      ) : (
                        tickets.map((ticket) => (
                          <div key={ticket.id} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="font-semibold text-gray-900">{ticket.title}</div>
                                <div className="text-sm text-gray-600">{ticket.description}</div>
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
                              <span>Submitted: {formatDateTime(ticket.submittedAt)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Audit Log</h3>
                  {auditLoading ? (
                    <div className="text-sm text-gray-500">Loading audit log...</div>
                  ) : auditError ? (
                    <div className="text-sm text-red-600">{auditError}</div>
                  ) : (
                    <div className="space-y-3">
                      {auditLog.length === 0 ? (
                        <div className="text-sm text-gray-500">No audit entries available.</div>
                      ) : (
                        auditLog.map((entry, index) => (
                          <div key={`${entry.timestamp}-${index}`} className="border rounded-lg p-4 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatDateTime(entry.timestamp)} by {entry.author}
                            </div>
                            <div className="text-sm text-gray-600">Field: {entry.field || 'root'}</div>
                            <div className="text-xs text-gray-500 mt-2">
                              <div className="font-semibold text-gray-600">Change</div>
                              <div className="mt-1">{JSON.stringify(entry.oldValue)} → {JSON.stringify(entry.newValue)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
