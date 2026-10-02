import React, { useEffect, useRef, useState } from 'react';
import { ExamResult } from '../types/quiz';
import {
  copyCertificateToClipboard,
  downloadCertificateImage,
  generateResultCardCanvas,
  getShareUrls,
} from '../utils/certificateGenerator';
import {
  Award,
  Check,
  Copy,
  Download,
  ExternalLink,
  MessageCircle,
  Share2,
  Twitter,
  X,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ExamResult | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, result }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !result) return;

    let isMounted = true;
    setIsGenerating(true);

    generateResultCardCanvas(result)
      .then((canvas) => {
        if (!isMounted || !canvasContainerRef.current) return;
        canvasContainerRef.current.innerHTML = '';
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.borderRadius = '12px';
        canvasContainerRef.current.appendChild(canvas);
      })
      .catch((err) => {
        console.error('Error rendering canvas preview', err);
      })
      .finally(() => {
        if (isMounted) setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const shareUrls = getShareUrls(result);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareUrls.shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      alert('Unable to copy text to clipboard');
    }
  };

  const handleCopyImage = async () => {
    const success = await copyCertificateToClipboard(result);
    if (success) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2500);
    } else {
      alert('Your browser does not support copying images directly. Please use "Download PNG" instead!');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CPR Medical Academy Residency Exam Result',
          text: shareUrls.shareText,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm sm:text-base font-bold">
                Share Official Result & Certificate
              </h2>
              <p className="text-[11px] text-slate-300">
                Residency MD Paediatrics · CPR Medical Academy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Certificate Canvas Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>CERTIFICATE TRANSCRIPT PREVIEW</span>
              <span className="text-teal-700">HD 1200x700 PNG</span>
            </div>
            <div
              ref={canvasContainerRef}
              className="bg-slate-950 p-2 rounded-2xl shadow-inner min-h-[220px] flex items-center justify-center text-slate-400 text-xs"
            >
              {isGenerating ? 'Rendering high-resolution transcript...' : 'Loading certificate...'}
            </div>
          </div>

          {/* Quick Primary Actions: Download & Copy Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => downloadCertificateImage(result)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Image Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copy Image to Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Social Platforms Row */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Post to Social Networks & Groups
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                href={shareUrls.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs transition-colors border border-[#25D366]/30"
              >
                <MessageCircle className="w-4 h-4 fill-[#25D366] text-transparent" />
                <span>WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={shareUrls.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-bold text-xs transition-colors border border-[#1877F2]/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Facebook</span>
              </a>

              {/* Twitter / X */}
              <a
                href={shareUrls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span>Post on X</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareUrls.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0077B5]/10 hover:bg-[#0077B5]/20 text-[#0077B5] font-bold text-xs transition-colors border border-[#0077B5]/30"
              >
                <ExternalLink className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Copy Text Summary Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Text Summary for Messaging</span>
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 text-teal-700 hover:text-teal-900"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded-lg border border-slate-200 select-all leading-relaxed">
              {shareUrls.shareText}
            </p>
          </div>

          {/* Mobile Web Share if supported */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-teal-600" />
              <span>More Sharing Options (Mobile)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
