import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Wedding RSVP Platform
            <span className="block text-2xl md:text-3xl text-purple-600 font-normal mt-2">
              Version 4.0
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            A modern, comprehensive wedding RSVP management system built with Next.js 15, 
            Supabase, and advanced communication features.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-3">
                🎯 Features
              </h3>
              <ul className="text-left text-purple-800 space-y-2">
                <li>• Real-time RSVP tracking</li>
                <li>• Multi-channel communication</li>
                <li>• Guest management & analytics</li>
                <li>• PWA with offline support</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-pink-900 mb-3">
                🚀 Technology
              </h3>
              <ul className="text-left text-pink-800 space-y-2">
                <li>• Next.js 15 App Router</li>
                <li>• Supabase PostgreSQL</li>
                <li>• TypeScript & Tailwind CSS</li>
                <li>• Row Level Security (RLS)</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/admin" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link 
              href="/rsvp/demo" 
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              RSVP Demo
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ✅ Successfully deployed on Vercel with Next.js build system
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}