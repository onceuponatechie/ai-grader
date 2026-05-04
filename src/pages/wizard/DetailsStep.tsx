import { useNavigate } from 'react-router-dom';
import { useDraftExam } from '@/hooks/useDraftExam';
import { SUBJECTS } from '@/types/draft';
import {
  detailsAreComplete,
  detailsMissingMessage,
  furthestStep,
} from '@/lib/wizard';
import {
  WizardShell,
  WizardFooter,
} from '@/components/wizard/WizardShell';
import {
  Field,
  Input,
  Select,
  Textarea,
} from '@/components/forms';

export function DetailsStep() {
  const { draft, update } = useDraftExam(undefined);
  const navigate = useNavigate();

  const ready = detailsAreComplete(draft);
  const reason = ready ? null : detailsMissingMessage(draft);

  function onContinue() {
    if (!ready) return;
    navigate(`/exams/new/${draft.id}/questions`);
  }

  return (
    <WizardShell
      current="details"
      draftId={draft.id}
      furthestReached={furthestStep(draft)}
    >
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink">
          Create a new exam
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Set the basics first. You can always come back and adjust anything
          before you publish.
        </p>
      </div>

      {/* Section: What is this exam? */}
      <section className="mt-10">
        <SectionHeader
          eyebrow="Section 1"
          title="What is this exam?"
        />
        <div className="mt-5 space-y-5">
          <Field label="Exam title" htmlFor="exam-title">
            <Input
              id="exam-title"
              value={draft.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. SS3 Chemistry Mid-Term"
              autoComplete="off"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Subject" htmlFor="exam-subject">
              <Select
                id="exam-subject"
                value={draft.subject}
                onChange={(e) => update({ subject: e.target.value })}
              >
                <option value="" disabled>
                  Choose a subject
                </option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Class" htmlFor="exam-class">
              <Input
                id="exam-class"
                value={draft.class_name}
                onChange={(e) => update({ class_name: e.target.value })}
                placeholder="e.g. SS3, JSS2"
                autoComplete="off"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Section: When */}
      <section className="mt-10">
        <SectionHeader eyebrow="Section 2" title="When will students take it?" />
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Start date" htmlFor="exam-date">
              <Input
                id="exam-date"
                type="date"
                value={draft.start_date}
                onChange={(e) => update({ start_date: e.target.value })}
              />
            </Field>
            <Field label="Start time" htmlFor="exam-time">
              <Input
                id="exam-time"
                type="time"
                value={draft.start_time}
                onChange={(e) => update({ start_time: e.target.value })}
              />
            </Field>
          </div>

          <Field
            label="Duration"
            helper="How long do students get to write?"
          >
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Input
                type="number"
                min={1}
                value={draft.duration_value || ''}
                onChange={(e) =>
                  update({ duration_value: Number(e.target.value) || 0 })
                }
              />
              <Select
                value={draft.duration_unit}
                onChange={(e) =>
                  update({
                    duration_unit: e.target.value as 'minutes' | 'hours',
                  })
                }
                className="min-w-[120px]"
              >
                <option value="minutes">minutes</option>
                <option value="hours">hours</option>
              </Select>
            </div>
          </Field>

          <Field
            label="Late join window"
            htmlFor="late-join"
            helper="If a student's network drops at the start, they can still join within this window."
          >
            <div className="flex items-center gap-3">
              <Input
                id="late-join"
                type="number"
                min={0}
                max={60}
                className="w-24"
                value={draft.late_join_minutes}
                onChange={(e) =>
                  update({ late_join_minutes: Number(e.target.value) || 0 })
                }
              />
              <span className="text-[13px] text-ink-secondary">
                minutes after start
              </span>
            </div>
          </Field>
        </div>
      </section>

      {/* Section: Instructions */}
      <section className="mt-10">
        <SectionHeader
          eyebrow="Section 3"
          title="Instructions for students"
          optional
        />
        <div className="mt-5">
          <Field
            label="Anything they should know?"
            htmlFor="exam-instructions"
            optional
          >
            <Textarea
              id="exam-instructions"
              rows={5}
              value={draft.instructions}
              onChange={(e) => update({ instructions: e.target.value })}
              placeholder="Tell students what to bring, how the exam works, anything specific to this paper."
            />
          </Field>
        </div>
      </section>

      <WizardFooter
        backHref="/"
        continueLabel="Continue to questions"
        onContinue={onContinue}
        disabledReason={reason}
      />
    </WizardShell>
  );
}

function SectionHeader({
  eyebrow,
  title,
  optional,
}: {
  eyebrow: string;
  title: string;
  optional?: boolean;
}) {
  return (
    <div>
      <p className="label-caps">{eyebrow}</p>
      <h2 className="mt-1.5 text-[18px] font-semibold tracking-tight text-ink">
        {title}
        {optional && (
          <span className="ml-2 text-[13px] font-normal text-ink-tertiary">
            (optional)
          </span>
        )}
      </h2>
    </div>
  );
}
