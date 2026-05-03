import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export type PageContext = {
  title: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
  };
};
