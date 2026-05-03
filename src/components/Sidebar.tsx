import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import type { NavItem } from '@/types/nav';
import type { Teacher } from '@/types';
import { Logo } from './Logo';
import { cn } from '@/lib/cn';

type Props = {
  items: NavItem[];
  teacher: Teacher | null;
  onNavigate?: () => void;
};

export function Sidebar({ items, teacher, onNavigate }: Props) {
  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-border-subtle bg-surface">
      <div className="px-5 pt-6 pb-8">
        <Logo />
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-control px-3 py-2 text-[14px] transition-colors',
                      isActive
                        ? 'bg-hairline text-ink'
                        : 'text-ink-secondary hover:bg-hairline hover:text-ink',
                    )
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className="shrink-0"
                    aria-hidden
                  />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-control p-2 text-left transition-colors hover:bg-hairline"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hairline text-[13px] font-semibold text-ink">
            {teacher?.initials ?? '··'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-ink">
              {teacher?.full_name ?? 'Loading…'}
            </div>
            <div className="truncate text-[12px] text-ink-tertiary">
              {teacher?.email ?? ''}
            </div>
          </div>
          <Settings
            size={15}
            strokeWidth={1.75}
            className="shrink-0 text-ink-tertiary"
            aria-label="Settings"
          />
        </button>
      </div>
    </aside>
  );
}
