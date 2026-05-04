import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { UploadCloud, FileSpreadsheet, AlertCircle, Check } from 'lucide-react';
import type { ParsedStudent } from '@/types/draft';
import { useDraftExam } from '@/hooks/useDraftExam';
import { parseEmailPaste } from '@/lib/email-parse';
import { furthestStep } from '@/lib/wizard';
import { withCount } from '@/lib/format';
import {
  WizardShell,
  WizardFooter,
} from '@/components/wizard/WizardShell';
import { Toggle } from '@/components/forms';
import { cn } from '@/lib/cn';

type Tab = 'paste' | 'upload';

export function StudentsStep() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, update } = useDraftExam(params.id);

  if (params.id && params.id !== draft.id) {
    return <Navigate to={`/exams/new/${draft.id}/students`} replace />;
  }

  const [tab, setTab] = useState<Tab>('paste');

  const valid = draft.parsed_students.filter((s) => s.valid);
  const invalid = draft.parsed_students.filter((s) => !s.valid);
  const validCount = valid.length;

  const continueDisabled =
    validCount === 0
      ? 'Add at least one student to continue.'
      : invalid.length > 0
        ? `Fix or remove the ${withCount(invalid.length, 'unrecognised email')} below first.`
        : null;

  function setRaw(raw: string) {
    update({
      student_emails_raw: raw,
      parsed_students: parseEmailPaste(raw),
    });
  }

  function fakeUpload(name: string, count: number) {
    const fake = generateFakeRoster(count);
    update({
      student_emails_raw: fake.map((s) => s.email).join('\n'),
      parsed_students: fake,
    });
    setTab('paste'); // fall back to preview
    void name;
  }

  function dropInvalid() {
    update({ parsed_students: valid });
  }

  return (
    <WizardShell
      current="students"
      draftId={draft.id}
      furthestReached={furthestStep(draft)}
    >
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Who will take this exam?
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Add the students you want to invite. Each will get a unique link
          they can use on any device.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex border-b border-border-subtle">
        <TabButton
          label="Paste emails"
          active={tab === 'paste'}
          onClick={() => setTab('paste')}
        />
        <TabButton
          label="Upload class list"
          active={tab === 'upload'}
          onClick={() => setTab('upload')}
        />
      </div>

      <div className="mt-6">
        {tab === 'paste' ? (
          <PasteTab raw={draft.student_emails_raw} onChange={setRaw} />
        ) : (
          <UploadTab onUpload={fakeUpload} />
        )}
      </div>

      {/* Live preview */}
      {draft.parsed_students.length > 0 && (
        <Preview
          parsed={draft.parsed_students}
          onDropInvalid={dropInvalid}
        />
      )}

      {/* Settings: invitation timing */}
      <section className="mt-10 rounded-card border border-border-subtle bg-surface p-5 shadow-soft">
        <h2 className="text-[14px] font-semibold text-ink">
          When should we send invitations?
        </h2>
        <div className="mt-4 space-y-3">
          <RadioOption
            id="timing-on-start"
            checked={draft.invite_timing === 'on_start'}
            onSelect={() => update({ invite_timing: 'on_start' })}
            title="Send when the exam goes live"
            description="Recommended. Students get the link at the start time so they don't open it early by mistake."
          />
          <RadioOption
            id="timing-now"
            checked={draft.invite_timing === 'now'}
            onSelect={() => update({ invite_timing: 'now' })}
            title="Send invitations now"
            description="Useful if you want to give students notice. The link only becomes active at the start time."
          />
        </div>

        <div className="mt-5 rounded-control bg-canvas px-4 py-3 text-[12px] leading-snug text-ink-secondary">
          Each student will get a unique magic link. Links expire after the
          exam ends. If they lose theirs, they can request a new one from
          the same email — no account required.
        </div>
      </section>

      <WizardFooter
        backHref={`/exams/new/${draft.id}/questions`}
        continueLabel="Continue to review"
        onContinue={() => navigate(`/exams/new/${draft.id}/review`)}
        disabledReason={continueDisabled}
        leftAnnotation={
          validCount === 0
            ? null
            : `${withCount(validCount, 'student')} will be invited`
        }
      />
    </WizardShell>
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
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors',
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-secondary hover:text-ink',
      )}
    >
      {label}
    </button>
  );
}

function PasteTab({
  raw,
  onChange,
}: {
  raw: string;
  onChange: (s: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="emails-paste"
        className="text-[13px] font-medium text-ink"
      >
        Paste student emails
      </label>
      <p className="mt-1 text-[12px] text-ink-secondary">
        One per line, or separated by commas. We'll do our best to figure out
        each student's name from their email.
      </p>
      <textarea
        id="emails-paste"
        rows={8}
        value={raw}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          'ada.nwosu@school.ng\nsegun.adetola@school.ng\nfatima.bello@school.ng'
        }
        className="mt-3 w-full resize-y rounded-control border border-border-subtle bg-surface px-3 py-2.5 font-mono text-[13px] leading-relaxed text-ink outline-none placeholder:text-ink-tertiary focus:border-border focus:ring-2 focus:ring-ink/5"
      />
    </div>
  );
}

