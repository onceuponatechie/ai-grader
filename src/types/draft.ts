import type { McqOption, QuestionType } from './index';

export type DraftQuestion = {
  id: string;
  type: QuestionType;
  content: string;
  marks: number;
  mcq_options: McqOption[] | null;
  expected_answer: string | null;
  reference_image_url: string | null;
  rubric: string | null;
  saved_to_bank: boolean;
};

export type ParsedStudent = {
  email: string;
  full_name: string;
  valid: boolean;
};

export type InviteTiming = 'now' | 'on_start';

export type DraftExam = {
  id: string;
  // Step 1
  title: string;
  subject: string;
  class_name: string;
  start_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM (24h)
  duration_value: number;
  duration_unit: 'minutes' | 'hours';
  late_join_minutes: number;
  instructions: string;
  // Step 2
  questions: DraftQuestion[];
  // Step 3
  student_emails_raw: string;
  parsed_students: ParsedStudent[];
  invite_timing: InviteTiming;
  // Meta
  created_at: string;
  updated_at: string;
};

export const SUBJECTS = [
  'Chemistry',
  'Physics',
  'Biology',
  'Mathematics',
  'Further Mathematics',
  'English Language',
  'Literature',
  'Geography',
  'Economics',
  'Government',
  'History',
  'Agricultural Science',
  'Computer Studies',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Civic Education',
] as const;

export function newDraftExam(): DraftExam {
  const now = new Date().toISOString();
  return {
    id: `draft_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    title: '',
    subject: '',
    class_name: '',
    start_date: '',
    start_time: '',
    duration_value: 60,
    duration_unit: 'minutes',
    late_join_minutes: 10,
    instructions: '',
    questions: [],
    student_emails_raw: '',
    parsed_students: [],
    invite_timing: 'on_start',
    created_at: now,
    updated_at: now,
  };
}

export function newDraftQuestion(type: QuestionType): DraftQuestion {
  const id = `dq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const base: DraftQuestion = {
    id,
    type,
    content: '',
    marks: type === 'mcq' ? 1 : 4,
    mcq_options: null,
    expected_answer: null,
    reference_image_url: null,
    rubric: null,
    saved_to_bank: false,
  };
  if (type === 'mcq') {
    base.mcq_options = [
      { id: `${id}_a`, text: '', is_correct: false },
      { id: `${id}_b`, text: '', is_correct: false },
      { id: `${id}_c`, text: '', is_correct: false },
      { id: `${id}_d`, text: '', is_correct: false },
    ];
  }
  if (type === 'short_answer' || type === 'long_answer') {
    base.expected_answer = '';
    base.marks = type === 'short_answer' ? 3 : 6;
  }
  if (type === 'handwritten') {
    base.rubric = '';
    base.expected_answer = '';
    base.marks = 5;
  }
  return base;
}
