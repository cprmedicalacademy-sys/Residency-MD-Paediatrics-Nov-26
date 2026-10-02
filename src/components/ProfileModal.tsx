import React, { useState } from 'react';
import { UserProfile } from '../utils/storage';
import { Building2, CheckCircle2, Hash, User, X } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [institute, setInstitute] = useState(currentProfile.institute);
  const [candidateId, setCandidateId] = useState(currentProfile.candidateId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({
      name: name.trim(),
      institute: institute.trim() || 'CPR Medical Academy',
      candidateId: candidateId.trim() || 'CPR-MD-2601',
    });
    onClose();
  };

  const sampleInstitutes = [
    'Dhaka Medical College (DMC)',
    'Sir Salimullah Medical College (SSMC)',
    'Shaheed Suhrawardy Medical College (ShSMC)',
    'Chittagong Medical College (CMC)',
    'Mymensingh Medical College (MMC)',
    'Rajshahi Medical College (RMC)',
    'Sylhet MAG Osmani Medical College',
    'CPR Medical Academy',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Candidate Profile</h2>
              <p className="text-xs text-teal-100">Residency MD Paediatrics Nov-26</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Doctor / Candidate Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Tanjim Ahmed"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-hidden font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Your name will appear on the official certificate and live faculty leaderboard.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Medical College / Institute
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                placeholder="e.g. Dhaka Medical College / CPR Medical Academy"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-hidden"
              />
            </div>
            {/* Quick selectors */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {sampleInstitutes.slice(0, 4).map((inst) => (
                <button
                  type="button"
                  key={inst}
                  onClick={() => setInstitute(inst)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 border border-slate-200 transition-colors"
                >
                  {inst.split(' (')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Roll / Candidate ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                placeholder="e.g. CPR-MD-2601"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
