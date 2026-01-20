import { Suspense } from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
          <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
