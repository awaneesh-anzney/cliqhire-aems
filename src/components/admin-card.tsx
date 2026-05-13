import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminCardProps {
  title: string
  description: string
  actionText: string
  actionHref: string
  icon: React.ReactNode
  className?: string
}

export function AdminCard({
  title,
  description,
  actionText,
  actionHref,
  icon,
  className,
}: AdminCardProps) {
  return (
    <div className={cn(
      "flex flex-col h-full p-6 rounded-lg border bg-card",
      className
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-auto pt-4">
        <Link
          href={actionHref}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {actionText}
        </Link>
      </div>
    </div>
  )
}

