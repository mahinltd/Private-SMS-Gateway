import Link from "next/link";

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo with XML background and foreground */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <img src="/ic_launcher_background.xml" alt="Background" className="absolute w-full h-full" />
              <img src="/ic_launcher_foreground.xml" alt="Foreground" className="relative w-8 h-8" />
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

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <h4 className="text-white text-lg font-bold mb-4">Internal SMS Gateway</h4>
            <p className="text-sm text-gray-400">
              Dedicated communication portal for internal coaching administration. Unauthorized access is strictly prohibited.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-bold mb-4">System Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition">Admin Login</Link></li>
              <li><span className="cursor-not-allowed text-gray-500">System Status (Online)</span></li>
              <li><span className="cursor-not-allowed text-gray-500">API Documentation (Internal)</span></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-white text-lg font-bold mb-4">Contact Administrator</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                admin@coachingcenter.edu
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                +880 1340751380
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Khalishpur, Khulna,GPO-9000
              </li>
            </ul>
          </div>

        </div>
      </main>

      <footer className="border-t border-gray-800 mt-8 pt-8 pb-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Tanvir. All rights reserved.</p>
      </footer>
    </div>
  );
}
