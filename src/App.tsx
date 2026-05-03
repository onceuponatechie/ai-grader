import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { TeacherLayout } from '@/layouts/TeacherLayout';
import { Dashboard } from '@/pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <TeacherLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </TeacherLayout>
    </BrowserRouter>
  );
}
