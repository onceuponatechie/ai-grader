import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Dashboard } from '@/pages/Dashboard';
import { DetailsStep } from '@/pages/wizard/DetailsStep';
import { QuestionsStep } from '@/pages/wizard/QuestionsStep';
import { StudentsStep } from '@/pages/wizard/StudentsStep';
import { ReviewStep } from '@/pages/wizard/ReviewStep';
import { LiveMonitoring } from '@/pages/LiveMonitoring';
import { GradingReview } from '@/pages/GradingReview';
import { GradingReviewSession } from '@/pages/GradingReviewSession';
import { PublishResults } from '@/pages/PublishResults';

export default function App() {
  return (
    <BrowserRouter>
      <TeacherLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          {/* Wizard */}
          <Route path="/exams/new" element={<Navigate to="/exams/new/details" replace />} />
          <Route path="/exams/new/details" element={<DetailsStep />} />
          <Route path="/exams/new/:id/questions" element={<QuestionsStep />} />
          <Route path="/exams/new/:id/students" element={<StudentsStep />} />
          <Route path="/exams/new/:id/review" element={<ReviewStep />} />

          {/* Exam ops */}
          <Route path="/exams/:id/live" element={<LiveMonitoring />} />
          <Route path="/exams/:id/grading" element={<GradingReview />} />
          <Route
            path="/exams/:id/grading/:sessionId"
            element={<GradingReviewSession />}
          />
          <Route path="/exams/:id/publish" element={<PublishResults />} />
        </Routes>
      </TeacherLayout>
    </BrowserRouter>
  );
}
