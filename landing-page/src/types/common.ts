// Common UI types used across components

export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type TabType = 'today' | 'week';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export const DAYS_OF_WEEK: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

// Base user interface
export interface BaseUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  firstLogin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Select option for dropdowns
export interface SelectOption {
  value: string | number;
  label: string;
}
