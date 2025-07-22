import Link from 'next/link'
import { Heart, Users, Mail, Calendar, Hotel, Car, BarChart3, Shield, Zap, Globe } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Guest Management',
      description: 'Complete guest database with import/export, filtering, and bulk operations.',
      color: 'blue'
    },
    {
      icon: Mail,
      title: 'Multi-Channel Communication',
      description: 'Email and WhatsApp integration with professional templates and automation.',
      color: 'green'
    },
    {
      icon: Calendar,
      title: 'Two-Stage RSVP System',
      description: 'Smart RSVP flow with initial response and detailed event preferences.',
      color: 'purple'
    },
    {
      icon: Hotel,
      title: 'Accommodation Management',
      description: 'Hotel booking coordination with room assignments and guest preferences.',
      color: 'pink'
    },
    {
      icon: Car,
      title: 'Transportation Planning',
      description: 'Coordinate airport pickups, shuttles, and transportation logistics.',
      color: 'yellow'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Real-time insights, RSVP tracking, and comprehensive reporting.',
      color: 'indigo'
    }
  ]

  const techStack = [
    'Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS',
    'Drizzle ORM', 'PostgreSQL', 'NextAuth.js', 'ShadCN UI',
    'Resend API', 'WhatsApp API', 'Vercel', 'TanStack Query'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-wedding-blush/20 via-wedding-cream/30 to-wedding-sage/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold/10 to-wedding-rose/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <Heart className="w-16 h-16 text-wedding-gold mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-gray-900 mb-6">
              Wedding RSVP Platform
              <span className="block text-2xl md:text-3xl lg:text-4xl text-wedding-gold font-normal mt-2">
                Version 4.0 Production Ready
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Complete wedding management system with guest coordination, 
              multi-channel communication, and comprehensive planning tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/auth/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-white bg-wedding-gold hover:bg-wedding-gold/90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Link>
              <Link 
                href="/rsvp/demo-token-123"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-wedding-gold bg-white border-2 border-wedding-gold hover:bg-wedding-gold/5 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Heart className="w-5 h-5 mr-2" />
                Try RSVP Demo
              </Link>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Zap className="w-4 h-4 mr-2" />
                Production Ready
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <Globe className="w-4 h-4 mr-2" />
                Vercel Deployed
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                <Shield className="w-4 h-4 mr-2" />
                Enterprise Security
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Everything You Need for Perfect Wedding Planning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From guest management to communication, we've built every feature you need for a seamless wedding experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 border-blue-200',
                green: 'bg-green-50 text-green-600 border-green-200',
                purple: 'bg-purple-50 text-purple-600 border-purple-200',
                pink: 'bg-pink-50 text-pink-600 border-pink-200',
                yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
              }[feature.color]

              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className={`w-12 h-12 rounded-lg ${colorClasses} flex items-center justify-center mb-4 border`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Technical Excellence Section */}
      <div className="py-16 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Production-ready architecture with enterprise-grade security, performance, and scalability.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {techStack.map((tech, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-wedding-gold/10 transition-colors">
                  <span className="text-sm font-medium text-gray-800">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Sub-2-second page loads with optimized performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Security</h3>
              <p className="text-gray-600">Advanced authentication and data protection</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Scale</h3>
              <p className="text-gray-600">CDN-powered delivery worldwide</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-wedding-gold/90 to-wedding-rose/90">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">
            Ready to Plan Your Perfect Wedding?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of couples who have made their wedding planning effortless with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-wedding-gold bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/auth/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-white border-2 border-white hover:bg-white/10 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="w-8 h-8 text-wedding-gold mx-auto mb-4" />
            <h3 className="text-xl font-serif text-white mb-2">Wedding RSVP Platform V4</h3>
            <p className="text-gray-400 mb-4">
              Complete wedding management solution built with modern technology
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Wedding RSVP Platform. Built with ❤️ for perfect celebrations.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}