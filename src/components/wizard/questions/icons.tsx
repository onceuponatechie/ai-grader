import {
  CircleDot,
  AlignLeft,
  FileText,
  PenLine,
  type LucideIcon,
} from 'lucide-react';
import type { QuestionType } from '@/types';

export const QUESTION_TYPE_META: Record<
  QuestionType,
  { label: string; description: string; icon: LucideIcon }
> = {
  mcq: {
    label: 'Multiple choice',
    description: 'Students pick one answer from a list.',
    icon: CircleDot,
  },
  short_answer: {
    label: 'Short answer',
    description: 'A sentence or two — definitions, calculations.',
    icon: AlignLeft,
  },
  long_answer: {
    label: 'Long answer',
    description: 'A paragraph or longer — explanations, derivations.',
    icon: FileText,
  },
  handwritten: {
    label: 'Handwritten upload',
    description: 'Student uploads a photo of their working.',
    icon: PenLine,
  },
};
