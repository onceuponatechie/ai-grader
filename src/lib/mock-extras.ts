/**
 * Synthetic data generators that pad the hand-written mock so screens
 * which need full rosters (live monitoring, grading review, publish)
 * have realistic numbers without us writing 200 lines per exam.
 *
 * Everything is deterministic by seed so reloads don't shuffle the data.
 */

import type {
  Exam,
  ExamSession,
  GradedResponse,
  Student,
} from '@/types';
import { exams } from '@/mock-data/exams';
import { sessions as realSessions } from '@/mock-data/sessions';
import { students as realStudents } from '@/mock-data/students';
import { gradedResponses as realResponses } from '@/mock-data/graded-responses';
import { questions } from '@/mock-data/questions';

const FIRST_NAMES = [
  'Adaeze', 'Adamu', 'Aisha', 'Akin', 'Anuoluwa', 'Babatunde', 'Bayo',
  'Blessing', 'Chiamaka', 'Chidi', 'Chizoba', 'Daniel', 'David', 'Debby',
  'Dotun', 'Ebere', 'Efe', 'Ejiro', 'Emeka', 'Faith', 'Folake', 'Funmi',
  'Gbenga', 'Gloria', 'Halima', 'Ibrahim', 'Ifeoma', 'Ijeoma', 'Ikenna',
  'Jaiye', 'Jelili', 'Joshua', 'Kaduna', 'Kelechi', 'Kunle', 'Lara',
  'Liam', 'Lola', 'Lukman', 'Mariam', 'Maryam', 'Michael', 'Nana',
  'Ngozi', 'Nkechi', 'Olamide', 'Oluchi', 'Patience', 'Peter', 'Ramota',
  'Risikat', 'Rotimi', 'Saheed', 'Sarah', 'Seun', 'Stephen', 'Suleiman',
  'Tayo', 'Temi', 'Tunji', 'Uche', 'Uju', 'Usman', 'Victoria', 'Wale',
  'Yetunde', 'Zainab',
];

const LAST_NAMES = [
  'Abiodun', 'Adebayo', 'Adediran', 'Adekunle', 'Aderemi', 'Adesina',
  'Afolabi', 'Agbaje', 'Ajibola', 'Akande', 'Akinola', 'Alabi', 'Alimi',
  'Aluko', 'Amadi', 'Aminu', 'Anyanwu', 'Aremu', 'Ayodele', 'Babalola',
  'Bakare', 'Balogun', 'Chukwu', 'Daramola', 'Dauda', 'Egbuna',
  'Ekanem', 'Eleke', 'Eze', 'Ezeani', 'Fagbemi', 'Falade', 'Garba',
  'Hassan', 'Ibrahim', 'Idowu', 'Igwe', 'Ihekweme', 'Ilori', 'Iroegbu',
  'Jegede', 'Jimoh', 'Kalu', 'Kareem', 'Lawal', 'Madu', 'Musa',
  'Nnaji', 'Nwankwo', 'Nwosu', 'Obasanjo', 'Obi', 'Odunsi', 'Ogbonna',
  'Ogunleye', 'Ojo', 'Okafor', 'Okeke', 'Okonkwo', 'Olatunji',
  'Olawale', 'Omoniyi', 'Onuoha', 'Orji', 'Osagie', 'Osho', 'Owusu',
  'Sadiq', 'Salami', 'Sani', 'Shehu', 'Soyinka', 'Sule', 'Suleiman',
  'Tijani', 'Uchendu', 'Udeh', 'Umar', 'Uwa', 'Yakubu', 'Yusuf',
];

// Deterministic LCG so generated data is stable across reloads.
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ────────────────────────────────────────────────────────────────────
// Generation
// ────────────────────────────────────────────────────────────────────

type Generated = {
  students: Student[];
  sessions: ExamSession[];
  responses: GradedResponse[];
};

function emailFor(first: string, last: string, n: number): string {
  return `${first.toLowerCase()}.${last.toLowerCase()}${n > 1 ? n : ''}@school.ng`;
}

const FLAG_REASONS = [
  "AI couldn't read 1 handwritten answer clearly.",
  'AI was unsure about 1 partial-credit answer — please confirm.',
  "Student's working is hard to read on question 6.",
  'AI flagged a low-confidence score on question 3.',
  "AI couldn't tell if the equation is balanced — please confirm.",
  "Student's handwriting on question 6 is unclear.",
  "AI's confidence was low on questions 5 and 7.",
  'AI detected partial credit on question 8 — please confirm the score.',
  "Student answered question 4 differently from the expected pattern.",
  "AI couldn't read the structural diagram on question 8.",
];

