import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-200 rounded-full opacity-30 -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full opacity-30 translate-x-48 translate-y-48"></div>
      
      {/* Header */}
      <header className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="Matrika Logo" 
            width={65} 
            height={65}
            className="rounded-lg"
          />
          <span className="text-xl font-semibold text-gray-800">Matrika</span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-gray-700 hover:text-gray-900">About US</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Courses</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Contact Us</a>
        </nav>
        
        <div className="flex space-x-4">
          <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link href="/register" className="px-6 py-2 bg-orange-200 text-gray-800 rounded-full hover:bg-orange-300 transition-colors">
            Register
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-between px-6 py-12 max-w-7xl mx-auto relative z-10">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-6xl font-bold leading-tight mb-6">
            Learn <span className="text-purple-600">Smarter.</span><br />
            Grow <span className="text-orange-500">Faster.</span><br />
            <span className="text-gray-900">Anywhere.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-lg">
            Matrika is your all-in-one e-learning platform designed to make education accessible, personalized, and impactful.
          </p>
          
          <Link href="/register" className="inline-block px-8 py-4 bg-orange-300 text-gray-800 rounded-full text-lg font-medium hover:bg-orange-400 transition-colors">
            Start Now
          </Link>
        </div>
        
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <div className="w-96 h-96 bg-gradient-to-br from-purple-200 to-orange-200 rounded-full flex items-center justify-center">
              <div className="text-8xl">👩‍🎓</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}