import type { SpinnerSize } from '../types';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}
      />
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
