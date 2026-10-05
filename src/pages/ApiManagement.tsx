import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Key,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface ApiKey {
  _id: string;
  provider: string;
  keyName: string;
  keyValue: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXHAUSTED';
  errorCount: number;
  createdAt: string;
}

interface MarketProvider {
  symbol: string;
  provider: string;
  enabled: boolean;
  lastSuccessfulFetch: string | null;
  lastSuccessfulPrice: number | null;
  lastError: string | null;
  apiKeyConfigured: boolean;
}

const PROVIDERS = ['TWELVEDATA', 'FINNHUB', 'BINANCE', 'YAHOO', 'VANTAGE'];

export default function ApiManagement() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [providers, setProviders] = useState<MarketProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({ provider: 'TWELVEDATA', keyName: '', keyValue: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [keysRes, provRes] = await Promise.all([
        api.get('/admin/apikeys'),
        api.get('/admin/market-providers').catch(() => ({ data: { providers: [] } }))
      ]);
      setKeys(keysRes.data);
      if (provRes.data.providers) setProviders(provRes.data.providers);
    } catch (error: any) {
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.keyName) return alert('Key Name is required');
    
    try {
      await api.post('/admin/apikeys', newKey);
      alert('API Key added successfully');
      setNewKey({ provider: 'TWELVEDATA', keyName: '', keyValue: '' });
      setShowAddForm(false);
      setNewKey({ provider: 'TWELVEDATA', keyName: '', keyValue: '' });
      setShowAddForm(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add key');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/admin/apikeys/${id}/toggle`, {});
      alert('Key status updated');
      fetchData();
    } catch (error: any) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;
    try {
      await api.delete(`/admin/apikeys/${id}`);
      alert('API Key deleted');
      fetchData();
    } catch (error: any) {
      alert('Failed to delete key');
    }
  };

  const handleToggleProvider = async (symbol: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/market-providers/${symbol}`, { enabled: !currentStatus });
      fetchData();
    } catch (error: any) {
      alert('Failed to update provider status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold">Active</span>;
      case 'EXHAUSTED':
        return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded text-xs font-bold">Limit Exhausted</span>;
      default:
        return <span className="px-2 py-1 bg-zinc-500/10 text-zinc-500 rounded text-xs font-bold">Inactive</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <Key className="w-6 h-6 mr-3 text-emerald-500" />
            API & Data Providers
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Manage your API keys. The system automatically rotates to the next ACTIVE key when limits are exhausted.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded flex items-center transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Key
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-4">Add New API Key</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Provider</label>
              <input
                type="text"
                list="provider-suggestions"
                required
                value={newKey.provider}
                onChange={(e) => setNewKey({ ...newKey, provider: e.target.value.toUpperCase() })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white focus:border-emerald-500 focus:outline-none uppercase placeholder-zinc-500"
                placeholder="e.g. ALPHAVANTAGE"
              />
              <datalist id="provider-suggestions">
                {PROVIDERS.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Key Name (e.g. Account 1)</label>
              <input
                type="text"
                required
                value={newKey.keyName}
                onChange={(e) => setNewKey({ ...newKey, keyName: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">API Key Value</label>
              <input
                type="text"
                value={newKey.keyValue}
                onChange={(e) => setNewKey({ ...newKey, keyValue: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                placeholder="Paste key here..."
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded transition">
                Save
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-800/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-4 font-semibold">Provider</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">API Key</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading && keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">Loading keys...</td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">No API keys found. Click "Add Key" to create one.</td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key._id} className="hover:bg-zinc-800/30 transition">
                    <td className="p-4 font-bold">{key.provider}</td>
                    <td className="p-4">{key.keyName}</td>
                    <td className="p-4 font-mono text-zinc-500">
                      {key.keyValue ? `${key.keyValue.substring(0, 4)}...${key.keyValue.substring(key.keyValue.length - 4)}` : 'N/A'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(key.status)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggle(key._id)}
                          className={`p-2 rounded transition ${
                            key.status === 'ACTIVE' 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          }`}
                          title={key.status === 'ACTIVE' ? 'Stop Key' : 'Start Key'}
                        >
                          {key.status === 'ACTIVE' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(key._id)}
                          className="p-2 bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-500 rounded transition"
                          title="Delete Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Market Providers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-3 text-emerald-500" />
          Specialized Market Providers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div key={`${p.symbol}-${p.provider}`} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {p.symbol === 'USOIL' ? 'US Oil (WTI)' : p.symbol}
                  </h3>
                  <span className="text-sm text-emerald-500 font-semibold mt-1 inline-block capitalize">
                    {p.provider.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => handleToggleProvider(p.symbol, p.enabled)}
                  className={`px-4 py-1.5 rounded text-sm font-bold transition flex items-center gap-2 ${
                    p.enabled 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                      : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}
                >
                  {p.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  {p.enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">API Key:</span>
                  <span className={`font-mono px-2 rounded ${p.apiKeyConfigured ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {p.apiKeyConfigured ? 'Configured (.env)' : 'Missing (.env)'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Last Price:</span>
                  <span className="text-white font-mono font-bold">
                    {p.lastSuccessfulPrice ? `$${p.lastSuccessfulPrice.toFixed(2)}` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Last Updated:</span>
                  <span className="text-zinc-300">
                    {p.lastSuccessfulFetch ? new Date(p.lastSuccessfulFetch).toLocaleString() : 'Never'}
                  </span>
                </div>

                <div className="flex justify-between text-sm items-center pt-2 border-t border-zinc-800/50 mt-2">
                  <span className="text-zinc-400">Status:</span>
                  {p.lastError ? (
                     <span className="text-red-400 flex items-center gap-1 text-xs max-w-[200px] truncate" title={p.lastError}>
                       <AlertTriangle className="w-3 h-3" /> {p.lastError}
                     </span>
                  ) : p.enabled ? (
                     <span className="text-green-500 font-semibold text-xs flex items-center gap-1">
                       <Activity className="w-3 h-3" /> Connected
                     </span>
                  ) : (
                     <span className="text-zinc-500 font-semibold text-xs flex items-center gap-1">
                       Disabled
                     </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <div className="col-span-full p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No specialized providers found.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
