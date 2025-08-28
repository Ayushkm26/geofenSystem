import React from 'react';

function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Location Data',
          text: 'Gefence-System collects precise location information from your device when you use our geofencing services. This includes GPS coordinates, Wi-Fi access points, and Bluetooth beacons to determine your position relative to predefined geographic boundaries.'
        },
        {
          subtitle: 'Personal Information',
          text: 'We may collect personal information such as your name, email address, phone number, and user account credentials when you register for our service.'
        },
        {
          subtitle: 'Device Information',
          text: 'We collect information about the device you use to access Gefence-System, including device type, operating system, unique device identifiers, and mobile network information.'
        },
        {
          subtitle: 'Usage Data',
          text: 'We collect information about how you interact with our service, including geofence entry/exit events, notification preferences, and feature usage patterns.'
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      content: [
        {
          text: 'We use the collected information for the following purposes:'
        },
        {
          list: [
            'Provide geofencing services and location-based notifications',
            'Monitor and analyze geofence boundary crossings',
            'Send alerts and notifications when you enter or exit designated areas',
            'Improve and optimize our geofencing algorithms',
            'Provide customer support and respond to your inquiries',
            'Ensure the security and integrity of our system',
            'Comply with legal obligations and academic requirements'
          ]
        }
      ]
    },
    {
      id: 'information-sharing',
      title: 'Information Sharing and Disclosure',
      content: [
        {
          text: 'As a college project, Gefence-System is committed to protecting your privacy. We do not sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:'
        },
        {
          list: [
            'With your explicit consent',
            'For academic evaluation and project demonstration purposes',
            'When required by law or legal process',
            'To protect the rights, property, or safety of users or others',
            'In case of emergency situations where location sharing may be necessary'
          ]
        }
      ]
    },
    {
      id: 'data-security',
      title: 'Data Security',
      content: [
        {
          text: 'We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:'
        },
        {
          list: [
            'Encryption of data in transit and at rest',
            'Secure authentication and authorization mechanisms',
            'Regular security assessments and updates',
            'Limited access to personal information on a need-to-know basis',
            'Secure storage of location data with appropriate retention policies'
          ]
        }
      ]
    },
    {
      id: 'location-services',
      title: 'Location Services and Permissions',
      content: [
        {
          text: 'Gefence-System requires access to your device\'s location services to function properly. You have control over location permissions:'
        },
        {
          list: [
            'You can enable or disable location services through your device settings',
            'Background location access may be required for continuous geofencing',
            'You can adjust location accuracy settings to balance functionality and privacy',
            'Location data is only collected when the app is active or when explicitly permitted'
          ]
        }
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      content: [
        {
          text: 'We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy:'
        },
        {
          list: [
            'Location data is retained for the duration of the project and evaluation period',
            'Personal information is kept only as long as your account remains active',
            'Usage data may be aggregated and anonymized for academic research purposes',
            'You may request deletion of your data at any time by contacting us'
          ]
        }
      ]
    },
    {
      id: 'your-rights',
      title: 'Your Privacy Rights',
      content: [
        {
          text: 'You have certain rights regarding your personal information:'
        },
        {
          list: [
            'Access: Request copies of your personal information',
            'Correction: Request correction of inaccurate or incomplete information',
            'Deletion: Request deletion of your personal information',
            'Portability: Request transfer of your data in a machine-readable format',
            'Withdraw Consent: Withdraw consent for location tracking at any time',
            'Opt-out: Opt-out of non-essential notifications and communications'
          ]
        }
      ]
    },
    {
      id: 'academic-purpose',
      title: 'Academic Project Disclaimer',
      content: [
        {
          text: 'Gefence-System is developed as a college project for educational purposes. Please be aware that:'
        },
        {
          list: [
            'This system is created for academic evaluation and demonstration',
            'Data may be used for project presentations and academic assessment',
            'The system may have limitations and is not intended for commercial use',
            'Student developers are learning and implementing best practices',
            'Faculty supervisors may review system functionality and data handling',
            'The project complies with institutional guidelines for student projects'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Gefence-System
              </h1>
              <p className="text-gray-300 text-lg">College Project - Geofencing Solution</p>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-4">Privacy Policy</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"></path>
                </svg>
                Academic Project
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Effective Date: {currentDate}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Geofencing System
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Introduction</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Welcome to Gefence-System, a geofencing application developed as a college project. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our geofencing services.
              </p>
              <p className="text-gray-300 leading-relaxed">
                By using Gefence-System, you agree to the collection and use of information in accordance with this policy. This system is designed for educational purposes and academic evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-6">{section.title}</h3>
                  
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="mb-6 last:mb-0">
                      {item.subtitle && (
                        <h4 className="text-lg font-medium text-blue-300 mb-3">{item.subtitle}</h4>
                      )}
                      
                      {item.text && (
                        <p className="text-gray-300 leading-relaxed mb-4">{item.text}</p>
                      )}
                      
                      {item.list && (
                        <ul className="space-y-3">
                          {item.list.map((listItem, listIndex) => (
                            <li key={listIndex} className="flex items-start space-x-3 text-gray-300">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2.5 flex-shrink-0"></div>
                              <span className="leading-relaxed">{listItem}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mt-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">Contact Us</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices, please contact our development team.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-300">gefence.project@college.edu</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span className="text-gray-300">College Project Team</span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"></path>
                  </svg>
                  <span className="text-gray-300">Academic Project</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm">
            Last updated: {currentDate} • This is a college project created for educational purposes
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;