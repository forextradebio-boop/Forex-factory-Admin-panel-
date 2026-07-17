import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { Asset, AssetType } from "../types";
import { TableSkeleton } from "../components/Skeletons";
import { Plus, ToggleLeft, ToggleRight, Edit, Trash2, Coins } from "lucide-react";

export const AssetManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form values
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>(AssetType.CRYPTO);
  const [currentPrice, setCurrentPrice] = useState("");
  const [spread, setSpread] = useState("");

  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: () => adminService.getAssets()
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setShowAddForm(false);
      setSymbol("");
      setName("");
      setCurrentPrice("");
      setSpread("");
      alert("New asset listing initialized successfully.");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => adminService.updateAsset(id, { isActive: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      alert("Asset deleted from terminal index.");
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      symbol,
      name,
      type,
      currentPrice: parseFloat(currentPrice),
      spread: parseFloat(spread),
      priceChange24h: 0,
      isActive: true,
      minTradeAmount: 10,
      maxTradeAmount: 100000
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Terminal Asset Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Initialize, suspend, or configure trading specifications for indexes, tokens, and stocks.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs rounded-lg flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/10"
        >
          <Plus size={14} />
          Launch New Asset
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Asset Symbol</label>
            <input type="text" required value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="e.g. SOL/USD" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Product Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Solana" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Asset Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2">
              <option value="CRYPTO">Cryptocurrency</option>
              <option value="FOREX">Forex Class</option>
              <option value="STOCKS">Equity Stock</option>
              <option value="COMMODITIES">Commodities</option>
              <option value="INDICES">Market Index</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Price (USD)</label>
            <input type="text" required value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="0.00" className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-100 p-2 font-mono" />
          </div>
          <button type="submit" className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg cursor-pointer">
            Create Asset
          </button>
        </form>
      )}

      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Product Category</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">Trading state</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {(Array.isArray(assets) ? assets : []).map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-100">{asset.symbol}</td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{asset.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-500 uppercase text-[10px]">{asset.type}</td>
                  <td className="py-3 px-4 font-mono font-bold">${(asset.currentPrice ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${asset.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                      {asset.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: asset.id, active: !asset.isActive })}
                        className="text-slate-400 hover:text-indigo-400 cursor-pointer"
                        title="Toggle trading active state"
                      >
                        {asset.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => { if(confirm(`Delete ${asset.symbol} from terminal index?`)) deleteMutation.mutate(asset.id); }}
                        className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        title="Delete Asset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
