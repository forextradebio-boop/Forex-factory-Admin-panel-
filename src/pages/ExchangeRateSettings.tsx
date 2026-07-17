import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Save, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';

export const ExchangeRateSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [rate, setRate] = useState({
    currentRate: 85.00,
    provider: 'MANUAL',
    lastUpdated: ''
  });

  const fetchCurrentRate = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exchange-rates/current');
      if (res.data.success && res.data.rate) {
        setRate({
          currentRate: res.data.rate.currentRate,
          provider: res.data.rate.provider,
          lastUpdated: res.data.rate.updatedAt
        });
      } else if (res.data.currentRate) {
         setRate(prev => ({...prev, currentRate: res.data.currentRate}));
      }
      fetchHistory();
    } catch (error: any) {
      console.error(error);
      showMessage('error', 'Failed to fetch exchange rate');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/exchange-rates/history');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCurrentRate();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async (provider: 'MANUAL' | 'LIVE', overrideRate?: number) => {
    try {
      setSaving(true);
      const res = await api.post('/exchange-rates', { 
        currentRate: overrideRate || rate.currentRate,
        provider
      });
      if (res.data.success) {
        showMessage('success', 'Exchange rate updated successfully');
        fetchCurrentRate();
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Failed to update rate');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchLive = async () => {
    try {
      setFetchingLive(true);
      // Fallback API if no premium API key is set
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const inrRate = data.rates.INR;
      
      if (inrRate) {
        await handleSave('LIVE', inrRate);
      } else {
        throw new Error("Could not parse INR rate");
      }
    } catch (error: any) {
      console.error(error);
      showMessage('error', 'Failed to fetch live rate from provider');
    } finally {
      setFetchingLive(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-blue-500" />
            Exchange Rate Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage the USD to INR conversion rate for deposits and withdrawals
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
            : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          <CheckCircle className="w-5 h-5" />
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Update Rate */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <DollarSign className="w-24 h-24" />
            </div>
            
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Current Rate</h2>
            
            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-blue-500">₹{rate.currentRate.toFixed(2)}</span>
                <span className="text-gray-500 font-medium mb-1">/ 1 USD</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Last updated: {rate.lastUpdated ? new Date(rate.lastUpdated).toLocaleString('en-IN') : 'Never'}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-bold">
                  {rate.provider}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Manual Rate Override
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    value={rate.currentRate}
                    onChange={(e) => setRate(prev => ({ ...prev, currentRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-gray-900 dark:text-white font-mono"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => handleSave('MANUAL')}
                  disabled={saving || fetchingLive}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Manual Rate
                </button>
                
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                <button
                  onClick={handleFetchLive}
                  disabled={saving || fetchingLive}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {fetchingLive ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  Fetch Live Market Rate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rate Update History</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm">
                    <th className="py-3 px-6 font-medium">Rate (INR)</th>
                    <th className="py-3 px-6 font-medium">Provider</th>
                    <th className="py-3 px-6 font-medium">Updated By</th>
                    <th className="py-3 px-6 font-medium">Date & Time</th>
                    <th className="py-3 px-6 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {history.map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        ₹{record.currentRate.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {record.provider}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {record.updatedBy?.fullName || record.updatedBy?.username || 'System'}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {new Date(record.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        {record.isActive ? (
                          <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">Active</span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No rate history available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
