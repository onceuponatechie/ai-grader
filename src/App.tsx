import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Dashboard } from '@/pages/Dashboard';
import { DetailsStep } from '@/pages/wizard/DetailsStep';
import { QuestionsStep } from '@/pages/wizard/QuestionsStep';
import { StudentsStep } from '@/pages/wizard/StudentsStep';
import { ReviewStep } from '@/pages/wizard/ReviewStep';

export default function App() {
  return (
    <BrowserRouter>
      <TeacherLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/exams/new" element={<Navigate to="/exams/new/details" replace />} />
          <Route path="/exams/new/details" element={<DetailsStep />} />
          <Route path="/exams/new/:id/questions" element={<QuestionsStep />} />
          <Route path="/exams/new/:id/students" element={<StudentsStep />} />
          <Route path="/exams/new/:id/review" element={<ReviewStep />} />
        </Routes>
      </TeacherLayout>
    </BrowserRouter>
  );
}
