'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <Navbar showBackButton={false} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <h1 className="text-5xl lg:text-6xl font-bold text-green-900 leading-tight mb-6">
                Your Health,
                <span className="text-green-600 block">Our Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience personalized healthcare with our expert doctors. Book appointments, 
                manage your health records, and get the care you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Book Appointment
                </button>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-r from-green-400 to-green-600 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"></div>
                <div className="absolute inset-0 w-full h-96 bg-white rounded-3xl shadow-xl flex items-center justify-center">
                  <div className="text-center px-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold text-green-800 mb-3">Expert Care</h3>
                    <p className="text-gray-600 text-lg font-medium">Trusted by thousands of patients</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-green-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🩺",
                title: "General Consultation",
                description: "Expert medical advice from certified doctors"
              },
              {
                icon: "💊",
                title: "Prescription Management",
                description: "Digital prescriptions and medication tracking"
              },
              {
                icon: "📱",
                title: "Telemedicine",
                description: "Virtual consultations from the comfort of your home"
              }
            ].map((service, index) => (
              <div key={index} className={`bg-green-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'animate-fade-in' : ''}`} style={{animationDelay: `${index * 200}ms`}}>
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10K+", label: "Happy Patients" },
              { number: "50+", label: "Expert Doctors" },
              { number: "24/7", label: "Support" },
              { number: "99%", label: "Satisfaction" }
            ].map((stat, index) => (
              <div key={index} className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-green-900 mb-6">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of patients who trust Siddha Savor for their healthcare needs
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-green-600 text-white px-12 py-4 rounded-full text-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Register Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold">Siddha Savor</span>
              </div>
              <p className="text-green-200">Your trusted healthcare partner</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-green-200">
                <li>General Consultation</li>
                <li>Telemedicine</li>
                <li>Prescription</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-green-200">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-green-200">support@siddhasavor.com</p>
              <p className="text-green-200">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-green-800 mt-8 pt-8 text-center text-green-200">
            <p>&copy; 2024 Siddha Savor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
