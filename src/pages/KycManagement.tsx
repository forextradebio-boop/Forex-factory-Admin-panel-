import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/admin.service";
import { TableSkeleton } from "../components/Skeletons";
import { KycDocument, KycStatus } from "../types";
import { 
  Check, 
  X, 
  Eye, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  XOctagon, 
  Ban,
  FileText 
} from "lucide-react";

const getAssetCandidates = (value?: string) => {
  if (!value) return [] as string[];
  if (/^data:image\//i.test(value) || /^blob:/i.test(value)) return [value];
  if (/^https?:\/\//i.test(value)) return [value];

  const base = (import.meta.env.VITE_API_URL as string | undefined) || "https://forex-backend-iem1.onrender.com/api";
  const normalizedBase = base.replace(/\/$/, "").replace(/\/api$/, "");
  const apiBase = base.replace(/\/$/, "");
  const candidates = new Set<string>();

  if (value.startsWith("/uploads/")) {
    candidates.add(`${normalizedBase}${value}`);
    candidates.add(`${apiBase}/uploads/${value.split("/uploads/")[1]}`);
    candidates.add(`${normalizedBase}/api/uploads/${value.split("/uploads/")[1]}`);
  } else if (value.startsWith("/api/uploads/")) {
    candidates.add(`${normalizedBase}${value}`);
    candidates.add(`${normalizedBase}${value.replace("/api/uploads/", "/uploads/")}`);
  } else if (value.startsWith("uploads/")) {
    candidates.add(`${normalizedBase}/${value}`);
    candidates.add(`${apiBase}/uploads/${value.replace(/^uploads\//, "")}`);
  } else {
    candidates.add(`${normalizedBase}${value.startsWith("/") ? value : `/${value}`}`);
    candidates.add(`${apiBase}${value.startsWith("/") ? value : `/${value}`}`);
  }

  return Array.from(candidates);
};

const ImagePreview: React.FC<{ value?: string; alt: string }> = ({ value, alt }) => {
  const [currentSrc, setCurrentSrc] = useState("");
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const candidates = getAssetCandidates(value);

  useEffect(() => {
    setCurrentSrc(candidates[0] || "");
    setAttemptIndex(0);
    setHasError(false);
  }, [value]);

  if (!value) {
    return <span className="text-xs text-slate-500 font-semibold uppercase">No Document Uploaded</span>;
  }

  if (hasError) {
    return <span className="text-xs text-slate-500 font-semibold uppercase">Unable to load image</span>;
  }

  return (
    <img
      src={currentSrc || candidates[0] || ""}
      alt={alt}
      referrerPolicy="no-referrer"
      className="w-full h-full object-contain bg-white dark:bg-slate-950 p-2"
      onError={() => {
        if (attemptIndex + 1 < candidates.length) {
          const nextIndex = attemptIndex + 1;
          setAttemptIndex(nextIndex);
          setCurrentSrc(candidates[nextIndex]);
        } else {
          setHasError(true);
        }
      }}
    />
  );
};

export const KycManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDoc, setSelectedDoc] = useState<KycDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [isBlockUser, setIsBlockUser] = useState(false);

  // Queries
  const { data: documents, isLoading, isError, error } = useQuery({
    queryKey: ["kycDocuments"],
    queryFn: () => adminService.getKycDocuments(),
  });

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: KycStatus; reason?: string }) =>
      adminService.reviewKyc(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kycDocuments"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setSelectedDoc(null);
      setRejectionReason("");
      setShowRejectionForm(false);
    },
    onError: (err: any) => alert(`Failed: ${err.response?.data?.error || err.message}`)
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => adminService.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("KYC Rejected and User Blocked Successfully.");
    },
    onError: (err: any) => alert(`Block Failed: ${err.response?.data?.error || err.message}`)
  });

  const handleApprove = (doc: KycDocument) => {
    if (confirm(`Approve KYC verification for ${doc.userFullName}? This will unlock all trading features for their account.`)) {
      reviewMutation.mutate({ id: doc.id, status: KycStatus.APPROVED }, {
        onSuccess: () => alert("KYC Approved Successfully.")
      });
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !rejectionReason) return;
    reviewMutation.mutate({ id: selectedDoc.id, status: KycStatus.REJECTED, reason: rejectionReason }, {
      onSuccess: () => {
        if (isBlockUser) {
          blockMutation.mutate(selectedDoc.userId);
        } else {
          alert("KYC Rejected Successfully.");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">KYC Compliance & Verification Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review user identity registrations, verify passports/national IDs, and approve account clearances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Document list */}
        <div className="lg:col-span-2">
          {isError && (
            <div className="p-4 mb-4 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
              Failed to load KYC documents: {(error as any)?.message || "Network Error"}
            </div>
          )}
          {isLoading ? (
            <TableSkeleton rows={4} />
          ) : (Array.isArray(documents) ? documents : []).length === 0 ? (
            <div className="p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <ShieldCheck className="mx-auto text-slate-400" size={32} />
              <p className="text-xs text-slate-400">All submitted KYC requests have been fully reviewed.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Aadhaar</th>
                    <th className="py-3 px-4">PAN</th>
                    <th className="py-3 px-4">Submitted At</th>
                    <th className="py-3 px-4">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {(Array.isArray(documents) ? documents : []).map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => { setSelectedDoc(doc); setShowRejectionForm(false); setIsBlockUser(false); }}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? "bg-slate-50 dark:bg-slate-800/20" : ""}`}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{doc.userFullName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{doc.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">{doc.aadharNumber || "N/A"}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">{doc.panNumber || "N/A"}</td>
                      <td className="py-3.5 px-4 text-slate-400">{new Date(doc.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] flex items-center gap-1 w-max ${doc.status === KycStatus.PENDING ? "bg-amber-500/10 text-amber-500" : doc.status === KycStatus.APPROVED ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {doc.status === KycStatus.PENDING && <Clock size={10} />}
                          {doc.status === KycStatus.APPROVED && <ShieldCheck size={10} />}
                          {doc.status === KycStatus.REJECTED && <XOctagon size={10} />}
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Document Details & Review Panel */}
        <div className="lg:col-span-1">
          {selectedDoc ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-6">
              
              {/* Review Panel Header */}
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Review Identity Docs</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Doc ID: {selectedDoc.id}</p>
              </div>

              {/* Information */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800/30">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Trader Name:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedDoc.userFullName}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">Aadhaar Number:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{selectedDoc.aadharNumber || "N/A"}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-400">PAN Number:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{selectedDoc.panNumber || "N/A"}</span>
                </div>
                <div className="py-2 flex flex-col gap-1">
                  <span className="text-slate-400">Bank Details:</span>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded p-2 text-[10px] font-mono">
                    <div>Bank: {selectedDoc.bankName || "N/A"}</div>
                    <div>Account: {selectedDoc.accountNumber || "N/A"}</div>
                    <div>IFSC: {selectedDoc.ifscCode || "N/A"}</div>
                    <div>Holder: {selectedDoc.accountHolderName || "N/A"}</div>
                  </div>
                </div>
              </div>

              {/* Document Previews / Images */}
              <div className="space-y-3">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Submitted Images Previews</span>
                
                <div className="space-y-2">
                  {/* Aadhaar image */}
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">AADHAAR CARD IMAGE:</span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/20 aspect-video group flex items-center justify-center min-h-[220px]">
                      {selectedDoc.frontImage ? (
                        <>
                          <ImagePreview value={selectedDoc.frontImage} alt="Aadhaar" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={selectedDoc.frontImage} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white">
                              <Eye size={16} />
                            </a>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold uppercase">No Document Uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* PAN image */}
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono block mb-1">PAN CARD IMAGE:</span>
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/20 aspect-video group flex items-center justify-center min-h-[220px]">
                      {selectedDoc.selfieImage ? (
                        <>
                          <ImagePreview value={selectedDoc.selfieImage} alt="PAN" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <a href={selectedDoc.selfieImage} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 text-slate-200 hover:text-white">
                              <Eye size={16} />
                            </a>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold uppercase">No Document Uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Actions */}
              {selectedDoc.status === KycStatus.PENDING && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                  {!showRejectionForm ? (
                    <div className="grid grid-cols-1 gap-2 select-none">
                      <button
                        onClick={() => handleApprove(selectedDoc)}
                        className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        <Check size={14} />
                        Approve KYC Verification
                      </button>
                      <button
                        onClick={() => { setShowRejectionForm(true); setIsBlockUser(false); }}
                        className="py-2.5 rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        Reject Verification
                      </button>
                      <button
                        onClick={() => { setShowRejectionForm(true); setIsBlockUser(true); }}
                        className="py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/10 mt-2"
                      >
                        <Ban size={14} />
                        Reject & Block User
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleRejectSubmit} className="space-y-3">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <p>Provide a clear reason explaining why this KYC request was rejected. This is emailed directly to the user.</p>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Reason for Rejection</label>
                        <textarea
                          required
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Image quality is poor."
                          rows={3}
                          className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 text-slate-800 dark:text-slate-100 p-2.5 focus:outline-none"
                        />
                      </div>

                      {isBlockUser && (
                        <div className="p-2 border border-rose-500/50 bg-rose-500/20 rounded text-rose-500 text-[10px] font-bold flex items-center gap-2">
                          <Ban size={12} /> WARNING: This will also BLOCK the user from logging in.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => { setShowRejectionForm(false); setIsBlockUser(false); }}
                          className="py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={reviewMutation.isPending || blockMutation.isPending}
                          className="py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {reviewMutation.isPending || blockMutation.isPending ? "Processing..." : (isBlockUser ? "Confirm Reject & Block" : "Confirm Rejection")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 text-center select-none space-y-2">
              <FileText size={20} className="mx-auto text-slate-400" />
              <p className="text-xs font-semibold text-slate-400">Select a pending KYC document row to load image documents and compliance actions.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
