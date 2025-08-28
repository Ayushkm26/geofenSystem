import React, { useState } from 'react';

function AboutPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Real-time Location Tracking',
      description: 'Precise GPS-based location monitoring with continuous tracking capabilities for accurate geofence detection.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'Smart Geofences',
      description: 'Create custom geographic boundaries with flexible shapes and sizes. Set up multiple zones with different rules and triggers.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5z" />
        </svg>
      ),
      title: 'Instant Notifications',
      description: 'Receive real-time alerts when entering or exiting geofenced areas. Customizable notification settings for different scenarios.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics showing entry/exit patterns, time spent in zones, and detailed location history reports.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Privacy & Security',
      description: 'End-to-end encryption for location data with granular privacy controls. User data protection is our top priority.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Easy Management',
      description: 'Intuitive web interface for managing geofences, viewing reports, and configuring settings. No technical expertise required.'
    }
  ];

  const techStack = [
    { name: 'React.js', category: 'Frontend', color: 'from-blue-400 to-cyan-400' },
    { name: 'Node.js', category: 'Backend', color: 'from-green-400 to-emerald-400' },
    { name: 'MongoDB', category: 'Database', color: 'from-green-500 to-teal-500' },
    { name: 'Express.js', category: 'Framework', color: 'from-gray-400 to-gray-600' },
    { name: 'Socket.io', category: 'Real-time', color: 'from-purple-400 to-pink-400' },
    { name: 'Google Maps API', category: 'Mapping', color: 'from-red-400 to-orange-400' },
    { name: 'JWT', category: 'Authentication', color: 'from-indigo-400 to-purple-400' },
    { name: 'Tailwind CSS', category: 'Styling', color: 'from-cyan-400 to-blue-400' }
  ];

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Full Stack Developer',
      avatar: 'AJ',
      skills: ['React', 'Node.js', 'MongoDB'],
      contribution: 'Frontend development and API integration'
    },
    {
      name: 'Sarah Chen',
      role: 'Backend Developer',
      avatar: 'SC',
      skills: ['Express.js', 'Database', 'Security'],
      contribution: 'Server architecture and database design'
    },
    {
      name: 'Mike Davis',
      role: 'Mobile Developer',
      avatar: 'MD',
      skills: ['React Native', 'GPS', 'Location APIs'],
      contribution: 'Mobile app and location services'
    },
    {
      name: 'Emily Zhang',
      role: 'UI/UX Designer',
      avatar: 'EZ',
      skills: ['Design', 'Prototyping', 'User Research'],
      contribution: 'User interface and experience design'
    }
  ];

  const useCases = [
    {
      title: 'Campus Safety',
      description: 'Monitor student safety by tracking entry/exit from campus buildings and restricted areas.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Attendance Tracking',
      description: 'Automatic attendance marking when students enter classrooms or laboratory areas.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      title: 'Asset Management',
      description: 'Track valuable equipment and resources within designated campus zones.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      title: 'Emergency Response',
      description: 'Quick location identification and emergency assistance in campus emergency situations.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Gefence-System
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              A cutting-edge geofencing solution developed as a college project, combining location-based services with modern web technologies.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 text-white">
                🎓 College Project
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 text-white">
                📍 Geofencing Technology
              </span>
              <span className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 text-white">
                🚀 Modern Tech Stack
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {[
            { id: 'overview', label: 'Overview', icon: '📋' },
            { id: 'features', label: 'Features', icon: '⚡' },
            { id: 'technology', label: 'Technology', icon: '🔧' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'demo', label: 'Demo', icon: '🎮' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Project Description */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">Project Overview</h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold text-blue-300 mb-6">What is Gefence-System?</h3>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6">
                    Gefence-System is an innovative geofencing application developed as part of our college curriculum. 
                    The project demonstrates advanced location-based services, combining GPS technology with modern web development 
                    to create virtual boundaries around real-world geographic areas.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    When users enter or exit these predefined zones, the system triggers automated actions such as 
                    notifications, alerts, or data logging. This technology has practical applications in campus safety, 
                    attendance tracking, and asset management.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {[
                    { title: 'Academic Focus', desc: 'Developed for educational evaluation and learning', icon: '🎓' },
                    { title: 'Real-world Application', desc: 'Practical geofencing implementation', icon: '🌍' },
                    { title: 'Modern Architecture', desc: 'Full-stack web application with API integration', icon: '🏗️' },
                    { title: 'Open Source', desc: 'Available for learning and collaboration', icon: '📖' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-gray-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">Potential Use Cases</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {useCases.map((useCase, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                      {useCase.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-3">{useCase.title}</h4>
                    <p className="text-gray-400 text-sm">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/8 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Technology Tab */}
        {activeTab === 'technology' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Technology Stack</h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Built with modern technologies and best practices to ensure scalability, performance, and maintainability.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techStack.map((tech, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/8 transition-all group">
                  <div className={`w-12 h-12 bg-gradient-to-r ${tech.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}></div>
                  <h3 className="font-bold text-white mb-2">{tech.name}</h3>
                  <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">{tech.category}</span>
                </div>
              ))}
            </div>

            {/* Architecture Diagram */}
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">System Architecture</h3>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white">Frontend</h4>
                  <p className="text-gray-400 text-sm">React.js Interface</p>
                </div>
                
                <div className="text-4xl text-gray-400">→</div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white">Backend</h4>
                  <p className="text-gray-400 text-sm">Node.js + Express</p>
                </div>
                
                <div className="text-4xl text-gray-400">→</div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-white">Database</h4>
                  <p className="text-gray-400 text-sm">MongoDB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                A dedicated group of students passionate about technology and innovation.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center hover:bg-white/8 transition-all group">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                    {member.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-blue-300 mb-4">{member.role}</p>
                  <p className="text-gray-400 text-sm mb-4">{member.contribution}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {member.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-8">Live Demo</h2>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Interactive Demo Coming Soon!</h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  We're preparing an interactive demonstration of the Gefence-System. 
                  The demo will showcase real-time geofencing capabilities and user interface.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">🎮 Interactive Map</h4>
                    <p className="text-gray-400 text-sm">Explore geofences on an interactive map interface</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">📊 Real-time Data</h4>
                    <p className="text-gray-400 text-sm">View live location tracking and notifications</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">⚙️ Admin Panel</h4>
                    <p className="text-gray-400 text-sm">Manage geofences and view analytics</p>
                  </div>
                </div>
                
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all">
                  🚀 Launch Demo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default AboutPage;