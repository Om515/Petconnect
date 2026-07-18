import React from 'react';
import { Shield, Lock, EyeOff } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="prose max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-500" />
                Information We Collect
              </h2>
              <p className="text-gray-600 mb-4">
                We collect information to provide better services to all our users. The types of information we collect include:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Information you provide (name, email, contact details)</li>
                <li>Information about your pets and preferences</li>
                <li>Data about how you use our services</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <EyeOff className="w-6 h-6 mr-2 text-blue-500" />
                How We Use Information
              </h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Develop new features and functionality</li>
                <li>Communicate with you about your account</li>
                <li>Protect PetConnect and our users</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Information Sharing</h2>
              <p className="text-gray-600">
                We do not share personal information with companies, organizations, or individuals outside of PetConnect except in the following cases:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mt-2">
                <li>With your consent</li>
                <li>For legal reasons</li>
                <li>With domain administrators</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Rights</h2>
              <p className="text-gray-600">
                You have the right to access, correct, or delete your personal information. You may also object to our use of your information or request that we restrict processing.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
