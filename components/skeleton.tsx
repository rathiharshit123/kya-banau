import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-charcoal/10", className)}
      {...props}
    />
  );
}

export function SuggestionSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border-2 border-charcoal/10 bg-cream/80 p-5 space-y-3"
          style={{ opacity: 1 - i * 0.1 }}
        >
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-10 w-full mt-2" />
        </div>
      ))}
    </div>
  );
}
