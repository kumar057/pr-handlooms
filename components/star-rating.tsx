import { StarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  className,
}: {
  rating: number
  reviewCount?: number
  size?: "sm" | "md"
  className?: string
}) {
  const dimension = size === "sm" ? "size-3.5" : "size-4"
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              dimension,
              i < Math.round(rating)
                ? "fill-accent text-accent"
                : "fill-muted text-muted",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating.toFixed(1)}
        {reviewCount != null ? ` (${reviewCount})` : ""}
      </span>
      <span className="sr-only">{`Rated ${rating} out of 5`}</span>
    </div>
  )
}
