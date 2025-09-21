import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Calendado
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent calendar management solution. Organize your life with smart scheduling and seamless integration.
          </p>
          <div className="space-x-4">
            <Link
              to="/app"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
            >
              Get Started
            </Link>
            <button className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition duration-200">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">AI-powered calendar optimization for better time management.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
            <p className="text-gray-600">Connect with your existing calendar and productivity tools.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">Track your time and productivity with detailed insights.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