function UploadTab({
  onUpload,
}: {
  onUpload: (name: string, count: number) => void;
}) {
  return (
    <div>
      <div
        onClick={() => onUpload('SS3 Chemistry roster.csv', 84)}
        className="flex cursor-pointer flex-col items-center rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-ink-secondary hover:bg-canvas"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-ink shadow-soft">
          <UploadCloud size={20} strokeWidth={1.75} />
        </div>
        <h3 className="mt-4 text-[14px] font-semibold text-ink">
          Drop a class list here, or click to upload
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-snug text-ink-secondary">
          We'll read your file and pull out each student's email and name.
          You can review the list before sending invitations.
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-ink-tertiary">
          .csv or .xlsx
        </p>
      </div>
      <div className="mt-3 flex justify-center">
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-secondary hover:text-ink"
          onClick={(e) => e.preventDefault()}
        >
          <FileSpreadsheet size={12} strokeWidth={1.75} />
          Need a template? Download the sample
        </a>
      </div>
    </div>
  );
}

function Preview({
  parsed,
  onDropInvalid,
}: {
  parsed: ParsedStudent[];
  onDropInvalid: () => void;
}) {
  const valid = parsed.filter((s) => s.valid);
  const invalid = parsed.filter((s) => !s.valid);

  return (
    <section className="mt-6 rounded-card border border-border-subtle bg-surface shadow-soft">
      <header className="flex items-baseline justify-between border-b border-border-subtle px-5 py-3">
        <h3 className="text-[14px] font-semibold text-ink">
          {withCount(valid.length, 'student')} will be invited
        </h3>
        {invalid.length > 0 && (
          <button
            type="button"
            onClick={onDropInvalid}
            className="text-[12px] text-ink-secondary hover:text-ink"
          >
            Remove {withCount(invalid.length, 'unrecognised email')}
          </button>
        )}
      </header>

      {invalid.length > 0 && (
        <div className="border-b border-border-subtle bg-[#FBE8E4]/40 px-5 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={14}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-problem"
              aria-hidden
            />
            <div className="text-[13px] leading-snug text-ink">
              We couldn't read{' '}
              <strong>
                {invalid.length === 1
                  ? '1 entry'
                  : `${invalid.length} entries`}
              </strong>
              . Fix the typo or remove them below to continue.
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {invalid.map((s, i) => (
              <li
                key={`${s.email}-${i}`}
                className="rounded-control bg-surface px-2 py-1 font-mono text-[12px] text-problem"
              >
                {s.email || '(empty)'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="max-h-72 divide-y divide-border-subtle overflow-y-auto">
        {valid.map((s) => (
          <li
            key={s.email}
            className="flex items-center gap-3 px-5 py-2.5"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
              <Check size={13} strokeWidth={2} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink">
                {s.full_name || '(no name)'}
              </div>
              <div className="truncate text-[12px] text-ink-tertiary">
                {s.email}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RadioOption({
  id,
  checked,
  onSelect,
  title,
  description,
}: {
  id: string;
  checked: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-control border px-4 py-3 text-left transition-colors',
        checked
          ? 'border-ink bg-canvas'
          : 'border-border-subtle bg-surface hover:bg-canvas',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          checked ? 'border-ink' : 'border-border',
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
      </span>
      <span>
        <span className="block text-[13px] font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-secondary">
          {description}
        </span>
      </span>
    </button>
  );
}

// Used by Toggle import to keep TS happy if not referenced — Toggle is exported
// from forms.tsx and imported above for parity with other steps.
void Toggle;

// ────────────────────────────────────────────────────────────────────
// Mock generator for upload tab
// ────────────────────────────────────────────────────────────────────

function generateFakeRoster(count: number): ParsedStudent[] {
  const names: { first: string; last: string }[] = [
    { first: 'Adebola', last: 'Ogundimu' },
    { first: 'Chinedu', last: 'Okafor' },
    { first: 'Oluwaseun', last: 'Adeyemi' },
    { first: 'Ngozi', last: 'Eze' },
    { first: 'Tunde', last: 'Bakare' },
    { first: 'Amara', last: 'Nwankwo' },
    { first: 'Kemi', last: 'Adelaja' },
    { first: 'Emeka', last: 'Iwu' },
    { first: 'Damilola', last: 'Fashola' },
    { first: 'Ifeanyi', last: 'Obi' },
    { first: 'Yemi', last: 'Alabi' },
    { first: 'Chioma', last: 'Uchendu' },
    { first: 'Tobi', last: 'Ogunleye' },
    { first: 'Sade', last: 'Olatunji' },
    { first: 'Nnamdi', last: 'Eze' },
    { first: 'Bola', last: 'Aremu' },
    { first: 'Femi', last: 'Ojo' },
    { first: 'Obinna', last: 'Okeke' },
    { first: 'Fatima', last: 'Bello' },
    { first: 'Samuel', last: 'Iroegbu' },
  ];
  const roster: ParsedStudent[] = [];
  for (let i = 0; i < count; i++) {
    const n = names[i % names.length];
    const suffix = i < names.length ? '' : String(Math.floor(i / names.length) + 1);
    const email = `${n.first.toLowerCase()}.${n.last.toLowerCase()}${suffix}@school.ng`;
    roster.push({
      email,
      full_name: `${n.first} ${n.last}`,
      valid: true,
    });
  }
  return roster;
}
