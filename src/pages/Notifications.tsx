import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { Bell, Send, Mail, Volume2, ShieldCheck } from "lucide-react";

export const Notifications: React.FC = () => {
  const [target, setTarget] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const notificationMutation = useMutation({
    mutationFn: (method: "Push" | "Email" | "Broadcast") => {
      if (method === "Broadcast") {
        return adminService.createNews(title, title, message, "System", "Admin");
      }
      // For Push and Email, we dispatch a notification
      return adminService.sendNotification(target === "all" ? "ALL" : "", title, message);
    },
    onSuccess: (_, method) => {
      setTitle("");
      setMessage("");
      alert(`🚀 Broadcast ${method} has been successfully distributed to all target players.`);
    },
    onError: (err: any) => {
      alert(`Failed to send: ${err.response?.data?.error || err.message}`);
    }
  });

  const handleSend = (e: React.FormEvent, method: "Push" | "Email" | "Broadcast") => {
    e.preventDefault();
    if (!title || !message) return;
    notificationMutation.mutate(method);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Broadcast Announcement Hub</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send immediate notification push alerts, broadcast system emails, or dispatch emergency system alerts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Push Notification Card Form */}
        <form onSubmit={(e) => handleSend(e, "Push")} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Bell size={14} className="text-emerald-500 animate-bounce" />
            <span>INSTANT PUSH NOTIFICATION</span>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Target Scope</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2">
                <option value="all">All Registered Traders</option>
                <option value="active">Active Traders Only (Online)</option>
                <option value="kyc">KYC Verified Accounts Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Alert Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Market hours update" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Alert message</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Major index stocks options are now open for buying leverage." rows={3} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={notificationMutation.isPending} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Send size={12} />
            {notificationMutation.isPending ? "Sending..." : "Dispatch Push Alert"}
          </button>
        </form>

        {/* Email Broadcast Form */}
        <form onSubmit={(e) => handleSend(e, "Email")} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Mail size={14} className="text-emerald-500" />
            <span>EMAIL MASS BROADCAST</span>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Target Scope</label>
              <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2">
                <option value="all">All Registered Traders</option>
                <option value="active">Active Traders Only (Online)</option>
                <option value="kyc">KYC Verified Accounts Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Email Subject Header</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. System Security Bulletin" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Html Body message</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Please note that we have completed security upgrades on all vault wallets..." rows={3} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={notificationMutation.isPending} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Send size={12} />
            {notificationMutation.isPending ? "Sending..." : "Distribute Emails"}
          </button>
        </form>

        {/* Dashboard Announcement Banner Form */}
        <form onSubmit={(e) => handleSend(e, "Broadcast")} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-2">
            <Volume2 size={14} className="text-emerald-500 animate-pulse" />
            <span>FLOATING CLIENT BANNER</span>
          </div>

          <div className="space-y-3 text-xs flex-1">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Announcement placement</label>
              <select className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2">
                <option value="top">Top Header Floating Notice</option>
                <option value="popup">Dashboard Welcome Popup Dialog</option>
                <option value="widget">Sidebar Trading Feed Banner</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Banner Headline</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Maintenance Scheduled" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Headline Details</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Vault deposits under maintenance for 30 mins starting from 02:00 UTC." rows={3} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={notificationMutation.isPending} className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <Send size={12} />
            {notificationMutation.isPending ? "Sending..." : "Publish Announcement"}
          </button>
        </form>

      </div>
    </div>
  );
};