function generateForLiveExam(exam: Exam): Generated {
  const rng = seeded(hashString(exam.id));
  const targetTotal = exam.total_students_invited;
  const haveSessions = realSessions.filter((s) => s.exam_id === exam.id);
  const need = Math.max(0, targetTotal - haveSessions.length);

  // Distribute remaining writing/submitted/not-started in proportion
  // to the exam's headline numbers, minus what we've already written.
  const wrotenWriting = haveSessions.filter((s) => s.status === 'writing').length;
  const wrotenSubmitted = haveSessions.filter(
    (s) => s.status === 'submitted',
  ).length;
  const wrotenRetake = haveSessions.filter(
    (s) => s.status === 'needs_retake',
  ).length;
  // not_started = invited - writing - submitted - retake (in real data)
  const wrotenNotStarted = haveSessions.filter(
    (s) => s.status === 'not_started',
  ).length;

  const targetWriting = Math.max(0, exam.students_writing - wrotenWriting);
  const targetSubmitted = Math.max(0, exam.students_submitted - wrotenSubmitted);
  const targetNotStarted = Math.max(
    0,
    exam.total_students_invited
      - exam.students_writing
      - exam.students_submitted
      - wrotenRetake
      - wrotenNotStarted,
  );

  const wantedStatuses: ('writing' | 'submitted' | 'not_started')[] = [];
  for (let i = 0; i < targetWriting; i++) wantedStatuses.push('writing');
  for (let i = 0; i < targetSubmitted; i++) wantedStatuses.push('submitted');
  for (let i = 0; i < targetNotStarted; i++) wantedStatuses.push('not_started');
  // If we've over-counted (rounding), pad with 'writing'.
  while (wantedStatuses.length < need) wantedStatuses.push('writing');
  // If under-counted, trim.
  wantedStatuses.length = need;

  const students: Student[] = [];
  const sessions: ExamSession[] = [];

  const startMs = new Date(exam.start_time).getTime();
  const endMs = new Date(exam.end_time).getTime();

  for (let i = 0; i < need; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const sid = `gstd_${exam.id}_${i.toString(36)}`;
    const email = emailFor(first, last, 1 + (i % 3));
    students.push({
      id: sid,
      email,
      full_name: `${first} ${last}`,
      student_number: `GCL/SS3/2024/${(i + 100).toString().padStart(3, '0')}`,
    });

    const status = wantedStatuses[i];
    const id = `gses_${exam.id}_${i.toString(36)}`;
    if (status === 'writing') {
      sessions.push({
        id,
        exam_id: exam.id,
        student_id: sid,
        started_at: new Date(startMs + Math.floor(rng() * 240_000)).toISOString(),
        submitted_at: null,
        status: 'writing',
        time_remaining_seconds: 2820 + Math.floor(rng() * 60) - 30,
        flagged_for_review: false,
        flag_reason: null,
      });
    } else if (status === 'submitted') {
      const sub = startMs + (35 + Math.floor(rng() * 40)) * 60_000;
      sessions.push({
        id,
        exam_id: exam.id,
        student_id: sid,
        started_at: new Date(startMs + Math.floor(rng() * 180_000)).toISOString(),
        submitted_at: new Date(Math.min(endMs, sub)).toISOString(),
        status: 'submitted',
        time_remaining_seconds: null,
        flagged_for_review: false,
        flag_reason: null,
      });
    } else {
      sessions.push({
        id,
        exam_id: exam.id,
        student_id: sid,
        started_at: null,
        submitted_at: null,
        status: 'not_started',
        time_remaining_seconds: null,
        flagged_for_review: false,
        flag_reason: null,
      });
    }
  }

  return { students, sessions, responses: [] };
}

