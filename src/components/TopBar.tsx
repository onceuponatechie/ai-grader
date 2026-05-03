import { Menu, Search } from 'lucide-react';
import type { PageContext } from '@/types/nav';

type Props = {
  page: PageContext;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
};

export function TopBar({ page, onOpenMenu, showMenuButton }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-canvas/85 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {showMenuButton && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-9 w-9 items-center justify-center rounded-control text-ink-secondary hover:bg-hairline lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} strokeWidth={1.75} />
          </button>
        )}

        <div className="flex min-w-0 items-baseline gap-2">
          <span className="label-caps">Now viewing</span>
          <span className="truncate text-[14px] font-medium text-ink">
            {page.title}
          </span>
        </div>

        <div className="ml-auto hidden flex-1 max-w-md md:block">
          <SearchField />
        </div>

        {page.primaryAction && (
          <button
            type="button"
            onClick={page.primaryAction.onClick}
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-control bg-ink px-4 text-[13px] font-medium text-white shadow-soft transition-colors hover:bg-[#1F1F1F] md:ml-0"
          >
            {page.primaryAction.label}
          </button>
        )}
      </div>
    </header>
  );
}

function SearchField() {
  return (
    <label className="flex h-9 w-full items-center gap-2 rounded-control border border-border-subtle bg-surface px-3 text-ink-tertiary focus-within:border-border focus-within:ring-2 focus-within:ring-ink/5">
      <Search size={15} strokeWidth={1.75} aria-hidden />
      <input
        type="text"
        placeholder="Search exams, students, questions"
        className="h-full flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-tertiary"
      />
      <kbd className="hidden rounded border border-border-subtle bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-ink-tertiary sm:inline">
        Cmd K
      </kbd>
    </label>
  );
}
