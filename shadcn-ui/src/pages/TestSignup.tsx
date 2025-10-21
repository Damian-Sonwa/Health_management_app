import React from 'react';
import DebugSignupForm from '@/components/DebugSignupForm';

export default function TestSignup() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Debug Signup Form
          </h1>
          <p className="text-gray-600 mt-2">Test the create account functionality</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <DebugSignupForm />
        </div>
      </div>
    </div>
  );
}
