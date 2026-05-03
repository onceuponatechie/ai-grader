import { useEffect, useState } from 'react';
import type { Teacher } from '@/types';
import { getTeacher } from '@/lib/api';

export function useTeacher(): Teacher | null {
  const [teacher, setTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTeacher().then((t) => {
      if (!cancelled) setTeacher(t);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return teacher;
}
