import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export const UniversalCurrencyCalculator: React.FC = () => {
  const [convAmount, setConvAmount] = useState<string>('');
  const [sourceCurrency, setSourceCurrency] = useState<string>('INR');
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');
  const [currentRate, setCurrentRate] = useState<number>(85);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        const res = await api.get('/exchange-rates/current');
        if (res.data && res.data.success && res.data.rate) {
          setCurrentRate(res.data.rate.currentRate);
        } else if (res.data && res.data.currentRate) {
          setCurrentRate(res.data.currentRate);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rate', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentRate();
  }, []);

  const exchangeRates: Record<string, { rate: number; symbol: string; name: string }> = {
    USD: { rate: 1.00, symbol: '$', name: 'US Dollar' },
    INR: { rate: currentRate, symbol: '₹', name: 'Indian Rupee' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
    GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
    JPY: { rate: 151.20, symbol: '¥', name: 'Japanese Yen' },
    AUD: { rate: 1.53, symbol: 'A$', name: 'Australian Dollar' },
    CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
    CNY: { rate: 7.23, symbol: '¥', name: 'Chinese Yuan' },
    AED: { rate: 3.67, symbol: 'د.إ', name: 'UAE Dirham' }
  };

  const currentSourceRate = exchangeRates[sourceCurrency]?.rate || 1;
  const currentSourceSymbol = exchangeRates[sourceCurrency]?.symbol || '';
  const currentTargetRate = exchangeRates[targetCurrency]?.rate || 1;
  const currentTargetSymbol = exchangeRates[targetCurrency]?.symbol || '';

  const calculateTarget = (amountStr: string) => {
    if (!amountStr) return '0.00';
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return '0.00';
    const inUSD = amount / currentSourceRate;
    return (inUSD * currentTargetRate).toFixed(2);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden flex justify-center items-center h-48">
        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-emerald-500/30 shadow-sm">
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-emerald-500" /> Universal Currency Calculator
        </h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center focus-within:border-emerald-500 transition-colors">
            <select
              value={sourceCurrency}
              onChange={(e) => setSourceCurrency(e.target.value)}
              className="bg-transparent border-none text-slate-500 dark:text-slate-400 font-bold text-sm focus:outline-none cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 pr-2 border-r border-slate-200 dark:border-slate-700"
            >
              {Object.keys(exchangeRates).map(code => (
                <option key={code} value={code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{code}</option>
              ))}
            </select>
            <span className="text-slate-500 dark:text-slate-400 font-bold ml-3">{currentSourceSymbol}</span>
            <input 
              type="number" 
              value={convAmount}
              onChange={e => setConvAmount(e.target.value)}
              placeholder="Amount"
              className="bg-transparent border-none text-right font-mono text-slate-800 dark:text-slate-100 font-bold focus:outline-none w-full ml-2"
            />
          </div>
          
          <div className="text-slate-500 dark:text-slate-400 font-bold mx-2 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 hidden md:block" />
            <span className="hidden md:block mx-1">≈</span>
            <ArrowLeft className="w-4 h-4 hidden md:block rotate-180" />
            <span className="md:hidden">=</span>
          </div>

          <div className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 flex items-center focus-within:border-emerald-500 transition-colors">
            <select
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              className="bg-transparent border-none text-slate-500 dark:text-slate-400 font-bold text-sm focus:outline-none cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 pr-2 border-r border-slate-200 dark:border-slate-700"
            >
              {Object.keys(exchangeRates).map(code => (
                <option key={`target-${code}`} value={code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">{code}</option>
              ))}
            </select>
            <span className="text-slate-500 dark:text-slate-400 font-bold ml-3">{currentTargetSymbol}</span>
            <div className="bg-transparent border-none text-right font-mono text-emerald-500 font-bold text-lg focus:outline-none w-full ml-2">
              {calculateTarget(convAmount)}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center font-medium">
          Estimated Exchange Rate: 1 {sourceCurrency} ≈ {currentTargetSymbol}{(currentTargetRate / currentSourceRate).toFixed(4)} {targetCurrency}
        </p>
      </div>
    </div>
  );
};
