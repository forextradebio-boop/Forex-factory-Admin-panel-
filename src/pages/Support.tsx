import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { SupportTicket } from "../types";
import { MessageSquare, Send, CheckCircle, Clock, AlertTriangle, User } from "lucide-react";

export const Support: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => adminService.getTickets(),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, msg }: { id: string; msg: string }) => adminService.replyToTicket(id, msg),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      setSelectedTicket(updated);
      setReplyText("");
    }
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => adminService.closeTicket(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      setSelectedTicket(updated);
      alert("Ticket status permanently marked as RESOLVED.");
    }
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText) return;
    replyMutation.mutate({ id: selectedTicket.id, msg: replyText });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Client Help & Support Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Audit incoming help requests, address transaction discrepancies, and message clients directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Tickets roster list */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Open Support Tickets</span>
          
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : (Array.isArray(tickets) ? tickets : []).length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20">
              <span className="text-slate-400 text-xs">No active help tickets</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto select-none pr-1">
              {(Array.isArray(tickets) ? tickets : []).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTicket?.id === t.id ? "bg-slate-50 dark:bg-slate-800/25 border-emerald-500/40 shadow-sm" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/10"}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-xs text-slate-700 dark:text-slate-300 truncate">{t.subject}</p>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${t.status === "OPEN" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-1">{t.userFullName}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Chat ticket viewport */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
              
              {/* Ticket Headers */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
                    <User size={10} />
                    <span>{selectedTicket.userFullName} ({selectedTicket.userEmail})</span>
                  </div>
                </div>
                
                {selectedTicket.status === "OPEN" && (
                  <button
                    onClick={() => closeMutation.mutate(selectedTicket.id)}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded cursor-pointer"
                  >
                    Resolve & Close Ticket
                  </button>
                )}
              </div>

              {/* Chat thread box */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {selectedTicket.replies?.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl max-w-sm text-xs ${m.senderRole === "USER" ? "bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 mr-auto" : "bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 ml-auto"}`}
                  >
                    <p className="font-bold text-[9px] text-slate-500 uppercase mb-1">{m.senderRole === "USER" ? "Trader" : "Support Compliance"}</p>
                    <p>{m.message}</p>
                    <span className="block text-[8px] text-slate-400 font-mono mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>

              {/* Message Reply Form */}
              {selectedTicket.status === "OPEN" ? (
                <form onSubmit={handleReplySubmit} className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your compliance message reply..."
                    className="flex-1 text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={12} />
                    Send Reply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle size={14} />
                  <span>This client ticket is resolved and closed. Reopen required for messaging.</span>
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <MessageSquare size={24} className="mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Select a support ticket to load client message archives and send responses.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
