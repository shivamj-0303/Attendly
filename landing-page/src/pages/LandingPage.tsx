import { Download, Shield, Clock, Users, BarChart3, Smartphone, CheckCircle, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Attendly</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
              >
                <LogIn className="h-4 w-4" />
                Admin Panel
              </Link>
              <a
                href="https://github.com/shivamj-0303/Attendly"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Attendance Management
            <br />
            <span className="text-blue-600">Made Simple</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your college attendance tracking with our powerful mobile app.
            Perfect for teachers and students to manage attendance efficiently.
          </p>

          {/* Download Button */}
          <div className="flex flex-col items-center gap-6">
            <a
              href="/downloads/attendly.apk"
              download
              className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Download className="h-6 w-6" />
              Download APK (Android)
            </a>
            <p className="text-sm text-gray-500">
              Version 1.0.0 • Android 6.0+ • 15 MB
            </p>
          </div>

          {/* App Screenshot Placeholder */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-8 max-w-sm mx-auto">
              <div className="bg-white rounded-xl p-6 text-center">
                <Smartphone className="h-48 w-48 mx-auto text-blue-600 opacity-20" />
                <p className="text-gray-400 mt-4">App Screenshot Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h3>
            <p className="text-lg text-gray-600">
              Powerful features designed for modern educational institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Tracking
              </h4>
              <p className="text-gray-600">
                Mark and monitor attendance in real-time with instant synchronization across all devices.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Authentication
              </h4>
              <p className="text-gray-600">
                Role-based access control with JWT authentication ensures your data is always protected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Multi-User Support
              </h4>
              <p className="text-gray-600">
                Separate interfaces for admins, teachers, and students with appropriate permissions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Analytics & Reports
              </h4>
              <p className="text-gray-600">
                Generate detailed attendance reports with visual charts and statistics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Mobile First
              </h4>
              <p className="text-gray-600">
                Native mobile experience built with React Native for optimal performance.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Easy to Use
              </h4>
              <p className="text-gray-600">
                Intuitive interface designed for quick adoption with minimal training required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Download the App
              </h4>
              <p className="text-gray-600">
                Download the APK file and install it on your Android device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Create Account
              </h4>
              <p className="text-gray-600">
                Sign up as a teacher or student with your college credentials.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Start Tracking
              </h4>
              <p className="text-gray-600">
                Begin marking attendance and monitoring your classes effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Attendance Management?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of educational institutions already using Attendly to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/downloads/attendly.apk"
              download
              className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Download className="h-6 w-6" />
              Download Now
            </a>
            <Link
              to="/admin"
              className="inline-flex items-center gap-3 bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-800 transition shadow-lg"
            >
              <LogIn className="h-6 w-6" />
              Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-white font-semibold text-lg">Attendly</h4>
              </div>
              <p className="text-sm">
                Smart attendance management for modern educational institutions.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/downloads/attendly.apk" className="hover:text-white transition">
                    Download
                  </a>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:support@attendly.com" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/shivamj-0303/Attendly" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Attendly. All rights reserved. Built with ❤️ for education.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
