'use client';

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UploadCloud, Cpu, Lock, BrainCircuit, Zap, Database, Users, ArrowRight, Star, Check } from 'lucide-react';

// Feature card component with enhanced design
interface FeatureCardProps { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description, gradient }) => (
  <div className="group medical-card rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl floating">
    <div className={`mb-6 inline-flex rounded-xl bg-gradient-to-r ${gradient} p-4 text-white shadow-lg`}>
      {icon}
    </div>
    <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
    <div className="mt-4 flex items-center text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
      Learn more <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </div>
);

// Statistics component
const StatCard: FC<{ value: string; label: string; }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-bold gradient-text-medical mb-2">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

// Technology badge component
const TechBadge: FC<{ name: string; icon: React.ReactNode; }> = ({ name, icon }) => (
  <div className="flex items-center space-x-2 glass px-4 py-2 rounded-full">
    {icon}
    <span className="text-sm font-medium text-white">{name}</span>
  </div>
);

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Revolutionary Healthcare Platform</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="gradient-text">MediLedger</span>
                  <br />
                  <span className="text-white">Next-Gen</span>
                  <br />
                  <span className="gradient-text-medical">Healthcare</span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Revolutionizing healthcare with blockchain security, decentralized storage, 
                and AI-powered diagnostics. Your health data, secured and intelligent.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard" className="btn-gradient px-8 py-4 rounded-xl text-white font-semibold shadow-2xl group">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/doctor" className="glass px-8 py-4 rounded-xl text-white font-semibold hover:bg-white/20 transition-all">
                  Doctor Portal
                </Link>
              </div>
              
              {/* Technology badges */}
              <div className="flex flex-wrap gap-3">
                <TechBadge name="Blockchain" icon={<ShieldCheck className="h-4 w-4 text-green-400" />} />
                <TechBadge name="AI Powered" icon={<BrainCircuit className="h-4 w-4 text-purple-400" />} />
                <TechBadge name="IPFS Storage" icon={<Database className="h-4 w-4 text-blue-400" />} />
                <TechBadge name="Secure" icon={<Lock className="h-4 w-4 text-cyan-400" />} />
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="medical-card rounded-2xl p-6 floating">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Blockchain Security</h3>
                    <p className="text-gray-400 text-sm">Immutable record keeping with smart contracts</p>
                  </div>
                  <div className="medical-card rounded-2xl p-6 floating" style={{animationDelay: '1s'}}>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                      <BrainCircuit className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">AI Diagnostics</h3>
                    <p className="text-gray-400 text-sm">Advanced ML models for medical imaging</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="medical-card rounded-2xl p-6 floating" style={{animationDelay: '0.5s'}}>
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                      <UploadCloud className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">IPFS Storage</h3>
                    <p className="text-gray-400 text-sm">Decentralized medical image storage</p>
                  </div>
                  <div className="medical-card rounded-2xl p-6 floating" style={{animationDelay: '1.5s'}}>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Patient Control</h3>
                    <p className="text-gray-400 text-sm">You own and control your health data</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 border-y border-white/10 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value="99.9%" label="Uptime Guarantee" />
            <StatCard value="256-bit" label="Encryption Standard" />
            <StatCard value="<1s" label="AI Analysis Time" />
            <StatCard value="100%" label="Data Ownership" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Transforming Healthcare with
              <span className="gradient-text"> Innovation</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Combining cutting-edge technologies to create the most secure, 
              intelligent, and patient-centric healthcare platform ever built.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8" />}
              title="Blockchain Security"
              description="Immutable medical records with smart contract-based consent management and audit trails ensure complete data integrity and patient privacy."
              gradient="from-green-400 to-blue-500"
            />
            <FeatureCard
              icon={<UploadCloud className="h-8 w-8" />}
              title="Decentralized Storage"
              description="Medical images stored on IPFS ensure global accessibility while maintaining patient control over their sensitive healthcare data."
              gradient="from-cyan-400 to-blue-500"
            />
            <FeatureCard
              icon={<BrainCircuit className="h-8 w-8" />}
              title="AI-Powered Analysis"
              description="Advanced CNN models provide instant pneumonia detection and diagnostic insights with transparent confidence scoring."
              gradient="from-purple-400 to-pink-500"
            />
            <FeatureCard
              icon={<Lock className="h-8 w-8" />}
              title="End-to-End Encryption"
              description="Military-grade encryption protects your health data throughout its entire lifecycle, from upload to analysis."
              gradient="from-red-400 to-orange-500"
            />
            <FeatureCard
              icon={<Database className="h-8 w-8" />}
              title="Interoperable Records"
              description="Seamlessly share medical records between healthcare providers while maintaining complete patient consent control."
              gradient="from-yellow-400 to-orange-500"
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Real-time Insights"
              description="Instant AI analysis and diagnostic results delivered in real-time to enable faster medical decision-making."
              gradient="from-indigo-400 to-purple-500"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-8">
                Why Choose <span className="gradient-text">MediLedger?</span>
              </h2>
              <div className="space-y-6">
                {[
                  "Complete ownership and control of your health data",
                  "Instant AI-powered diagnostic insights",
                  "Secure blockchain-based record management",
                  "Global accessibility through decentralized storage",
                  "Doctor-patient consent management system",
                  "Real-time collaboration between healthcare providers"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="medical-card rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Join the Future</h3>
                <p className="text-gray-400">Be part of the healthcare revolution</p>
              </div>
              
              <div className="space-y-4">
                <Link href="/signup" className="block w-full btn-gradient px-6 py-3 rounded-xl text-center text-white font-semibold">
                  Get Started Free
                </Link>
                <Link href="/about" className="block w-full glass px-6 py-3 rounded-xl text-center text-white hover:bg-white/20 transition-all">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="gradient-text-medical"> Healthcare Experience?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of patients and doctors already using MediLedger 
            to secure and enhance their healthcare journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="btn-gradient px-8 py-4 rounded-xl text-white font-semibold shadow-2xl">
              Start Your Journey
            </Link>
            <Link href="/doctor" className="btn-medical px-8 py-4 rounded-xl text-white font-semibold">
              Doctor Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
