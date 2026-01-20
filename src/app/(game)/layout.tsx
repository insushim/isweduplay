import { Suspense } from 'react'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
