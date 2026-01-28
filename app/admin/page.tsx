'use client';

import { useState } from 'react';
import { defaultContent, type EditableContent, type EditableOARConstraint, type EditableDoseRegimen } from '@/lib/editableContent';

// Simple password protection - in production, use proper auth
const ADMIN_PASSWORD = 'phan2025admin';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [content, setContent] = useState<EditableContent>(defaultContent);
  const [activeTab, setActiveTab] = useState<'oar' | 'regimens' | 'guidelines' | 'references'>('oar');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Suppress unused variable warnings for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedTypes: EditableOARConstraint | EditableDoseRegimen | null = null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    // In a real app, this would POST to an API endpoint
    // For now, we just simulate a save
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const updateOAR = (index: number, updates: Partial<EditableOARConstraint>) => {
    const newConstraints = [...content.oarConstraints];
    newConstraints[index] = { ...newConstraints[index], ...updates };
    setContent({ ...content, oarConstraints: newConstraints });
  };

  const deleteOAR = (index: number) => {
    const newConstraints = content.oarConstraints.filter((_, i) => i !== index);
    setContent({ ...content, oarConstraints: newConstraints });
  };

  const addOAR = () => {
    const newOAR: EditableOARConstraint = {
      name: 'New OAR',
      tier: 3,
      limitEQD2: 50,
      alphaBeta: 3,
      complication: 'Complication',
      description: 'Description'
    };
    setContent({ ...content, oarConstraints: [...content.oarConstraints, newOAR] });
  };

  const updateRegimen = (index: number, updates: Partial<EditableDoseRegimen>) => {
    const newRegimens = [...content.doseRegimens];
    newRegimens[index] = { ...newRegimens[index], ...updates };
    setContent({ ...content, doseRegimens: newRegimens });
  };

  const deleteRegimen = (index: number) => {
    const newRegimens = content.doseRegimens.filter((_, i) => i !== index);
    setContent({ ...content, doseRegimens: newRegimens });
  };

  const addRegimen = () => {
    const newRegimen: EditableDoseRegimen = {
      name: 'New Regimen',
      dose: 50,
      fractions: 25,
      intent: 'curative',
      description: 'Description'
    };
    setContent({ ...content, doseRegimens: [...content.doseRegimens, newRegimen] });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
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
            {error && <p className="text-red-600 text-sm">{error}</p>}
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
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">H&N Re-RT Calculator - Admin Panel</h1>
            <p className="text-sm text-teal-100">Manage calculator content and settings</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-teal-200">
              Last updated: {new Date(content.lastUpdated).toLocaleString()}
            </span>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1">
            {[
              { id: 'oar', label: 'OAR Constraints' },
              { id: 'regimens', label: 'Dose Regimens' },
              { id: 'guidelines', label: 'Guidelines' },
              { id: 'references', label: 'References' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Save Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              saveStatus === 'saved'
                ? 'bg-green-600 text-white'
                : saveStatus === 'saving'
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>

        {/* OAR Constraints Tab */}
        {activeTab === 'oar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">OAR Dose Constraints</h2>
              <button
                onClick={addOAR}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
              >
                + Add OAR
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Tier</th>
                    <th className="px-4 py-3 font-semibold">Limit (EQD2)</th>
                    <th className="px-4 py-3 font-semibold">α/β</th>
                    <th className="px-4 py-3 font-semibold">Complication</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {content.oarConstraints.map((oar, index) => (
                    <tr key={index} className="hover:bg-gray-50">
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
                          <option value={1}>1 - Life-threatening</option>
                          <option value={2}>2 - Critical</option>
                          <option value={3}>3 - QOL</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={oar.limitEQD2}
                          onChange={(e) => updateOAR(index, { limitEQD2: Number(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={oar.alphaBeta}
                          onChange={(e) => updateOAR(index, { alphaBeta: Number(e.target.value) })}
                          className="w-16 px-2 py-1 border rounded"
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

        {/* Dose Regimens Tab */}
        {activeTab === 'regimens' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Standard Dose Regimens</h2>
              <button
                onClick={addRegimen}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
              >
                + Add Regimen
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Dose (Gy)</th>
                    <th className="px-4 py-3 font-semibold">Fractions</th>
                    <th className="px-4 py-3 font-semibold">Intent</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {content.doseRegimens.map((regimen, index) => (
                    <tr key={index} className="hover:bg-gray-50">
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
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={regimen.fractions}
                          onChange={(e) => updateRegimen(index, { fractions: Number(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={regimen.intent}
                          onChange={(e) => updateRegimen(index, { intent: e.target.value as 'curative' | 'palliative' | 'hypofractionated' })}
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

        {/* Guidelines Tab */}
        {activeTab === 'guidelines' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Clinical Guidelines</h2>
            <div className="space-y-4">
              {content.guidelines.map((guideline, index) => (
                <div key={guideline.id} className="border rounded-lg p-4">
                  <input
                    type="text"
                    value={guideline.title}
                    onChange={(e) => {
                      const newGuidelines = [...content.guidelines];
                      newGuidelines[index] = { ...guideline, title: e.target.value };
                      setContent({ ...content, guidelines: newGuidelines });
                    }}
                    className="w-full px-3 py-2 border rounded mb-2 font-semibold"
                  />
                  <textarea
                    value={guideline.content}
                    onChange={(e) => {
                      const newGuidelines = [...content.guidelines];
                      newGuidelines[index] = { ...guideline, content: e.target.value };
                      setContent({ ...content, guidelines: newGuidelines });
                    }}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">References</h2>
            <div className="space-y-4">
              {content.references.map((ref, index) => (
                <div key={ref.id} className="border rounded-lg p-4">
                  <div className="flex gap-2 mb-2">
                    <select
                      value={ref.category}
                      onChange={(e) => {
                        const newRefs = [...content.references];
                        newRefs[index] = { ...ref, category: e.target.value as 'primary' | 'supporting' };
                        setContent({ ...content, references: newRefs });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="supporting">Supporting</option>
                    </select>
                  </div>
                  <textarea
                    value={ref.citation}
                    onChange={(e) => {
                      const newRefs = [...content.references];
                      newRefs[index] = { ...ref, citation: e.target.value };
                      setContent({ ...content, references: newRefs });
                    }}
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                  <input
                    type="text"
                    value={ref.doi || ''}
                    onChange={(e) => {
                      const newRefs = [...content.references];
                      newRefs[index] = { ...ref, doi: e.target.value };
                      setContent({ ...content, references: newRefs });
                    }}
                    placeholder="DOI (optional)"
                    className="w-full px-3 py-2 border rounded mt-2 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
