interface FormSectionProps {
  children: React.ReactNode;
  showBorder?: boolean;
  title: string;
}

export function FormSection({ children, showBorder = false, title }: FormSectionProps) {
  return (
    <div className={showBorder ? 'pb-4 border-b border-gray-200' : 'pt-2'}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