function generateForGradingExam(exam: Exam): Generated {
  const rng = seeded(hashString(exam.id));
  const need = Math.max(0, exam.students_submitted - realSessions.filter(
    (s) => s.exam_id === exam.id && (s.status === 'submitted' || s.status === 'auto_submitted'),
  ).length);

  // We need (exam.scripts_pending_review - already-flagged-real) more flagged sessions.
  const realFlaggedCount = realResponses.filter((r) => {
    const ses = realSessions.find((s) => s.id === r.session_id);
    return ses?.exam_id === exam.id && r.needs_review;
  }).length;
  // Number of REAL sessions with at least one flagged response:
  const realFlaggedSessionIds = new Set(
    realResponses
      .filter((r) => r.needs_review)
      .map((r) => r.session_id)
      .filter((id) => {
        const ses = realSessions.find((s) => s.id === id);
        return ses?.exam_id === exam.id;
      }),
  );
  const flaggedSessionsNeeded = Math.max(
    0,
    exam.scripts_pending_review - realFlaggedSessionIds.size,
  );
  void realFlaggedCount;

  const students: Student[] = [];
  const sessions: ExamSession[] = [];
  const responses: GradedResponse[] = [];

  const examQuestions = questions.filter((q) => q.exam_id === exam.id);
  const totalMarks = examQuestions.reduce((s, q) => s + q.marks, 0);

  const startMs = new Date(exam.start_time).getTime();
  const endMs = new Date(exam.end_time).getTime();

  for (let i = 0; i < need; i++) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const sid = `gstd_${exam.id}_${i.toString(36)}`;
    const ssesId = `gses_${exam.id}_${i.toString(36)}`;
    students.push({
      id: sid,
      email: emailFor(first, last, 1 + (i % 5)),
      full_name: `${first} ${last}`,
      student_number: `GCL/SS2/2024/${(i + 30).toString().padStart(3, '0')}`,
    });

    const submittedEarly = rng() < 0.85;
    const subTime = submittedEarly
      ? startMs + (25 + Math.floor(rng() * 20)) * 60_000
      : endMs;

    const flagged = i < flaggedSessionsNeeded;
    sessions.push({
      id: ssesId,
      exam_id: exam.id,
      student_id: sid,
      started_at: new Date(startMs + Math.floor(rng() * 120_000)).toISOString(),
      submitted_at: new Date(subTime).toISOString(),
      status: submittedEarly ? 'submitted' : 'auto_submitted',
      time_remaining_seconds: submittedEarly ? null : 0,
      flagged_for_review: false,
      flag_reason: submittedEarly
        ? null
        : 'Time ran out before student submitted. Saved answers were submitted automatically.',
    });

    // Generate responses. Each question gets a deterministic AI score based
    // on a per-student baseline ability so the distribution feels real.
    const ability = 0.5 + rng() * 0.4; // 0.5–0.9 baseline correctness rate
    examQuestions.forEach((q, qi) => {
      const flagThis = flagged && (qi === Math.floor(rng() * examQuestions.length));
      const correctness = Math.min(1, ability + (rng() - 0.5) * 0.3);
      const earned = Math.round(q.marks * correctness * 10) / 10;
      const integerEarned = Math.min(q.marks, Math.max(0, Math.round(earned)));
      const reason = flagThis
        ? FLAG_REASONS[Math.floor(rng() * FLAG_REASONS.length)]
        : null;
      responses.push({
        id: `gresp_${ssesId}_${q.id}`,
        session_id: ssesId,
        question_id: q.id,
        student_answer:
          q.type === 'handwritten' ? null : syntheticStudentAnswer(q.type, integerEarned, q.marks),
        student_image_url:
          q.type === 'handwritten' ? `/mock-images/handwritten/${ssesId}_${q.id}.jpg` : null,
        ai_score: integerEarned,
        ai_confidence: flagThis ? 'low' : correctness > 0.8 ? 'high' : 'moderate',
        ai_feedback: aiFeedback(integerEarned, q.marks),
        manual_score: null,
        needs_review: flagThis,
        review_reason: reason,
      });
    });
  }

  void totalMarks;
  return { students, sessions, responses };
}

function syntheticStudentAnswer(
  type: 'mcq' | 'short_answer' | 'long_answer' | 'handwritten',
  earned: number,
  total: number,
): string {
  if (type === 'mcq') {
    return earned === total ? 'Selected correct option.' : 'Selected an incorrect option.';
  }
  if (type === 'short_answer') {
    return earned === total
      ? 'Student gave a full, correct answer.'
      : earned > 0
        ? 'Student gave a partial answer covering some key points.'
        : 'Answer left blank or did not address the question.';
  }
  // long_answer
  return earned === total
    ? "Student's answer covered all expected points clearly."
    : earned > 0
      ? "Student's answer addresses the topic but misses some required points."
      : 'Answer is largely off-topic or incomplete.';
}

function aiFeedback(earned: number, total: number): string {
  if (earned === total) return 'Awarded full marks.';
  if (earned === 0) return 'No marks awarded — answer did not match the expected response.';
  return `Awarded ${earned} of ${total}. Some required points are missing.`;
}

// ────────────────────────────────────────────────────────────────────
// Module-level cache
// ────────────────────────────────────────────────────────────────────

let _allSessions: ExamSession[] | null = null;
let _allStudents: Student[] | null = null;
let _allResponses: GradedResponse[] | null = null;

function buildAll(): void {
  if (_allSessions !== null) return;
  const sessionsAcc: ExamSession[] = [...realSessions];
  const studentsAcc: Student[] = [...realStudents];
  const responsesAcc: GradedResponse[] = [...realResponses];

  for (const exam of exams) {
    if (exam.status === 'live') {
      const g = generateForLiveExam(exam);
      sessionsAcc.push(...g.sessions);
      studentsAcc.push(...g.students);
      responsesAcc.push(...g.responses);
    } else if (exam.status === 'grading') {
      const g = generateForGradingExam(exam);
      sessionsAcc.push(...g.sessions);
      studentsAcc.push(...g.students);
      responsesAcc.push(...g.responses);
    }
  }

  _allSessions = sessionsAcc;
  _allStudents = studentsAcc;
  _allResponses = responsesAcc;
}

export function getAllSessions(): ExamSession[] {
  buildAll();
  return _allSessions!;
}

export function getAllStudents(): Student[] {
  buildAll();
  return _allStudents!;
}

export function getAllResponses(): GradedResponse[] {
  buildAll();
  return _allResponses!;
}
