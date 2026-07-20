import React, { useState, useEffect } from 'react';
import { Wallet, Upload, Trash2, CheckCircle, Save, Loader2 } from 'lucide-react';
import { api } from '../services/api'; // Assuming standard api service is present

const getQrImageUrl = (imagePath?: string) => {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  const base = (import.meta.env.VITE_API_URL as string | undefined) || 'https://forex-backend-iem1.onrender.com/api';
  const normalizedBase = base.replace(/\/$/, '').replace(/\/api$/, '');

  if (imagePath.startsWith('/uploads/')) {
    return `${normalizedBase}/uploads/${imagePath.split('/uploads/')[1]}`;
  }

  if (imagePath.startsWith('/api/uploads/')) {
    return `${normalizedBase}${imagePath}`;
  }

  if (imagePath.startsWith('uploads/')) {
    return `${normalizedBase}/${imagePath}`;
  }

  return `${normalizedBase}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export const PaymentSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upi' | 'bank'>('upi');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  
  const [settings, setSettings] = useState({
    upiEnabled: false,
    bankEnabled: false,
    merchantName: '',
    upiId: '',
    qrImage: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    accountType: '',
    instructions: ''
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payment-settings');
      if (res.data.success && res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (error: any) {
      console.error(error);
      showMessage('error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.patch('/payment-settings', settings);
      if (res.data.success) {
        showMessage('success', 'Settings saved successfully');
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('qrImage', file);

    try {
      setUploading(true);
      const res = await api.post('/payment-settings/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setSettings(prev => ({ ...prev, qrImage: res.data.qrImage }));
        showMessage('success', 'QR Image uploaded successfully');
      }
    } catch (error: any) {
      showMessage('error', 'Failed to upload QR Image');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQR = async () => {
    try {
      setUploading(true);
      const res = await api.delete('/payment-settings/qr');
      if (res.data.success) {
        setSettings(prev => ({ ...prev, qrImage: '' }));
        showMessage('success', 'QR Image deleted');
      }
    } catch (error: any) {
      showMessage('error', 'Failed to delete QR Image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Settings</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Manage deposit methods and details</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
        }`}>
          {message.type === 'success' && <CheckCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'upi' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-slate-50 dark:bg-slate-800/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              UPI Configuration
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === 'bank' ? 'text-emerald-500 border-b-2 border-emerald-500 bg-slate-50 dark:bg-slate-800/50' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              Net Banking Configuration
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'upi' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="upiEnabled" checked={settings.upiEnabled} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                  </label>
                  <div>
                    <h3 className="font-medium">Enable UPI Deposits</h3>
                    <p className="text-sm text-slate-500">Allow users to deposit via UPI and QR Code.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Merchant Name</label>
                      <input type="text" name="merchantName" value={settings.merchantName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Aura Trading" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">UPI ID</label>
                      <input type="text" name="upiId" value={settings.upiId} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="merchant@upi" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">QR Code Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg">
                      {settings.qrImage ? (
                        <div className="space-y-2 text-center">
                          <img
                            src={getQrImageUrl(settings.qrImage)}
                            alt="QR Code"
                            className="mx-auto h-32 w-32 object-contain rounded bg-white p-2"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              if (target.src.includes('/api/uploads/')) {
                                target.src = target.src.replace('/api/uploads/', '/uploads/');
                              }
                            }}
                          />
                          <div className="flex justify-center gap-2">
                            <button onClick={handleDeleteQR} disabled={uploading} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1">
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-slate-500">
                            <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-emerald-500 hover:text-emerald-400 focus-within:outline-none">
                              <span>Upload a file</span>
                              <input type="file" className="sr-only" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bank' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="bankEnabled" checked={settings.bankEnabled} onChange={handleChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                  </label>
                  <div>
                    <h3 className="font-medium">Enable Net Banking</h3>
                    <p className="text-sm text-slate-500">Allow users to deposit via IMPS/NEFT/RTGS.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <input type="text" name="bankName" value={settings.bankName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. State Bank of India" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Holder</label>
                    <input type="text" name="accountHolder" value={settings.accountHolder} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Aura Global LTD" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Number</label>
                    <input type="text" name="accountNumber" value={settings.accountNumber} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. 000123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">IFSC Code</label>
                    <input type="text" name="ifsc" value={settings.ifsc} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. SBIN0001234" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch Name</label>
                    <input type="text" name="branch" value={settings.branch} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="e.g. Main Branch, Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Account Type</label>
                    <select name="accountType" value={settings.accountType} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [&>option]:bg-slate-900">
                      <option value="">Select Type</option>
                      <option value="Current">Current Account</option>
                      <option value="Savings">Savings Account</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
              <label className="block text-sm font-medium mb-1">Deposit Instructions (Shown to users)</label>
              <textarea name="instructions" value={settings.instructions} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Enter any specific instructions or warnings for users..."></textarea>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
