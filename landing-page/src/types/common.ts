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
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_MAP: Record<DayOfWeek, number> = {
  FRIDAY: 4,
  MONDAY: 0,
  SATURDAY: 5,
  SUNDAY: 6,
  THURSDAY: 3,
  TUESDAY: 1,
  WEDNESDAY: 2,
} as const;
