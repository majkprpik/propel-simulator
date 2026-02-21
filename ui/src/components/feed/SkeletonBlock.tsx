interface SkeletonBlockProps {
  className?: string;
}

export function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded bg-muted-foreground/20 ${className}`} />;
}
