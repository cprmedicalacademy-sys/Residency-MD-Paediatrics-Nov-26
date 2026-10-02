import { ExamResult } from '../types/quiz';

export async function generateResultCardCanvas(result: ExamResult): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not supported');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
  gradient.addColorStop(0, '#041624');
  gradient.addColorStop(0.5, '#0a2540');
  gradient.addColorStop(1, '#061a2c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 700);

  // Outer Border & Guilloche corner lines
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 1140, 640);

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 40, 1120, 620);

  // Decorative corner accents
  const corners = [
    [40, 40],
    [1160, 40],
    [40, 660],
    [1160, 660],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Academy Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px "Space Grotesk", sans-serif';
  ctx.fillText('CPR MEDICAL ACADEMY', 600, 95);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('RESIDENCY MD PAEDIATRICS FACULTY NOV-26', 600, 125);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 32px "Space Grotesk", sans-serif';
  ctx.fillText('OFFICIAL RESIDENCY MERIT TRANSCRIPT', 600, 175);

  // Divider
  const divGrad = ctx.createLinearGradient(400, 195, 800, 195);
  divGrad.addColorStop(0, 'transparent');
  divGrad.addColorStop(0.5, '#38bdf8');
  divGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = divGrad;
  ctx.fillRect(350, 195, 500, 2);

  // Candidate Name Block
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PROUDLY PRESENTED TO CANDIDATE', 600, 235);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(result?.userName || 'Dr. Candidate', 600, 280);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(result?.userInstitute || 'CPR Medical Academy', 600, 312);

  // Safe numbers for Score Highlight Cards
  const finalScore = Number(result?.formula?.finalScore ?? result?.scoreMarks ?? 0) || 0;
  const percentage = Number(result?.percentage ?? 0) || 0;
  const mcqIntermediate = Number(result?.formula?.mcqIntermediateScore ?? result?.formula?.step2Result ?? 0) || 0;
  const sbaScore = Number(result?.formula?.sbaCorrect ?? 0) || 0;
  const negativeDeduction = Number(result?.formula?.negativeDeduction ?? 0) || 0;
  const isPassed = Boolean(result?.passed ?? (finalScore >= 24.0));

  const cardY = 350;
  const cardH = 135;

  const cards = [
    { label: 'FINAL COMPUTED SCORE', val: `${finalScore.toFixed(2)} / 40.0`, sub: 'Calculated CPR Formula' },
    { label: 'ACCURACY RATE', val: `${percentage.toFixed(1)}%`, sub: isPassed ? 'PASSED (≥24.0)' : 'NEEDS REVISION' },
    {
      label: 'FORMULA BREAKDOWN',
      val: `${mcqIntermediate.toFixed(1)} + ${sbaScore}`,
      sub: `Penalty: -${negativeDeduction.toFixed(2)} Marks`,
    },
  ];

  cards.forEach((c, idx) => {
    const x = 160 + idx * 300;
    // Card background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, cardY, 260, cardH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 12px "Space Grotesk", sans-serif';
    ctx.fillText(c.label, x + 130, cardY + 35);

    ctx.fillStyle = idx === 1 ? '#34d399' : '#ffffff';
    ctx.font = 'bold 30px "Space Grotesk", sans-serif';
    ctx.fillText(c.val, x + 130, cardY + 80);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(c.sub, x + 130, cardY + 112);
  });

  // Topic Breakdown Chips
  const topicY = 525;
  const topics = [
    { name: 'Neurology', data: result?.topicBreakdown?.Neurology },
    { name: 'Endocrinology', data: result?.topicBreakdown?.Endocrinology },
    { name: 'Rheumatology', data: result?.topicBreakdown?.Rheumatology },
  ];

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px "Space Grotesk", sans-serif';
  ctx.fillText('SUBJECT MASTERY:', 160, topicY);

  topics.forEach((t, i) => {
    const startX = 310 + i * 250;
    const rawPct = t.data ? Number(t.data.percentage || 0) : 0;
    const pct = isNaN(rawPct) ? '0' : rawPct.toFixed(0);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${t.name}: `, startX, topicY);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px "Space Grotesk", sans-serif';
    ctx.fillText(`${pct}%`, startX + (t.name.length * 8.5) + 8, topicY);
  });

  // Footer Seal & Verification Info
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Issued: ${result?.date || 'Recent'}`, 160, 615);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px "Space Grotesk", sans-serif';
  ctx.fillText('CPR MEDICAL ACADEMY · OFFICIAL FACULTY SYSTEM', 1040, 615);

  return canvas;
}

export async function downloadCertificateImage(result: ExamResult | null) {
  if (!result) return;
  const canvas = await generateResultCardCanvas(result);
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  const sanitizedName = (result.userName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
  const pct = Number(result.percentage || 0);
  const pctStr = isNaN(pct) ? '0' : pct.toFixed(0);
  anchor.download = `CPR_Residency_Result_${sanitizedName}_${pctStr}pct.png`;
  anchor.click();
}

export async function copyCertificateToClipboard(result: ExamResult | null): Promise<boolean> {
  if (!result) return false;
  try {
    const canvas = await generateResultCardCanvas(result);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (e) {
          console.warn('Clipboard write failed, fallback to text', e);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

export function getShareUrls(result: ExamResult | null) {
  if (!result) {
    return {
      whatsapp: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      telegram: '',
      shareText: '',
    };
  }
  const finalScore = Number(result.formula?.finalScore ?? result.scoreMarks ?? 0) || 0;
  const pct = Number(result.percentage ?? 0) || 0;
  const scoreStr = isNaN(finalScore) ? '0.00' : finalScore.toFixed(2);
  const pctStr = isNaN(pct) ? '0.0' : pct.toFixed(1);
  const text = `🎯 I scored ${scoreStr}/40.0 (${pctStr}%) in the CPR Medical Academy Residency MD Paediatrics Exam! [Formula: (175 - ভুল MCQ)×0.2 + SBA - (ভুল MCQ×0.05)]. Test your knowledge here:`;
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    shareText: `${text} ${url}`,
  };
}
