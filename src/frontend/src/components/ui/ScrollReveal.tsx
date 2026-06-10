import type { ReactNode } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: 'fade-up' | 'fade-scale' | 'fade-center';
};

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  variant = 'fade-up',
}: Props) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  const variantClass =
    variant === 'fade-scale'
      ? 'scroll-reveal-scale'
      : variant === 'fade-center'
        ? 'scroll-reveal-center'
        : 'scroll-reveal-up';

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${variantClass} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
