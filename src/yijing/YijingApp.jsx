import { useState, useCallback, useEffect, useRef } from 'react';
import HexagramFigure from './components/HexagramFigure.jsx';
import TrigramFigure from './components/TrigramFigure.jsx';
import { castLine, lineValueToType, linesToBinary, getTransformedLines } from './logic/casting.js';
import { identifyHexagram, getTransformedHexagram, getNuclearHexagram, getTrigramsForHexagram, getHexagramByNumber } from './logic/hexagram.js';
import { getReadingRules, describeTransformation } from './logic/reading.js';
import { TRIGRAMS, TRIGRAM_ORDER } from './data/trigrams.js';
import { HEXAGRAMS } from './data/hexagrams.js';

const VIEWS = { LANDING: 'landing', CASTING: 'casting', RESULT: 'result', REFERENCE: 'reference', HEX_DETAIL: 'hex_detail', HISTORY: 'history' };

function useReadingHistory() {
  const [readings, setReadings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('yijing-readings') || '[]'); }
    catch { return []; }
  });
  const save = useCallback((reading) => {
    setReadings(prev => {
      const next = [reading, ...prev].slice(0, 50);
      localStorage.setItem('yijing-readings', JSON.stringify(next));
      return next;
    });
  }, []);
  const remove = useCallback((id) => {
    setReadings(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem('yijing-readings', JSON.stringify(next));
      return next;
    });
  }, []);
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(readings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `yijing-readings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  }, [readings]);
  return { readings, save, remove, exportJSON };
}

// --- Header ---
function Header({ view, onNavigate }) {
  const navItems = [
    { key: VIEWS.LANDING, label: 'Consult' },
    { key: VIEWS.REFERENCE, label: 'Reference' },
    { key: VIEWS.HISTORY, label: 'History' },
  ];
  return (
    <header className="border-b ink-border px-4 sm:px-6 py-4 bg-paper/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button onClick={() => onNavigate(VIEWS.LANDING)} className="flex items-center gap-2 group">
          <span className="font-cjk text-2xl font-bold text-ink tracking-wide group-hover:text-cinnabar transition-colors">易經</span>
          <span className="text-xs text-clay tracking-widest uppercase hidden sm:block">Yijing</span>
        </button>
        <nav className="flex gap-1" role="navigation" aria-label="Main">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
                view === item.key || (item.key === VIEWS.LANDING && (view === VIEWS.CASTING || view === VIEWS.RESULT))
                  ? 'text-ink font-medium bg-cloud/60'
                  : 'text-clay hover:text-ink'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// --- Landing Page ---
function LandingPage({ onBegin }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-10 py-12 sm:py-20 animate-fade-in">
      <div className="space-y-4">
        <h1 className="font-cjk text-5xl sm:text-6xl font-bold text-ink tracking-wide">易經</h1>
        <p className="font-display text-xl sm:text-2xl text-charcoal tracking-wide">Book of Changes</p>
        <div className="w-16 h-px bg-gold mx-auto" />
        <p className="text-sm text-clay leading-relaxed max-w-md mx-auto">
          The Yijing is one of the oldest texts in world literature — a system of wisdom
          rooted in the observation of change. Frame your question, cast the hexagram,
          and reflect on the counsel it offers.
        </p>
      </div>
      <button
        onClick={onBegin}
        className="px-10 py-3.5 bg-ink text-paper font-body text-sm font-medium rounded-sm hover:bg-charcoal transition-colors tracking-wide"
      >
        Begin a Consultation
      </button>
      <p className="text-xs text-clay/70 max-w-sm mx-auto leading-relaxed">
        This is a cultural and reflective tool, not fortune-telling.
        Outcomes are generated randomly. Not a substitute for professional advice.
      </p>
    </div>
  );
}

// --- Casting Flow ---
function CastingFlow({ onComplete, onCancel }) {
  const [step, setStep] = useState('question'); // question | method | casting | done
  const [question, setQuestion] = useState('');
  const [method, setMethod] = useState(null);
  const [lines, setLines] = useState([]);
  const [casting, setCasting] = useState(false);
  const [coinDisplay, setCoinDisplay] = useState(null);
  const lineTimerRef = useRef(null);

  const handleSelectMethod = (m) => {
    setMethod(m);
    setStep('casting');
  };

  const castNextLine = useCallback(() => {
    if (casting) return;
    setCasting(true);

    if (method === 'coins') {
      const result = castLine('coins');
      setCoinDisplay(result.coins);
      setTimeout(() => {
        setLines(prev => [...prev, result]);
        setCasting(false);
        setCoinDisplay(null);
      }, 800);
    } else if (method === 'yarrow') {
      const result = castLine('yarrow');
      setTimeout(() => {
        setLines(prev => [...prev, result]);
        setCasting(false);
      }, 1200);
    } else {
      const result = castLine('coins');
      setLines(prev => [...prev, result]);
      setCasting(false);
    }
  }, [casting, method]);

  const castAllRemaining = useCallback(() => {
    const needed = 6 - lines.length;
    if (needed <= 0) return;

    let count = 0;
    const castOne = () => {
      if (count >= needed) return;
      const result = castLine(method === 'yarrow' ? 'yarrow' : 'coins');
      setLines(prev => [...prev, result]);
      count++;
      if (count < needed) {
        lineTimerRef.current = setTimeout(castOne, method === 'yarrow' ? 600 : 400);
      }
    };
    castOne();
  }, [lines.length, method]);

  useEffect(() => {
    return () => { if (lineTimerRef.current) clearTimeout(lineTimerRef.current); };
  }, []);

  const handleManualLine = (index, value) => {
    setLines(prev => {
      const next = [...prev];
      next[index] = { lineValue: value };
      return next;
    });
  };

  const handleComplete = () => {
    onComplete({ question, method: method || 'manual', lines });
  };

  if (step === 'question') {
    return (
      <div className="max-w-lg mx-auto space-y-8 py-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-ink">Frame Your Question</h2>
          <p className="text-sm text-clay">A clear, sincere question helps focus your reflection. It is optional but encouraged.</p>
        </div>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What would you like guidance on?"
          className="w-full h-32 p-4 bg-warm-white ink-border rounded-sm text-ink text-sm resize-none focus:outline-none focus:ring-1 focus:ring-gold/50 placeholder:text-clay/50"
          aria-label="Your question"
        />
        <button
          onClick={() => setStep('method')}
          className="w-full py-3 bg-ink text-paper text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
        >
          {question.trim() ? 'Continue' : 'Continue without a question'}
        </button>
        <button onClick={onCancel} className="w-full text-sm text-clay hover:text-ink transition-colors">Cancel</button>
      </div>
    );
  }

  if (step === 'method') {
    const methods = [
      {
        key: 'coins', name: 'Three Coins', chinese: '三錢法',
        desc: 'The quicker method. Three coins are thrown six times. Each outcome is equally probable.',
        note: 'Equal probability of changing lines (1/8 each for old yin and old yang).'
      },
      {
        key: 'yarrow', name: 'Yarrow Stalks', chinese: '蓍草法',
        desc: 'The traditional method. Forty-nine stalks are divided and counted three times per line.',
        note: 'Classical probabilities: old yin ≈ 1/16, old yang ≈ 3/16. Favors stability.'
      },
      {
        key: 'manual', name: 'Manual Entry', chinese: '手動輸入',
        desc: 'Enter your own line values if you have already cast.',
        note: 'Select each line as old yin (6), young yang (7), young yin (8), or old yang (9).'
      },
    ];
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-ink">Choose a Method</h2>
          <p className="text-sm text-clay">How would you like to cast your hexagram?</p>
        </div>
        <div className="space-y-3">
          {methods.map(m => (
            <button
              key={m.key}
              onClick={() => handleSelectMethod(m.key)}
              className="w-full text-left p-5 ink-border rounded-sm hover:bg-cloud/40 transition-colors group"
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-base font-semibold text-ink group-hover:text-cinnabar transition-colors">{m.name}</span>
                <span className="font-cjk text-sm text-clay">{m.chinese}</span>
              </div>
              <p className="text-sm text-charcoal leading-relaxed">{m.desc}</p>
              <p className="text-xs text-clay mt-1">{m.note}</p>
            </button>
          ))}
        </div>
        <button onClick={() => setStep('question')} className="w-full text-sm text-clay hover:text-ink transition-colors">Back</button>
      </div>
    );
  }

  if (step === 'casting' && method === 'manual') {
    const allFilled = lines.length === 6 && lines.every(l => l && l.lineValue);
    return (
      <div className="max-w-lg mx-auto space-y-6 py-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl font-bold text-ink">Enter Your Lines</h2>
          <p className="text-sm text-clay">Build from bottom (Line 1) to top (Line 6).</p>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1, 0].map(i => {
            const current = lines[i]?.lineValue;
            const options = [
              { val: 9, label: '9 — Old Yang ○', desc: 'Changing' },
              { val: 7, label: '7 — Young Yang', desc: 'Stable' },
              { val: 8, label: '8 — Young Yin', desc: 'Stable' },
              { val: 6, label: '6 — Old Yin ×', desc: 'Changing' },
            ];
            return (
              <div key={i} className="flex items-center gap-3 p-3 ink-border rounded-sm bg-warm-white">
                <span className="text-xs text-clay w-12 shrink-0">Line {i + 1}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {options.map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => handleManualLine(i, opt.val)}
                      className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                        current === opt.val
                          ? 'border-ink bg-ink text-paper'
                          : 'border-stone text-charcoal hover:border-clay'
                      }`}
                    >
                      {opt.val}
                      {(opt.val === 9 || opt.val === 6) && <span className="ml-1 text-cinnabar">{opt.val === 9 ? '○' : '×'}</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={handleComplete}
          disabled={!allFilled}
          className={`w-full py-3 text-sm font-medium rounded-sm transition-colors ${
            allFilled ? 'bg-ink text-paper hover:bg-charcoal' : 'bg-stone text-clay cursor-not-allowed'
          }`}
        >
          View Reading
        </button>
      </div>
    );
  }

  // Coin / Yarrow casting
  const isComplete = lines.length >= 6;
  return (
    <div className="max-w-lg mx-auto space-y-6 py-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-ink">
          {method === 'yarrow' ? 'Yarrow Stalk Casting' : 'Three Coin Casting'}
        </h2>
        <p className="text-sm text-clay">
          {isComplete ? 'Your hexagram is complete.' : `Line ${lines.length + 1} of 6 — casting from bottom to top.`}
        </p>
      </div>

      {/* Hexagram building display */}
      <div className="flex justify-center">
        <div className="relative">
          {isComplete && <HexagramFigure lines={lines} size="xl" showChanging animate />}
          {!isComplete && (
            <div className="w-40 space-y-2">
              {[5, 4, 3, 2, 1, 0].map(i => {
                const line = lines[i];
                if (!line) {
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-clay/40 w-6">{i + 1}</span>
                      <div className={`flex-1 h-3 rounded-sm ${i === lines.length ? 'bg-gold/20 border border-gold/30' : 'bg-stone/30'}`} />
                    </div>
                  );
                }
                const type = lineValueToType(line.lineValue);
                return (
                  <div key={i} className="flex items-center gap-2 animate-fade-in-up">
                    <span className="text-xs text-clay w-6">{i + 1}</span>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1">
                        {type.yin ? (
                          <div className="flex gap-1.5">
                            <div className="flex-1 h-3 bg-ink rounded-sm" />
                            <div className="flex-1 h-3 bg-ink rounded-sm" />
                          </div>
                        ) : (
                          <div className="h-3 bg-ink rounded-sm" />
                        )}
                      </div>
                      {type.changing && (
                        <span className="text-cinnabar text-xs font-bold ml-1">{type.marker}</span>
                      )}
                    </div>
                    <span className="text-xs text-clay w-4">{line.lineValue}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Coin animation display */}
      {coinDisplay && (
        <div className="flex justify-center gap-4 py-2">
          {coinDisplay.map((c, i) => (
            <div
              key={i}
              className="coin-flip w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2"
              style={{
                background: c === 3 ? 'var(--color-gold-light)' : 'var(--color-cloud)',
                borderColor: c === 3 ? 'var(--color-gold)' : 'var(--color-stone)',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {c === 3 ? '陽' : '陰'}
            </div>
          ))}
        </div>
      )}

      {/* Yarrow stalk display */}
      {method === 'yarrow' && casting && (
        <div className="text-center py-4">
          <div className="flex justify-center gap-0.5 mb-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 h-8 bg-bamboo/60 rounded-full"
                style={{ animation: `fadeIn 0.3s ease ${i * 0.03}s both`, transform: `rotate(${(Math.random() - 0.5) * 6}deg)` }}
              />
            ))}
          </div>
          <p className="text-xs text-clay animate-fade-in">Dividing and counting the stalks...</p>
        </div>
      )}

      {/* Action buttons */}
      {!isComplete && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={castNextLine}
            disabled={casting}
            className={`px-8 py-3 text-sm font-medium rounded-sm transition-colors ${
              casting ? 'bg-stone text-clay cursor-not-allowed' : 'bg-ink text-paper hover:bg-charcoal'
            }`}
          >
            {casting ? 'Casting...' : `Cast Line ${lines.length + 1}`}
          </button>
          {lines.length < 5 && (
            <button
              onClick={castAllRemaining}
              disabled={casting}
              className="px-6 py-3 text-sm text-clay border border-stone rounded-sm hover:border-clay hover:text-ink transition-colors"
            >
              Cast All
            </button>
          )}
        </div>
      )}

      {isComplete && (
        <button
          onClick={handleComplete}
          className="w-full py-3 bg-ink text-paper text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
        >
          View Your Reading
        </button>
      )}
    </div>
  );
}

// --- Reading Result ---
function ReadingResult({ reading, onNewReading, onNavigate }) {
  const [showNuclear, setShowNuclear] = useState(false);
  const { lines, question, method } = reading;
  const primary = identifyHexagram(lines);
  const changingIndices = lines.map((l, i) => lineValueToType(l.lineValue).changing ? i : -1).filter(i => i !== -1);
  const transformed = changingIndices.length > 0 ? getTransformedHexagram(lines) : null;
  const nuclear = getNuclearHexagram(lines);
  const rules = primary ? getReadingRules(lines, primary, transformed) : null;
  const transformation = primary && transformed ? describeTransformation(primary, transformed, changingIndices.length) : null;
  const primaryTrigrams = primary ? getTrigramsForHexagram(primary) : { lower: null, upper: null };
  const transformedTrigrams = transformed ? getTrigramsForHexagram(transformed) : { lower: null, upper: null };

  if (!primary) {
    return <div className="text-center py-20 text-clay">Could not identify hexagram from the cast lines.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
      {question && (
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-clay mb-1">Your Question</p>
          <p className="font-display text-lg text-ink italic">"{question}"</p>
        </div>
      )}

      {/* Primary Hexagram */}
      <HexagramPanel
        hexagram={primary}
        lines={lines}
        trigrams={primaryTrigrams}
        label="Primary Hexagram"
        changingIndices={changingIndices}
        onHexClick={() => onNavigate(VIEWS.HEX_DETAIL, primary.number)}
      />

      {/* Reading Rules / Interpretation */}
      {rules && (
        <div className="ink-wash p-6 rounded-sm ink-border space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink">Interpretation</h3>
          <p className="text-sm text-charcoal leading-relaxed">{rules.instruction}</p>
          {rules.governingTexts.map((gt, i) => (
            <div key={i} className="pl-4 border-l-2 border-gold/40 space-y-1">
              <p className="text-xs uppercase tracking-widest text-gold font-medium">{gt.label}</p>
              <p className="text-sm text-ink leading-relaxed">{gt.text}</p>
            </div>
          ))}
          {transformation && (
            <div className="pt-3 border-t border-stone/30">
              <p className="text-sm text-charcoal leading-relaxed">{transformation}</p>
            </div>
          )}
        </div>
      )}

      {/* Line Statements */}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-ink">Line Statements</h3>
        {[5, 4, 3, 2, 1, 0].map(i => {
          const type = lineValueToType(lines[i].lineValue);
          const isChanging = type.changing;
          return (
            <div
              key={i}
              className={`p-3 rounded-sm text-sm flex gap-3 ${
                isChanging ? 'bg-cinnabar/5 border border-cinnabar/20' : 'bg-warm-white ink-border'
              }`}
            >
              <div className="shrink-0 w-20 text-xs text-clay">
                <span>Line {i + 1}</span>
                <br />
                <span>{type.label}</span>
                {isChanging && <span className="text-cinnabar ml-1">{type.marker}</span>}
              </div>
              <p className={`leading-relaxed ${isChanging ? 'text-ink font-medium' : 'text-charcoal/70'}`}>
                {primary.lines[i]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transformed Hexagram */}
      {transformed && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone/40" />
            <span className="text-xs uppercase tracking-widest text-clay">Transforms Into</span>
            <div className="flex-1 h-px bg-stone/40" />
          </div>
          <HexagramPanel
            hexagram={transformed}
            trigrams={transformedTrigrams}
            label="Transformed Hexagram"
            onHexClick={() => onNavigate(VIEWS.HEX_DETAIL, transformed.number)}
          />
        </div>
      )}

      {/* Nuclear Hexagram */}
      {nuclear && (
        <div>
          <button
            onClick={() => setShowNuclear(!showNuclear)}
            className="text-sm text-clay hover:text-ink transition-colors flex items-center gap-1"
            aria-expanded={showNuclear}
          >
            <span className={`transform transition-transform ${showNuclear ? 'rotate-90' : ''}`}>&#9654;</span>
            Nuclear Hexagram (互卦) — {nuclear.chinese} {nuclear.pinyin}
          </button>
          {showNuclear && (
            <div className="mt-3 pl-4 animate-fade-in">
              <HexagramPanel
                hexagram={nuclear}
                trigrams={getTrigramsForHexagram(nuclear)}
                label="Nuclear Hexagram"
                compact
                onHexClick={() => onNavigate(VIEWS.HEX_DETAIL, nuclear.number)}
              />
            </div>
          )}
        </div>
      )}

      {/* Modern Gloss */}
      {primary.gloss && (
        <div className="p-5 bg-gold/5 border border-gold/20 rounded-sm">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">Modern Reflection</p>
          <p className="text-sm text-charcoal leading-relaxed">{primary.gloss}</p>
        </div>
      )}

      {/* Method & Metadata */}
      <div className="text-center text-xs text-clay/60 space-y-1">
        <p>Cast using {method === 'yarrow' ? 'yarrow stalk' : method === 'coins' ? 'three-coin' : 'manual entry'} method</p>
        <p>{new Date(reading.timestamp).toLocaleString()}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={onNewReading}
          className="px-8 py-3 bg-ink text-paper text-sm font-medium rounded-sm hover:bg-charcoal transition-colors"
        >
          New Consultation
        </button>
      </div>
    </div>
  );
}

function HexagramPanel({ hexagram, lines, trigrams, label, changingIndices, compact, onHexClick }) {
  if (!hexagram) return null;
  return (
    <div className={`ink-border rounded-sm ${compact ? 'p-4' : 'p-5 sm:p-6'} ink-wash`}>
      {label && <p className="text-xs uppercase tracking-widest text-clay mb-3">{label}</p>}
      <div className="flex gap-5 sm:gap-8">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <button onClick={onHexClick} className="hover:opacity-70 transition-opacity" title="View in reference">
            <HexagramFigure
              lines={lines}
              binary={!lines ? hexagram.binary : undefined}
              size={compact ? 'md' : 'lg'}
              showChanging={!!changingIndices}
            />
          </button>
          <span className="text-xs text-clay">No. {hexagram.number}</span>
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <button onClick={onHexClick} className="hover:text-cinnabar transition-colors">
              <h3 className="font-cjk text-2xl sm:text-3xl font-bold text-ink">{hexagram.chinese}</h3>
            </button>
            <p className="font-display text-base text-charcoal">{hexagram.pinyin} — {hexagram.english}</p>
          </div>
          {trigrams && (
            <div className="flex gap-4 text-xs text-clay">
              {trigrams.upper && (
                <span className="flex items-center gap-1">
                  <TrigramFigure bits={hexagram.binary.slice(3, 6)} size="sm" />
                  Upper: {trigrams.upper.name} {trigrams.upper.english}
                </span>
              )}
              {trigrams.lower && (
                <span className="flex items-center gap-1">
                  <TrigramFigure bits={hexagram.binary.slice(0, 3)} size="sm" />
                  Lower: {trigrams.lower.name} {trigrams.lower.english}
                </span>
              )}
            </div>
          )}
          {!compact && (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest text-clay mb-1">Judgment</p>
                <p className="text-sm text-ink leading-relaxed">{hexagram.judgment}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-clay mb-1">Image</p>
                <p className="text-sm text-charcoal leading-relaxed">{hexagram.image}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Reference Library ---
function ReferenceLibrary({ onSelectHexagram }) {
  const [tab, setTab] = useState('hexagrams');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filtered = HEXAGRAMS.filter(h => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return h.chinese.includes(search) ||
      h.pinyin.toLowerCase().includes(s) ||
      h.english.toLowerCase().includes(s) ||
      String(h.number) === s;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-bold text-ink">Reference Library</h2>
        <p className="text-sm text-clay">Browse all 64 hexagrams and 8 trigrams.</p>
      </div>

      <div className="flex gap-2 justify-center">
        {['hexagrams', 'trigrams'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm rounded-sm transition-colors capitalize ${
              tab === t ? 'bg-ink text-paper' : 'border border-stone text-clay hover:text-ink'
            }`}
          >
            {t === 'hexagrams' ? '64 Hexagrams' : '8 Trigrams'}
          </button>
        ))}
      </div>

      {tab === 'hexagrams' && (
        <>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, pinyin, or number..."
              className="flex-1 px-4 py-2 bg-warm-white ink-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-gold/50 placeholder:text-clay/40"
              aria-label="Search hexagrams"
            />
            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-sm ${viewMode === 'grid' ? 'bg-ink text-paper' : 'text-clay hover:text-ink'}`}
                aria-label="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-sm ${viewMode === 'list' ? 'bg-ink text-paper' : 'text-clay hover:text-ink'}`}
                aria-label="List view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {filtered.map(h => (
                <button
                  key={h.number}
                  onClick={() => onSelectHexagram(h.number)}
                  className="p-2 ink-border rounded-sm hover:bg-cloud/40 transition-colors flex flex-col items-center gap-1 group"
                  title={`${h.number}. ${h.chinese} ${h.pinyin} — ${h.english}`}
                >
                  <HexagramFigure binary={h.binary} size="sm" showChanging={false} />
                  <span className="font-cjk text-sm group-hover:text-cinnabar transition-colors">{h.chinese}</span>
                  <span className="text-[10px] text-clay">{h.number}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map(h => (
                <button
                  key={h.number}
                  onClick={() => onSelectHexagram(h.number)}
                  className="w-full flex items-center gap-3 p-3 ink-border rounded-sm hover:bg-cloud/40 transition-colors text-left group"
                >
                  <span className="text-xs text-clay w-8">{h.number}</span>
                  <HexagramFigure binary={h.binary} size="sm" showChanging={false} />
                  <span className="font-cjk text-lg group-hover:text-cinnabar transition-colors">{h.chinese}</span>
                  <span className="text-sm text-charcoal">{h.pinyin}</span>
                  <span className="text-sm text-clay">— {h.english}</span>
                </button>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <p className="text-center text-clay text-sm py-8">No hexagrams match your search.</p>
          )}
        </>
      )}

      {tab === 'trigrams' && <TrigramReference />}
    </div>
  );
}

function TrigramReference() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {TRIGRAM_ORDER.map(bits => {
        const t = TRIGRAMS[bits];
        return (
          <div key={bits} className="p-5 ink-border rounded-sm ink-wash space-y-3">
            <div className="flex items-center gap-3">
              <TrigramFigure bits={bits} size="lg" />
              <div>
                <h3 className="font-cjk text-2xl font-bold text-ink">{t.name}</h3>
                <p className="text-sm text-charcoal">{t.pinyin} — {t.english}</p>
                <p className="text-xs text-clay">{t.symbol}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-clay">Element:</span> <span className="text-ink">{t.element}</span></div>
              <div><span className="text-clay">Direction:</span> <span className="text-ink">{t.direction}</span></div>
              <div><span className="text-clay">Family:</span> <span className="text-ink">{t.family}</span></div>
              <div><span className="text-clay">Image:</span> <span className="text-ink">{t.image}</span></div>
            </div>
            <p className="text-xs text-charcoal">{t.keywords}</p>
          </div>
        );
      })}
    </div>
  );
}

// --- Hexagram Detail ---
function HexagramDetail({ number, onBack, onNavigate }) {
  const hex = getHexagramByNumber(number);
  if (!hex) return <div className="text-center py-20 text-clay">Hexagram not found.</div>;

  const trigrams = getTrigramsForHexagram(hex);
  const nuclearBinary = [
    hex.binary[1], hex.binary[2], hex.binary[3],
    hex.binary[2], hex.binary[3], hex.binary[4],
  ].join('');
  const nuclear = HEXAGRAMS.find(h => h.binary === nuclearBinary);

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8 animate-fade-in">
      <button onClick={onBack} className="text-sm text-clay hover:text-ink transition-colors flex items-center gap-1">
        &#8592; Back to Reference
      </button>

      <div className="flex gap-6 sm:gap-10 items-start">
        <div className="shrink-0 flex flex-col items-center gap-2">
          <HexagramFigure binary={hex.binary} size="xl" showChanging={false} />
          <span className="text-sm text-clay font-medium">No. {hex.number}</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-cjk text-4xl sm:text-5xl font-bold text-ink">{hex.chinese}</h2>
          <p className="font-display text-xl text-charcoal">{hex.pinyin} — {hex.english}</p>
        </div>
      </div>

      {/* Trigrams */}
      <div className="flex gap-6">
        {trigrams.upper && (
          <div className="flex items-center gap-2 p-3 ink-border rounded-sm bg-warm-white">
            <TrigramFigure bits={hex.binary.slice(3, 6)} size="md" />
            <div className="text-xs">
              <p className="text-clay">Upper Trigram</p>
              <p className="text-ink font-medium">{trigrams.upper.name} {trigrams.upper.english}</p>
              <p className="text-clay">{trigrams.upper.image}</p>
            </div>
          </div>
        )}
        {trigrams.lower && (
          <div className="flex items-center gap-2 p-3 ink-border rounded-sm bg-warm-white">
            <TrigramFigure bits={hex.binary.slice(0, 3)} size="md" />
            <div className="text-xs">
              <p className="text-clay">Lower Trigram</p>
              <p className="text-ink font-medium">{trigrams.lower.name} {trigrams.lower.english}</p>
              <p className="text-clay">{trigrams.lower.image}</p>
            </div>
          </div>
        )}
      </div>

      {/* Judgment */}
      <div className="p-5 ink-wash ink-border rounded-sm space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-gold font-medium">Judgment (卦辭)</h3>
        <p className="text-base text-ink leading-relaxed">{hex.judgment}</p>
      </div>

      {/* Image */}
      <div className="p-5 ink-wash ink-border rounded-sm space-y-2">
        <h3 className="text-xs uppercase tracking-widest text-gold font-medium">Image (大象傳)</h3>
        <p className="text-base text-charcoal leading-relaxed">{hex.image}</p>
      </div>

      {/* Line Statements */}
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-ink">Line Statements (爻辭)</h3>
        {[5, 4, 3, 2, 1, 0].map(i => {
          const isYin = hex.binary[i] === '0';
          return (
            <div key={i} className="p-3 ink-border rounded-sm bg-warm-white flex gap-3">
              <div className="shrink-0 w-24 text-xs text-clay">
                <span className="font-medium">Line {i + 1}</span>
                <br />
                <span>{isYin ? 'Six' : 'Nine'} in the {['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][i]} place</span>
              </div>
              <p className="text-sm text-ink leading-relaxed">{hex.lines[i]}</p>
            </div>
          );
        })}
      </div>

      {/* Modern Gloss */}
      {hex.gloss && (
        <div className="p-5 bg-gold/5 border border-gold/20 rounded-sm">
          <p className="text-xs uppercase tracking-widest text-gold mb-2">Modern Reflection</p>
          <p className="text-sm text-charcoal leading-relaxed">{hex.gloss}</p>
        </div>
      )}

      {/* Nuclear Hexagram */}
      {nuclear && (
        <div className="p-4 ink-border rounded-sm bg-warm-white flex items-center gap-4">
          <HexagramFigure binary={nuclear.binary} size="sm" showChanging={false} />
          <div>
            <p className="text-xs text-clay">Nuclear Hexagram (互卦)</p>
            <button
              onClick={() => onNavigate(VIEWS.HEX_DETAIL, nuclear.number)}
              className="text-sm text-ink font-medium hover:text-cinnabar transition-colors"
            >
              {nuclear.number}. {nuclear.chinese} {nuclear.pinyin} — {nuclear.english}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        {number > 1 ? (
          <button
            onClick={() => onNavigate(VIEWS.HEX_DETAIL, number - 1)}
            className="text-sm text-clay hover:text-ink transition-colors"
          >
            &#8592; {number - 1}. {getHexagramByNumber(number - 1)?.chinese}
          </button>
        ) : <span />}
        {number < 64 ? (
          <button
            onClick={() => onNavigate(VIEWS.HEX_DETAIL, number + 1)}
            className="text-sm text-clay hover:text-ink transition-colors"
          >
            {number + 1}. {getHexagramByNumber(number + 1)?.chinese} &#8594;
          </button>
        ) : <span />}
      </div>
    </div>
  );
}

// --- Reading History ---
function ReadingHistory({ readings, onSelect, onDelete, onExport }) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (readings.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 space-y-4 animate-fade-in">
        <p className="font-cjk text-4xl text-stone">空</p>
        <p className="text-sm text-clay">No readings yet. Begin a consultation to create your first reading.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-ink">Reading History</h2>
        <div className="flex gap-2">
          <button onClick={onExport} className="text-xs text-clay hover:text-ink border border-stone px-3 py-1.5 rounded-sm transition-colors">
            Export JSON
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {readings.map(r => {
          const primary = identifyHexagram(r.lines);
          const changingCount = r.lines.filter(l => lineValueToType(l.lineValue).changing).length;
          const transformed = changingCount > 0 ? getTransformedHexagram(r.lines) : null;
          return (
            <div key={r.id} className="flex items-center gap-4 p-4 ink-border rounded-sm hover:bg-cloud/30 transition-colors group">
              <button onClick={() => onSelect(r)} className="flex items-center gap-4 flex-1 text-left min-w-0">
                {primary && <HexagramFigure binary={primary.binary} size="sm" showChanging={false} />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    {primary && (
                      <span className="font-cjk text-lg text-ink group-hover:text-cinnabar transition-colors">{primary.chinese}</span>
                    )}
                    {primary && <span className="text-sm text-charcoal">{primary.english}</span>}
                    {changingCount > 0 && (
                      <span className="text-xs text-cinnabar">
                        → {transformed?.chinese}
                      </span>
                    )}
                  </div>
                  {r.question && <p className="text-xs text-clay truncate">{r.question}</p>}
                  <p className="text-xs text-clay/60">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="text-clay/40 hover:text-cinnabar transition-colors text-xs opacity-0 group-hover:opacity-100"
                aria-label="Delete reading"
              >
                &#10005;
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main App ---
export default function YijingApp() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [currentReading, setCurrentReading] = useState(null);
  const [hexDetailNumber, setHexDetailNumber] = useState(null);
  const history = useReadingHistory();

  const navigate = useCallback((v, param) => {
    if (v === VIEWS.HEX_DETAIL && param) {
      setHexDetailNumber(param);
    }
    setView(v);
    window.scrollTo(0, 0);
  }, []);

  const handleCastingComplete = useCallback((result) => {
    const reading = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...result,
    };
    history.save(reading);
    setCurrentReading(reading);
    setView(VIEWS.RESULT);
  }, [history]);

  const handleSelectHistory = useCallback((reading) => {
    setCurrentReading(reading);
    setView(VIEWS.RESULT);
  }, []);

  return (
    <div className="min-h-screen bg-paper">
      <Header view={view} onNavigate={navigate} />
      <main className="px-4 sm:px-6">
        {view === VIEWS.LANDING && (
          <LandingPage onBegin={() => navigate(VIEWS.CASTING)} />
        )}
        {view === VIEWS.CASTING && (
          <CastingFlow
            onComplete={handleCastingComplete}
            onCancel={() => navigate(VIEWS.LANDING)}
          />
        )}
        {view === VIEWS.RESULT && currentReading && (
          <ReadingResult
            reading={currentReading}
            onNewReading={() => navigate(VIEWS.CASTING)}
            onNavigate={navigate}
          />
        )}
        {view === VIEWS.REFERENCE && (
          <ReferenceLibrary onSelectHexagram={(num) => navigate(VIEWS.HEX_DETAIL, num)} />
        )}
        {view === VIEWS.HEX_DETAIL && hexDetailNumber && (
          <HexagramDetail
            number={hexDetailNumber}
            onBack={() => navigate(VIEWS.REFERENCE)}
            onNavigate={navigate}
          />
        )}
        {view === VIEWS.HISTORY && (
          <ReadingHistory
            readings={history.readings}
            onSelect={handleSelectHistory}
            onDelete={history.remove}
            onExport={history.exportJSON}
          />
        )}
      </main>
      <footer className="border-t ink-border px-4 sm:px-6 py-6 mt-16">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p className="text-xs text-clay/60">
            The Yijing (I Ching) is presented here as a cultural and reflective tool.
            Outcomes are generated randomly using mathematical algorithms.
            This is not fortune-telling, and should not substitute for professional advice.
          </p>
          <p className="text-xs text-clay/40">
            Texts based on public-domain sources and original interpretations.
            Not a reproduction of any copyrighted translation.
          </p>
        </div>
      </footer>
    </div>
  );
}
