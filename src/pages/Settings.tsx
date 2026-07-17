import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  Mail, 
  ToggleLeft, 
  ToggleRight, 
  Save,
  Globe,
  Landmark,
  QrCode
} from "lucide-react";

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: config, isLoading } = useQuery({
    queryKey: ["globalSettings"],
    queryFn: () => adminService.getSettings(),
  });

  // Local Form states
  const [brandName, setBrandName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentSettings"],
    queryFn: () => adminService.getPaymentSettings(),
  });

  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Populate values when loaded
  React.useEffect(() => {
    if (config) {
      setBrandName(config.siteName || "Aura Trading LLC");
      setSupportEmail("support@auratrading.com");
      setSmtpHost(config.smtpHost || "smtp.mailgun.org");
      setSmtpPort(config.smtpPort?.toString() || "587");
      setSmtpUser(config.smtpUser || "postmaster@auratrading.com");
    }
  }, [config]);

  React.useEffect(() => {
    if (paymentConfig) {
      setBankName(paymentConfig.bankName || "");
      setAccountHolder(paymentConfig.accountHolder || "");
      setBankAccount(paymentConfig.bankAccount || "");
      setIfscCode(paymentConfig.ifscCode || "");
      setUpiId(paymentConfig.upiId || "");
      setQrCodeUrl(paymentConfig.qrCodeUrl || "");
    }
  }, [paymentConfig]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: Partial<typeof config>) => adminService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalSettings"] });
      alert("System configurations permanently written into server environment.");
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: (data: any) => adminService.updatePaymentSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSettings"] });
      alert("Payment Settings updated successfully and synced with User App.");
    }
  });

  const handleToggle = (key: string, currentVal: boolean) => {
    updateMutation.mutate({ [key]: !currentVal });
  };

  const handleSaveForms = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      siteName: brandName,
      smtpHost,
      smtpPort: parseInt(smtpPort) || 587,
      smtpUser
    });
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMutation.mutate({
      bankName,
      accountHolder,
      bankAccount,
      ifscCode,
      upiId,
      qrCodeUrl
    });
  };

  if (isLoading || !config) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading Configuration panel...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Global System Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure brand parameters, authorize mail SMTP servers, and toggle global emergency options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Core Settings Form */}
        <form onSubmit={handleSaveForms} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Globe size={14} />
            <span>GENERAL PLATFORM BRANDING</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Corporate Brand Name</label>
              <input type="text" required value={brandName} onChange={(e) => setBrandName(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Client Support Email</label>
              <input type="email" required value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2 pt-2">
            <Mail size={14} />
            <span>OUTGOING SMTP GATEWAY CREDENTIALS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">SMTP Host Server</label>
              <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">SMTP Port Relay</label>
              <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">SMTP User Account</label>
              <input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <Save size={14} />
            Save Configurations
          </button>
        </form>

        <form onSubmit={handleSavePayment} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm md:col-span-2 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Landmark size={14} />
            <span>GLOBAL PAYMENT & DEPOSIT ACCOUNTS</span>
          </div>
          <p className="text-[10px] text-slate-500">These details are shown dynamically to users in the Trading App when they attempt to deposit funds.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Bank Name</label>
              <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" placeholder="e.g. Chase Bank" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Account Holder Name</label>
              <input type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" placeholder="e.g. Aura Trading LLC" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Account Number</label>
              <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" placeholder="1234567890" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">IFSC / Routing Code</label>
              <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" placeholder="ROUTING123" />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2 pt-2">
            <QrCode size={14} />
            <span>UPI / SCANNER SETTINGS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">UPI ID</label>
              <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" placeholder="company@upi" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">QR Code Image Link</label>
              <input type="text" value={qrCodeUrl} onChange={(e) => setQrCodeUrl(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" placeholder="https://imgur.com/my-qr.png" />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/10"
          >
            <Save size={14} />
            Save Payment Settings
          </button>
        </form>

        {/* Security / Toggle options */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              <ShieldAlert size={14} />
              <span>SECURITY & SYSTEM CONTROL</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Emergency Maintenance Mode</p>
                  <p className="text-[10px] text-slate-500">Locks out all public public user accounts</p>
                </div>
                <button onClick={() => handleToggle("maintenanceMode", config.maintenanceMode)} className="text-slate-400 hover:text-emerald-400 cursor-pointer">
                  {config.maintenanceMode ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Global Trading Status</p>
                  <p className="text-[10px] text-slate-500">Toggles whether order executions are allowed</p>
                </div>
                <button onClick={() => handleToggle("tradingEnabled", config.tradingEnabled)} className="text-slate-400 hover:text-emerald-400 cursor-pointer">
                  {config.tradingEnabled ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Allow New Registrations</p>
                  <p className="text-[10px] text-slate-500">Enable new customer account signups</p>
                </div>
                <button onClick={() => handleToggle("allowNewRegistrations", config.allowNewRegistrations)} className="text-slate-400 hover:text-emerald-400 cursor-pointer">
                  {config.allowNewRegistrations ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
