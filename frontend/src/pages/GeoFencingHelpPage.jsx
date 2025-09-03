import React, { useState } from 'react';
import { MessageCircle, MapPin, Shield, Users, Bell, Settings, ExternalLink, ChevronRight, Bot, Zap, RotateCcw } from 'lucide-react';
import Footer from '../components/Footers';

const GeoFencingHelpPage = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 1,
      icon: <Bot className="w-8 h-8" />,
      title: "AI-Powered Chatbot",
      description: "Intelligent conversational interface that connects to external APIs to provide real-time answers about geofencing operations.",
      details: [
        "Natural language processing for intuitive interactions",
        "Real-time API integration for live data queries",
        "Context-aware responses based on your geofence setup",
        "24/7 availability for instant support"
      ]
    },
    {
      id: 2,
      icon: <MapPin className="w-8 h-8" />,
      title: "Live Geofence Data Updates",
      description: "Real-time monitoring and updates of all your geofence boundaries with instant notifications.",
      details: [
        "Live GPS tracking and boundary monitoring",
        "Instant entry/exit detection",
        "Historical data analysis and reporting",
        "Customizable update frequency settings"
      ]
    },
    {
      id: 3,
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Messaging System",
      description: "Automated messaging to both administrators and users when geofence events occur.",
      details: [
        "Instant push notifications for boundary crossings",
        "Customizable message templates",
        "Multi-channel delivery (SMS, email, in-app)",
        "Priority-based alert system"
      ]
    },
    {
      id: 4,
      icon: <Shield className="w-8 h-8" />,
      title: "Private & Public Fences",
      description: "Flexible geofence management with both private and public visibility options.",
      details: [
        "Private fences for sensitive locations",
        "Public fences for community sharing",
        "Role-based access control",
        "Granular permission settings"
      ]
    },
    {
      id: 5,
      icon: <RotateCcw className="w-8 h-8" />,
      title: "Advanced Resync Options",
      description: "Powerful synchronization tools to keep all your geofence data consistent and up-to-date.",
      details: [
        "One-click full data synchronization",
        "Selective fence resync capabilities",
        "Conflict resolution algorithms",
        "Backup and restore functionality"
      ]
    },
    {
      id: 6,
      icon: <Users className="w-8 h-8" />,
      title: "Multi-User Management",
      description: "Comprehensive user management system with different access levels and permissions.",
      details: [
        "Admin and user role differentiation",
        "Bulk user operations",
        "Activity monitoring and audit trails",
        "Team collaboration features"
      ]
    }
  ];

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">Smart Geofencing Made Simple</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            GeoBot Help Center
          </h1>
          <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto">
            Your intelligent geofencing assistant powered by AI. Get instant answers, manage boundaries, 
            and stay connected with real-time location intelligence.
          </p>

          {/* Chatbot Link */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 mb-16 border border-white/20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <MessageCircle className="w-12 h-12 text-blue-400" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Chat with GeoBot</h3>
                <p className="text-blue-200">Ask questions about your geofences and get instant AI-powered responses</p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 mx-auto">
              <MessageCircle className="w-5 h-5" />
              Start Chatting
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-white text-center mb-4">Powerful Features</h2>
          <p className="text-blue-200 text-center mb-12 text-lg">
            Explore the comprehensive suite of tools designed to make geofencing effortless
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-blue-400 transition-transform duration-300 ${activeFeature === feature.id ? 'rotate-90' : ''}`} />
                </div>
                
                <p className="text-blue-200 mb-4 leading-relaxed">{feature.description}</p>
                
                {activeFeature === feature.id && (
                  <div className="mt-6 space-y-3 animate-in slide-in-from-top duration-300">
                    {feature.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-100 text-sm">{detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white text-center mb-8">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Settings className="w-6 h-6" />, title: "Manage Fences", desc: "Create and edit geofences" },
              { icon: <Bell className="w-6 h-6" />, title: "View Alerts", desc: "Check recent notifications" },
              { icon: <RotateCcw className="w-6 h-6" />, title: "Sync Data", desc: "Update all information" },
              { icon: <Users className="w-6 h-6" />, title: "User Settings", desc: "Manage permissions" }
            ].map((action, index) => (
              <button
                key={index}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 border border-white/20 transition-all duration-300 text-left group hover:scale-105"
              >
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg w-fit mb-4 group-hover:shadow-lg transition-all duration-300">
                  <div className="text-white">{action.icon}</div>
                </div>
                <h4 className="text-white font-semibold mb-2">{action.title}</h4>
                <p className="text-blue-200 text-sm">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-blue-300">
            Need more help? Our AI chatbot is available 24/7 to assist you with any questions about geofencing.
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default GeoFencingHelpPage;