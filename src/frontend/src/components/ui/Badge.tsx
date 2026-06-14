type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
