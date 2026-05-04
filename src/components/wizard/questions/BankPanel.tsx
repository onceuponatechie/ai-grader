import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  UploadCloud,
  FileText,
  Sparkles,
  CircleDot,
  AlignLeft,
  PenLine,
  Loader2,
} from 'lucide-react';
import type { Question, QuestionType, McqOption } from '@/types';
import type { DraftQuestion } from '@/types/draft';
import {
  getQuestionBanks,
  getQuestions,
} from '@/lib/api';
import { withCount } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/Skeleton';

type Props = {
  alreadyAdded: Set<string>;
  /** Called with a fresh draft question copy when the teacher picks a bank or AI-parsed item. */
  onAddDraft: (q: DraftQuestion) => void;
};

type Tab = 'bank' | 'upload' | 'waec';

export function BankPanel({ alreadyAdded, onAddDraft }: Props) {
  const [tab, setTab] = useState<Tab>('bank');

  return (
    <aside className="flex h-full flex-col rounded-card border border-border-subtle bg-surface shadow-soft">
      <div className="border-b border-border-subtle px-1.5 pt-1.5">
        <div role="tablist" className="flex gap-1">
          <TabButton
            label="From my bank"
            active={tab === 'bank'}
            onClick={() => setTab('bank')}
          />
          <TabButton
            label="Upload"
            active={tab === 'upload'}
            onClick={() => setTab('upload')}
          />
          <TabButton
            label="Past WAEC"
            active={tab === 'waec'}
            onClick={() => setTab('waec')}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'bank' && (
          <BankTab alreadyAdded={alreadyAdded} onAddDraft={onAddDraft} />
        )}
        {tab === 'upload' && <UploadTab onAddDraft={onAddDraft} />}
        {tab === 'waec' && (
          <WaecTab alreadyAdded={alreadyAdded} onAddDraft={onAddDraft} />
        )}
      </div>
    </aside>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-t-control px-3 py-2 text-[13px] font-medium transition-colors',
        active
          ? 'bg-canvas text-ink'
          : 'text-ink-secondary hover:bg-hairline hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab: From my question bank
// ────────────────────────────────────────────────────────────────────

function BankTab({
  alreadyAdded,
  onAddDraft,
}: {
  alreadyAdded: Set<string>;
  onAddDraft: (q: DraftQuestion) => void;
}) {
  const { questions, banksById, loading } = useBankQuestions(
    (q) =>
      q.question_bank_id !== null && q.question_bank_id !== 'qb_waec_chem',
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return questions;
    return questions.filter((q) =>
      q.content.toLowerCase().includes(needle),
    );
  }, [questions, query]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-ink">
          Your saved questions
        </h3>
        <p className="mt-1 text-[12px] leading-snug text-ink-secondary">
          Click any question to add it to this exam. You can edit it
          afterwards without changing the saved copy.
        </p>
      </div>

      <SearchField value={query} onChange={setQuery} placeholder="Search saved questions" />

      {loading ? (
        <BankListSkeleton />
      ) : filtered.length === 0 ? (
        <p className="rounded-control border border-dashed border-border bg-canvas px-3 py-6 text-center text-[13px] text-ink-secondary">
          No saved questions match "{query}".
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((q) => (
            <BankQuestionRow
              key={q.id}
              q={q}
              groupLabel={banksById.get(q.question_bank_id ?? '')?.name ?? 'My bank'}
              alreadyAdded={alreadyAdded.has(q.id)}
              onAdd={() => onAddDraft(toDraftQuestion(q))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab: Upload (AI-assisted parse)
// ────────────────────────────────────────────────────────────────────

function UploadTab({ onAddDraft }: { onAddDraft: (q: DraftQuestion) => void }) {
  const [state, setState] = useState<
    | { kind: 'idle' }
    | { kind: 'parsing'; filename: string }
    | { kind: 'parsed'; filename: string; items: ParsedItem[] }
  >({ kind: 'idle' });

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function fakeUpload(filename: string) {
    setState({ kind: 'parsing', filename });
    window.setTimeout(() => {
      setState({ kind: 'parsed', filename, items: FAKE_PARSED });
      setSelected(new Set(FAKE_PARSED.map((i) => i.id)));
    }, 1300);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function addSelected() {
    if (state.kind !== 'parsed') return;
    state.items
      .filter((i) => selected.has(i.id))
      .forEach((i) => onAddDraft(parsedItemToDraft(i)));
    setState({ kind: 'idle' });
    setSelected(new Set());
  }

  if (state.kind === 'idle') {
    return (
      <div>
        <div
          onClick={() => fakeUpload('Chemistry SS3 questions.docx')}
          className="flex cursor-pointer flex-col items-center rounded-card border border-dashed border-border bg-canvas px-6 py-10 text-center transition-colors hover:border-ink-secondary hover:bg-surface"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-soft">
            <UploadCloud size={20} strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-[14px] font-semibold text-ink">
            Drop a document here, or click to upload
          </h3>
          <p className="mt-2 max-w-xs text-[12px] leading-snug text-ink-secondary">
            We'll read your document and turn it into questions you can review
            and edit. Saves you from copying one by one.
          </p>
          <p className="mt-3 text-[11px] uppercase tracking-wider text-ink-tertiary">
            Word doc, PDF, or plain text
          </p>
        </div>
        <div className="mt-3 text-center">
          <button
            type="button"
            className="text-[12px] text-ink-secondary underline-offset-2 hover:text-ink hover:underline"
          >
            Use a spreadsheet instead
          </button>
        </div>
      </div>
    );
  }

  if (state.kind === 'parsing') {
    return (
      <div className="flex flex-col items-center rounded-card border border-border-subtle bg-canvas px-6 py-10 text-center">
        <Loader2
          size={22}
          strokeWidth={1.75}
          className="animate-spin text-ink-secondary"
          aria-hidden
        />
        <h3 className="mt-4 text-[14px] font-semibold text-ink">
          Reading {state.filename}…
        </h3>
        <p className="mt-2 max-w-xs text-[12px] leading-snug text-ink-secondary">
          This usually takes a few seconds for a typical paper.
        </p>
      </div>
    );
  }

  // parsed
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-control border border-border-subtle bg-canvas p-3">
        <Sparkles
          size={14}
          strokeWidth={1.75}
          className="mt-0.5 shrink-0 text-ink-secondary"
          aria-hidden
        />
        <div className="text-[12px] leading-snug text-ink-secondary">
          We pulled <strong className="text-ink">{state.items.length} questions</strong>{' '}
          from <em>{state.filename}</em>. Untick anything you don't want, then
          add them. You can keep editing each question after.
        </div>
      </div>

      <ul className="space-y-2">
        {state.items.map((item) => (
          <li
            key={item.id}
            className="rounded-control border border-border-subtle bg-canvas p-3"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-ink"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <TypePill type={item.type} />
                  <span className="text-[11px] uppercase tracking-wider text-ink-tertiary">
                    · {withCount(item.marks, 'mark')}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink">
                  {item.content}
                </p>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
        <button
          type="button"
          onClick={() => {
            setState({ kind: 'idle' });
            setSelected(new Set());
          }}
          className="text-[13px] text-ink-secondary hover:text-ink"
        >
          Discard
        </button>
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={addSelected}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-control px-3 text-[13px] font-medium shadow-soft transition-colors',
            selected.size === 0
              ? 'cursor-not-allowed bg-hairline text-ink-tertiary'
              : 'bg-ink text-white hover:bg-[#1F1F1F]',
          )}
        >
          Add {selected.size} {selected.size === 1 ? 'question' : 'questions'}
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Tab: Past WAEC
// ────────────────────────────────────────────────────────────────────

function WaecTab({
  alreadyAdded,
  onAddDraft,
}: {
  alreadyAdded: Set<string>;
  onAddDraft: (q: DraftQuestion) => void;
}) {
  const { questions, loading } = useBankQuestions(
    (q) => q.question_bank_id === 'qb_waec_chem',
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return questions;
    return questions.filter((q) => q.content.toLowerCase().includes(needle));
  }, [questions, query]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[14px] font-semibold text-ink">
          Past WAEC questions
        </h3>
        <p className="mt-1 text-[12px] leading-snug text-ink-secondary">
          Pre-loaded WAEC papers, organised by subject. Tap any question to
          drop it into your exam — you can still edit it afterwards.
        </p>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        placeholder="Search Chemistry past questions"
      />

      {loading ? (
        <BankListSkeleton />
      ) : filtered.length === 0 ? (
        <p className="rounded-control border border-dashed border-border bg-canvas px-3 py-6 text-center text-[13px] text-ink-secondary">
          Nothing matches "{query}".
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((q) => (
            <BankQuestionRow
              key={q.id}
              q={q}
              groupLabel="WAEC Chemistry"
              alreadyAdded={alreadyAdded.has(q.id)}
              onAdd={() => onAddDraft(toDraftQuestion(q))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Shared row + helpers
// ────────────────────────────────────────────────────────────────────

function BankQuestionRow({
  q,
  groupLabel,
  alreadyAdded,
  onAdd,
}: {
  q: Question;
  groupLabel: string;
  alreadyAdded: boolean;
  onAdd: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        disabled={alreadyAdded}
        onClick={onAdd}
        className={cn(
          'group flex w-full items-start gap-3 rounded-control border border-border-subtle bg-canvas p-3 text-left transition-colors',
          alreadyAdded
            ? 'cursor-not-allowed opacity-60'
            : 'hover:border-border hover:bg-surface',
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <TypePill type={q.type} />
            <span className="text-[11px] uppercase tracking-wider text-ink-tertiary">
              · {groupLabel} · {withCount(q.marks, 'mark')}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink">
            {q.content}
          </p>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-hairline text-ink-secondary transition-colors group-hover:bg-ink group-hover:text-white">
          {alreadyAdded ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Added
            </span>
          ) : (
            <Plus size={13} strokeWidth={2} aria-hidden />
          )}
        </div>
      </button>
    </li>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-control border border-border-subtle bg-canvas px-3 focus-within:border-border focus-within:ring-2 focus-within:ring-ink/5">
      <Search size={14} strokeWidth={1.75} className="text-ink-tertiary" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-tertiary"
      />
    </label>
  );
}

function TypePill({ type }: { type: QuestionType }) {
  const map = {
    mcq: { label: 'Multiple choice', Icon: CircleDot },
    short_answer: { label: 'Short answer', Icon: AlignLeft },
    long_answer: { label: 'Long answer', Icon: FileText },
    handwritten: { label: 'Handwritten', Icon: PenLine },
  } as const;
  const m = map[type];
  return (
    <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-ink-tertiary">
      <m.Icon size={11} strokeWidth={1.75} aria-hidden />
      {m.label}
    </span>
  );
}

function BankListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-control border border-border-subtle bg-canvas p-3"
        >
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Data hook + helpers
// ────────────────────────────────────────────────────────────────────

function useBankQuestions(filter: (q: Question) => boolean) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [banksById, setBanksById] = useState<Map<string, { id: string; name: string }>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getQuestions(), getQuestionBanks()]).then(([qs, banks]) => {
      if (cancelled) return;
      setQuestions(qs.filter(filter));
      setBanksById(new Map(banks.map((b) => [b.id, b])));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { questions, banksById, loading };
}

function toDraftQuestion(q: Question): DraftQuestion {
  const id = `dq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    type: q.type,
    content: q.content,
    marks: q.marks,
    mcq_options: q.mcq_options
      ? q.mcq_options.map((o, idx) => ({
          ...o,
          id: `${id}_${String.fromCharCode(97 + idx)}`,
        }))
      : null,
    expected_answer: q.expected_answer,
    reference_image_url: q.image_url,
    rubric: null,
    saved_to_bank: false,
  };
}

// ────────────────────────────────────────────────────────────────────
// Mock AI parse output
// ────────────────────────────────────────────────────────────────────

type ParsedItem = {
  id: string;
  type: QuestionType;
  content: string;
  marks: number;
  mcq_options?: McqOption[];
  expected_answer?: string;
};

const FAKE_PARSED: ParsedItem[] = [
  {
    id: 'parsed_1',
    type: 'mcq',
    content: 'What is the SI unit of electric current?',
    marks: 1,
    mcq_options: [
      { id: 'p1_a', text: 'Volt', is_correct: false },
      { id: 'p1_b', text: 'Coulomb', is_correct: false },
      { id: 'p1_c', text: 'Ampere', is_correct: true },
      { id: 'p1_d', text: 'Ohm', is_correct: false },
    ],
  },
  {
    id: 'parsed_2',
    type: 'short_answer',
    content: "State Ohm's law and write its mathematical expression.",
    marks: 3,
    expected_answer:
      "Ohm's law states that the current flowing through a conductor is directly proportional to the potential difference across it, provided temperature and other physical conditions remain constant. V = IR.",
  },
  {
    id: 'parsed_3',
    type: 'mcq',
    content: 'Which gas is most abundant in the atmosphere?',
    marks: 1,
    mcq_options: [
      { id: 'p3_a', text: 'Oxygen (O₂)', is_correct: false },
      { id: 'p3_b', text: 'Nitrogen (N₂)', is_correct: true },
      { id: 'p3_c', text: 'Carbon dioxide (CO₂)', is_correct: false },
      { id: 'p3_d', text: 'Argon (Ar)', is_correct: false },
    ],
  },
  {
    id: 'parsed_4',
    type: 'long_answer',
    content:
      'Describe the structure of an atom. In your answer, mention the three main subatomic particles and their relative charges and masses.',
    marks: 6,
    expected_answer:
      'An atom consists of a small dense nucleus containing protons (+1 charge, mass ≈ 1) and neutrons (no charge, mass ≈ 1), surrounded by electrons (–1 charge, negligible mass) in shells around the nucleus.',
  },
  {
    id: 'parsed_5',
    type: 'mcq',
    content: 'The atomic number of sodium is',
    marks: 1,
    mcq_options: [
      { id: 'p5_a', text: '11', is_correct: true },
      { id: 'p5_b', text: '23', is_correct: false },
      { id: 'p5_c', text: '12', is_correct: false },
      { id: 'p5_d', text: '22', is_correct: false },
    ],
  },
];

function parsedItemToDraft(item: ParsedItem): DraftQuestion {
  const id = `dq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    type: item.type,
    content: item.content,
    marks: item.marks,
    mcq_options: item.mcq_options
      ? item.mcq_options.map((o, idx) => ({
          ...o,
          id: `${id}_${String.fromCharCode(97 + idx)}`,
        }))
      : null,
    expected_answer: item.expected_answer ?? null,
    reference_image_url: null,
    rubric: null,
    saved_to_bank: false,
  };
}
