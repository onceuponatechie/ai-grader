import { useEffect, useState } from 'react';
import type { Exam } from '@/types';
import { getExams } from '@/lib/api';

export function useExams(): { exams: Exam[] | null; loading: boolean } {
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExams()
      .then((data) => {
        if (!cancelled) {
          setExams(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { exams, loading };
}
