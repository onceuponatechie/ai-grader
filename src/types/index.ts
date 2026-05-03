/**
 * Domain types for Marka.
 *
 * These are designed to mirror the shapes engineering will deliver from
 * the real backend, so the UI plugs in with minimal change. Field names
 * use snake_case to match what most Postgres / Supabase / Django shops
 * will return.
 */

export type ExamStatus =
  | 'draft'
  | 'scheduled'
  | 'live'
  | 'grading'
  | 'ready_to_publish'
  | 'published'
  | 'archived';

export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'handwritten';

export type SessionStatus =
  | 'not_started'
  | 'writing'
  | 'submitted'
  | 'auto_submitted'
  | 'needs_retake';

export type AiConfidence = 'high' | 'moderate' | 'low';

export type Exam = {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  start_time: string; // ISO
  end_time: string; // ISO
  status: ExamStatus;
  total_questions: number;
  total_students_invited: number;
  students_submitted: number;
  students_writing: number;
  scripts_graded: number;
  scripts_pending_review: number;
  created_at: string;
  published_at: string | null;
};

export type McqOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

export type Question = {
  id: string;
  exam_id: string | null;
  type: QuestionType;
  content: string;
  marks: number;
  expected_answer: string | null;
  mcq_options: McqOption[] | null;
  has_image: boolean;
  image_url: string | null;
  question_bank_id: string | null;
  saved_to_bank: boolean;
};

export type Student = {
  id: string;
  email: string;
  full_name: string;
  student_number: string | null;
};

export type ExamSession = {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string | null;
  submitted_at: string | null;
  status: SessionStatus;
  time_remaining_seconds: number | null;
  flagged_for_review: boolean;
  flag_reason: string | null;
};

export type GradedResponse = {
  id: string;
  session_id: string;
  question_id: string;
  student_answer: string | null;
  student_image_url: string | null;
  ai_score: number;
  ai_confidence: AiConfidence;
  ai_feedback: string;
  manual_score: number | null;
  needs_review: boolean;
  review_reason: string | null;
};

export type QuestionBank = {
  id: string;
  name: string;
  subject: string;
  question_count: number;
  last_used_at: string | null;
};

export type Teacher = {
  id: string;
  full_name: string;
  email: string;
  school: string;
  subject: string;
  initials: string;
};
