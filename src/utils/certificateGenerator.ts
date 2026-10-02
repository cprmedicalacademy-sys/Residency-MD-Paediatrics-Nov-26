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
  ctx.letterSpacing = '4px';
  ctx.fillText('CPR MEDICAL ACADEMY', 600, 95);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('RESIDENCY MD PAEDIATRICS FACULTY NOV-26', 600, 125);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 32px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '1px';
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
  ctx.letterSpacing = '1px';
  ctx.fillText('PROUDLY PRESENTED TO CANDIDATE', 600, 235);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.fillText(result.userName || 'Dr. Candidate', 600, 280);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(result.userInstitute || 'CPR Medical Academy', 600, 312);

  // Score Highlight Cards (3-col box)
  // Left: Total Score
  // Middle: Percentage
  // Right: Faculty Standing / Rank
  const cardY = 350;
  const cardH = 135;
  const cards = [
    { label: 'FINAL COMPUTED SCORE', val: `${result.formula.finalScore.toFixed(2)} / 40.0`, sub: 'Calculated CPR Formula' },
    { label: 'ACCURACY RATE', val: `${result.percentage.toFixed(1)}%`, sub: result.passed ? 'PASSED (≥24.0)' : 'NEEDS REVISION' },
    {
      label: 'FORMULA BREAKDOWN',
      val: `${result.formula.mcqIntermediateScore.toFixed(1)} + ${result.formula.sbaCorrect}`,
      sub: `Penalty: -${result.formula.negativeDeduction.toFixed(2)} Marks`,
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
    ctx.letterSpacing = '1.5px';
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
    { name: 'Neurology', data: result.topicBreakdown.Neurology },
    { name: 'Endocrinology', data: result.topicBreakdown.Endocrinology },
    { name: 'Rheumatology', data: result.topicBreakdown.Rheumatology },
  ];

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px "Space Grotesk", sans-serif';
  ctx.fillText('SUBJECT MASTERY:', 160, topicY);

  topics.forEach((t, i) => {
    const startX = 310 + i * 250;
    const pct = t.data ? t.data.percentage.toFixed(0) : '0';
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
  ctx.fillText(`Issued: ${result.date}`, 160, 615);
  ctx.fillText(`Certificate ID: CPR-MD-${result.id.slice(0, 8).toUpperCase()}`, 160, 635);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 13px "Space Grotesk", sans-serif';
  ctx.fillText('VERIFIED RESIDENCY ASSESSMENT', 1040, 615);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CPR Medical Academy · Faculty Examination Board', 1040, 635);

  return canvas;
}

export async function downloadCertificateImage(result: ExamResult): Promise<void> {
  const canvas = await generateResultCardCanvas(result);
  const dataUrl = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  const sanitizedName = (result.userName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
  anchor.download = `CPR_Residency_Result_${sanitizedName}_${result.percentage.toFixed(0)}pct.png`;
  anchor.click();
}

export async function copyCertificateToClipboard(result: ExamResult): Promise<boolean> {
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

export function getShareUrls(result: ExamResult) {
  const text = `🎯 I scored ${result.formula.finalScore.toFixed(2)}/40.0 (${result.percentage.toFixed(1)}%) in the CPR Medical Academy Residency MD Paediatrics Exam (Neurology, Endocrinology, Rheumatology)! [Formula: (Correct-Wrong)×0.2 + SBA - Neg]. Test your knowledge here:`;
  const url = window.location.href;

  return {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    shareText: `${text} ${url}`,
  };
}
