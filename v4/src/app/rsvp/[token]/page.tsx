import { Suspense } from 'react'
import RsvpPageClient from './RsvpPageClient'

export default function RsvpPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600">Loading your invitation...</p>
            </div>
          </div>
        }
      >
        <RsvpPageClient token={params.token} />
      </Suspense>
    </div>
  )
}