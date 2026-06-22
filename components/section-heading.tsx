import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          <span className="h-px w-6 bg-accent" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
