import { AlertCircle, CheckCircle2, ImageIcon } from 'lucide-react';
import type { GradedResponse, Question } from '@/types';
import { Field, Textarea } from '@/components/forms';
import { cn } from '@/lib/cn';

type Props = {
  index: number;
  total: number;
  question: Question;
  response: GradedResponse;
  onScoreChange: (score: number | null) => void;
  onFeedbackChange: (feedback: string) => void;
  feedback: string;
  override: number | null;
};

export function ResponseReview({
  index,
  total,
  question,
  response,
  onScoreChange,
  onFeedbackChange,
  feedback,
  override,
}: Props) {
  const effective = override ?? response.ai_score;
  const flagged = response.needs_review;

  return (
    <article
      className={cn(
        'rounded-card border bg-surface p-6 shadow-soft transition-shadow',
        flagged ? 'border-attention/50' : 'border-border-subtle',
      )}
    >
      {/* Eyebrow */}
      <div className="flex items-baseline justify-between">
        <p className="label-caps">
          Question {index + 1} of {total}
          <span className="ml-2 text-ink-tertiary normal-case tracking-normal text-[12px]">
            · {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </p>
        {flagged ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBF1DE] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#A66D11]">
            <AlertCircle size={11} strokeWidth={2} />
            Needs your eyes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-positive">
            <CheckCircle2 size={11} strokeWidth={2} />
            AI confident
          </span>
        )}
      </div>

      {/* Question text */}
      <h3 className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        {question.content}
      </h3>

      {/* Student answer */}
      <Section heading="Student's answer">
        {response.student_image_url ? (
          <div className="rounded-control border border-border-subtle bg-canvas">
            <div className="flex aspect-[3/2] items-center justify-center text-ink-tertiary">
              <div className="text-center">
                <ImageIcon size={24} strokeWidth={1.5} className="mx-auto" />
                <p className="mt-2 text-[12px]">Handwritten upload preview</p>
                <p className="mt-1 font-mono text-[11px] text-ink-tertiary/70">
                  {response.student_image_url}
                </p>
              </div>
            </div>
          </div>
        ) : response.student_answer ? (
          <p className="whitespace-pre-wrap rounded-control border border-border-subtle bg-canvas px-4 py-3 text-[14px] leading-relaxed text-ink">
            {response.student_answer}
          </p>
        ) : (
          <p className="rounded-control border border-dashed border-border bg-canvas px-4 py-3 text-[13px] italic text-ink-tertiary">
            No answer submitted.
          </p>
        )}
      </Section>

      {/* AI review */}
      <Section heading="Marka's review">
        <div className="rounded-control border border-border-subtle bg-canvas px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium text-ink">
              Awarded {response.ai_score} / {question.marks}
            </span>
            <span className="label-caps text-ink-tertiary">
              · confidence {response.ai_confidence}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
            {response.ai_feedback}
          </p>
          {flagged && response.review_reason && (
            <div className="mt-3 flex items-start gap-2 rounded-control bg-[#FBF1DE]/60 px-3 py-2">
              <AlertCircle
                size={13}
                strokeWidth={1.75}
                className="mt-0.5 shrink-0 text-attention"
                aria-hidden
              />
              <p className="text-[12px] leading-snug text-ink">
                {response.review_reason}
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Override + feedback */}
      <Section heading="Your decision">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[160px_1fr] sm:items-start">
          <Field label="Final score" htmlFor={`override-${response.id}`}>
            <div className="flex items-center gap-2">
              <input
                id={`override-${response.id}`}
                type="number"
                min={0}
                max={question.marks}
                value={effective}
                onChange={(e) => {
                  const v = e.target.value === '' ? null : Number(e.target.value);
                  onScoreChange(v);
                }}
                className="h-10 w-20 rounded-control border border-border-subtle bg-surface px-3 text-center text-[14px] font-medium tabular-nums text-ink outline-none focus:border-border focus:ring-2 focus:ring-ink/5"
              />
              <span className="text-[14px] text-ink-tertiary">
                / {question.marks}
              </span>
            </div>
            {override !== null && override !== response.ai_score && (
              <p className="mt-2 text-[12px] text-ink-secondary">
                You changed this from {response.ai_score}.
              </p>
            )}
          </Field>
          <Field
            label="Feedback for student"
            htmlFor={`feedback-${response.id}`}
            optional
            helper="Short notes the student will see alongside their score."
          >
            <Textarea
              id={`feedback-${response.id}`}
              rows={3}
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder="e.g. Good attempt — remember to balance both sides of the equation."
            />
          </Field>
        </div>
      </Section>
    </article>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-border-subtle pt-5">
      <p className="label-caps">{heading}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}
