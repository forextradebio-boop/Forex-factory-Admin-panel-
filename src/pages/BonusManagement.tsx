import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { BonusConfig } from "../types";
import { Sparkles, Sliders, ToggleLeft, ToggleRight, Gift } from "lucide-react";

export const BonusManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bonuses, isLoading } = useQuery({
    queryKey: ["bonuses"],
    queryFn: () => adminService.getBonuses()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BonusConfig> }) => adminService.updateBonus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      alert("Bonus specification updated successfully.");
    }
  });

  const handleToggle = (id: string, currentActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !currentActive } });
  };

  const handleAmountChange = (id: string, amount: number) => {
    updateMutation.mutate({ id, data: { amount } });
  };

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Loading Rewards Desk...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Rewards & Referral Promotions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure automated registration grants, cashback loyalty brackets, and deposit promo bonuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(bonuses) ? bonuses : []).map((bonus) => (
          <div key={bonus.id} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between h-56 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Gift size={14} className="text-emerald-500" />
                <span className="uppercase">{bonus.type} PROMOTION</span>
              </div>
              <button
                onClick={() => handleToggle(bonus.id, bonus.isActive)}
                className="text-slate-400 hover:text-emerald-400 cursor-pointer"
              >
                {bonus.isActive ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} />}
              </button>
            </div>

            {/* Inputs & Parameters */}
            <div className="space-y-3 flex-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Default Reward Size (USD):</span>
                <input
                  type="number"
                  value={bonus.amount}
                  onChange={(e) => handleAmountChange(bonus.id, parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 font-mono text-center focus:outline-none"
                />
              </div>

              {bonus.promoCode && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active Promo Code:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold">{bonus.promoCode}</span>
                </div>
              )}

              {bonus.percentage && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Match Percentage:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{bonus.percentage}%</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Automated Payout</span>
              <span className={bonus.isActive ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                {bonus.isActive ? "ACTIVE & ROUTED" : "OFFLINE / HALTED"}
              </span>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
