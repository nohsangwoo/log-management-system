import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      
      <Skeleton className="h-10 w-full" />
      
      <div className="space-y-4 mt-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

