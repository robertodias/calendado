import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Calendado</h1>
            <div className="space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 transition duration-200"
              >
                Home
              </Link>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Welcome to your Calendado dashboard! This is a placeholder for your main application interface.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Calendar View</h3>
              <p className="text-blue-700">Your calendar will be displayed here</p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Upcoming Events</h3>
              <p className="text-green-700">Your upcoming events will be listed here</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Quick Actions</h3>
              <p className="text-purple-700">Common actions will be available here</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> This is a placeholder dashboard. The actual calendar functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
