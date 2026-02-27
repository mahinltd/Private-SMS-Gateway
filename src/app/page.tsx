import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      
      {/* Navbar / Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">SMS Gateway</span>
          </div>
          <Link 
            href="/login" 
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            Admin Login &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Private Communication <br className="hidden md:block" /> 
            <span className="text-blue-600">Management System</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Strictly designed for internal administrative use. Ensure fast, secure, and reliable SMS delivery to students and staff without relying on public gateways.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:-translate-y-1"
            >
              Access Admin Portal
            </Link>
          </div>

          {/* Features */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 font-bold">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-500">
                End-to-end private architecture ensuring data never leaves our internal network.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 font-bold">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Smart Queuing</h3>
              <p className="text-sm text-gray-500">
                Built-in delay mechanisms prevent device overload and ensure high delivery success.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 font-bold">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Real-time Tracking</h3>
              <p className="text-sm text-gray-500">
                Monitor pending, processing, and failed messages instantly from the dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Simple White Footer */}
      <footer className="bg-white py-6 mt-auto">
        <div className="text-center text-sm text-gray-700">
          <p>&copy; {new Date().getFullYear()} Tanvir. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}