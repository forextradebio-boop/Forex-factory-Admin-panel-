import React from "react";

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900/60 shadow-sm animate-pulse">
      <div className="h-12 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center px-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800/40">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-3 w-1/3">
              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1 flex-1">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
      </div>
      <div className="h-56 bg-slate-100 dark:bg-slate-950/20 rounded-lg flex items-end justify-between p-4 gap-2">
        <div className="h-1/3 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-2/3 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-1/2 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-5/6 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-2/5 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-3/4 bg-slate-200 dark:bg-slate-800 rounded w-8" />
        <div className="h-1/2 bg-slate-200 dark:bg-slate-800 rounded w-8" />
      </div>
    </div>
  );
};
