/**
 * Mock API. Mirrors the shape of the real backend so swapping to fetch
 * is mechanical: rename body, replace `delay` + array filter with the
 * actual request, keep the same return type.
 *
 * Each function awaits a short delay so the UI can show real loading
 * states (skeletons, spinners) during development.
 */

import type {
  Exam,
  ExamSession,
  GradedResponse,
  Question,
  QuestionBank,
  Student,
  Teacher,
} from '@/types';
import { exams } from '@/mock-data/exams';
import { questions } from '@/mock-data/questions';
import { questionBanks } from '@/mock-data/question-banks';
import { sessions } from '@/mock-data/sessions';
import { gradedResponses } from '@/mock-data/graded-responses';
import { students } from '@/mock-data/students';
import { teacher } from '@/mock-data/teacher';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Random delay within a small range so screens don't feel mechanical.
function jitter(min = 220, max = 480): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getTeacher(): Promise<Teacher> {
  await delay(jitter(120, 220));
  return teacher;
}

export async function getExams(): Promise<Exam[]> {
  await delay(jitter());
  return exams;
}

export async function getExam(id: string): Promise<Exam | null> {
  await delay(jitter());
  return exams.find((e) => e.id === id) ?? null;
}

export async function getQuestions(examId?: string): Promise<Question[]> {
  await delay(jitter());
  if (!examId) return questions;
  return questions.filter((q) => q.exam_id === examId);
}

export async function getQuestionBanks(): Promise<QuestionBank[]> {
  await delay(jitter());
  return questionBanks;
}

export async function getQuestionsForBank(bankId: string): Promise<Question[]> {
  await delay(jitter());
  return questions.filter((q) => q.question_bank_id === bankId);
}

export async function getSessions(examId: string): Promise<ExamSession[]> {
  await delay(jitter());
  return sessions.filter((s) => s.exam_id === examId);
}

export async function getGradedResponses(
  sessionId: string,
): Promise<GradedResponse[]> {
  await delay(jitter());
  return gradedResponses.filter((r) => r.session_id === sessionId);
}

export async function getStudents(): Promise<Student[]> {
  await delay(jitter());
  return students;
}

export async function getStudent(id: string): Promise<Student | null> {
  await delay(jitter(120, 220));
  return students.find((s) => s.id === id) ?? null;
}
