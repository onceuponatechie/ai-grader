import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Library,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import type { NavItem, PageContext } from '@/types/nav';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTeacher } from '@/hooks/useTeacher';
import { cn } from '@/lib/cn';

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Exams', to: '/exams', icon: FileText },
  { label: 'Question Bank', to: '/questions', icon: Library },
  { label: 'Students', to: '/students', icon: Users },
  { label: 'Results', to: '/results', icon: BarChart3 },
];

const pageByPath: Record<string, PageContext> = {
  '/': {
    title: 'Dashboard',
  },
  '/exams': {
    title: 'Exams',
    primaryAction: { label: 'Create Exam' },
  },
  '/questions': {
    title: 'Question Bank',
    primaryAction: { label: 'Add Question' },
  },
  '/students': {
    title: 'Students',
    primaryAction: { label: 'Add Student' },
  },
  '/results': {
    title: 'Results',
  },
};

type Props = {
  children: ReactNode;
};

export function TeacherLayout({ children }: Props) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const teacher = useTeacher();

  // Close the drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const page = pageByPath[location.pathname] ??
    (location.pathname.startsWith('/exams/new')
      ? { title: 'Creating an exam' }
      : { title: 'Marka' });

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="flex">
        {/* Desktop sidebar */}
        {isDesktop && (
          <div className="sticky top-0 h-screen shrink-0">
            <Sidebar items={navItems} teacher={teacher} />
          </div>
        )}

        {/* Mobile drawer */}
        {!isDesktop && mobileOpen && (
          <MobileDrawer onClose={() => setMobileOpen(false)}>
            <Sidebar
              items={navItems}
              teacher={teacher}
              onNavigate={() => setMobileOpen(false)}
            />
          </MobileDrawer>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            page={page}
            showMenuButton={!isDesktop}
            onOpenMenu={() => setMobileOpen(true)}
          />
          <main className="flex-1">
            <div
              className={cn(
                'mx-auto w-full max-w-content px-4 py-7 sm:px-6 lg:px-10 lg:py-10',
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-full w-[260px] flex-col">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-control text-ink-secondary hover:bg-hairline"
          aria-label="Close menu"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
        {children}
      </div>
    </div>
  );
}
