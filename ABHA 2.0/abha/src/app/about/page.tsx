'use client'

import { Heart } from 'lucide-react'

export default function AboutPage() {
  const team = [
    {
      name: "Uday Naik",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      name: "Ajay Kumbhar",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      name: "Siddhesh Surve",
      gradient: "from-green-500 to-blue-500"
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="floating absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" style={{animationDelay: '2s'}}></div>
        <div className="floating absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-8">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-white">Revolutionizing Healthcare Technology</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">About</span>{' '}
              <span className="text-white">MediLedger</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Here's how it works: Upload your chest X-rays and our AI instantly analyzes them for pneumonia detection. 
              Your medical records are stored securely on IPFS while blockchain technology ensures only you control who 
              can access your data. Doctors can request access, analyze your images with AI assistance, and provide 
              professional assessments - all while maintaining complete privacy and data ownership.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button className="glass px-8 py-4 rounded-xl text-white font-semibold hover:bg-white/20 transition-all">
                📖 Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="gradient-text">Technology</span> Stack
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="medical-card p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-6">Frontend & User Experience</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">⚛️</div>
                  <div className="text-white font-medium">Next.js 15</div>
                  <div className="text-gray-400 text-sm">React Framework</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="text-white font-medium">Tailwind CSS</div>
                  <div className="text-gray-400 text-sm">Modern Styling</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-white font-medium">TypeScript</div>
                  <div className="text-gray-400 text-sm">Type Safety</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🔐</div>
                  <div className="text-white font-medium">JWT Auth</div>
                  <div className="text-gray-400 text-sm">Secure Access</div>
                </div>
              </div>
            </div>
            
            <div className="medical-card p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-6">Backend & Infrastructure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🔗</div>
                  <div className="text-white font-medium">Ethereum</div>
                  <div className="text-gray-400 text-sm">Blockchain</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🧠</div>
                  <div className="text-white font-medium">TensorFlow</div>
                  <div className="text-gray-400 text-sm">AI Models</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🗃️</div>
                  <div className="text-white font-medium">MongoDB</div>
                  <div className="text-gray-400 text-sm">Database</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                  <div className="text-2xl mb-2">🌐</div>
                  <div className="text-white font-medium">IPFS</div>
                  <div className="text-gray-400 text-sm">Storage</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet Our <span className="gradient-text">Development</span> Team
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="medical-card p-6 rounded-2xl text-center hover:scale-105 transition-transform">
                <div className={`w-20 h-20 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl text-white">👨‍💻</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
