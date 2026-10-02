import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { Topic } from '../types/quiz';
import { BookOpen, Check, HelpCircle, Search, Sparkles, X } from 'lucide-react';

export const StudyGuide: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<'All' | Topic>('All');
  const [search, setSearch] = useState('');

  const filtered = QUIZ_QUESTIONS.filter((q) => {
    if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
    if (search.trim()) {
      const qText = q.stem.toLowerCase();
      const expl = (q.explanation || '').toLowerCase();
      const s = search.toLowerCase();
      return qText.includes(s) || expl.includes(s);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Faculty Official Solution Transcript</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          CPR Medical Academy · Answer Key & Revision Pearls
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Complete official answers for all 35 Multiple Choice Questions (5 True/False stems each) and 5 Single Best Answer clinical vignettes.
        </p>

        {/* Search & Topic Filters */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search diagnosis or stem..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 text-xs">
            {(['All', 'Neurology', 'Endocrinology', 'Rheumatology', 'Emergency & General'] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    selectedTopic === t
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 font-mono text-xs font-bold flex items-center justify-center">
                  #{q.id}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  {q.type === 'mcq' ? 'MCQ (5 Stems)' : 'SBA Clinical Case'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{q.topic}</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{q.stem}</h3>

            {/* MCQ Options Display */}
            {q.type === 'mcq' && (
              <div className="space-y-2 pt-1">
                {q.options.map((stem) => (
                  <div
                    key={stem.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">{stem.id}.</span>
                      <span className="text-slate-800 font-medium">{stem.text}</span>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs flex items-center gap-1 ${
                        stem.isTrue
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {stem.isTrue ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      <span>{stem.isTrue ? 'TRUE' : 'FALSE'}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* SBA Options Display */}
            {q.type === 'sba' && (
              <div className="space-y-1.5 pt-1">
                {q.options.map((opt) => {
                  const isCorrect = q.correctOption === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs ${
                        isCorrect
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{opt.id}.</span>
                        <span>{opt.text}</span>
                      </div>
                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px]">
                          CORRECT ANSWER
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Official Faculty Explanation Note */}
            {q.explanation && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="flex items-center gap-1 font-bold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Official Key Explanation:</span>
                </div>
                <p className="text-slate-800 leading-relaxed font-sans">{q.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
