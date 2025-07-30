import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="animated-gradient text-white min-h-screen flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-5xl mx-auto">
        {/* Main Headline with Static Gradient */}
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-yellow-200 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent leading-tight">
          Welcome to Trackeneer
        </h1>
        
        {/* Tagline */}
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
          Empowering XIE students with the tools and insights to excel academically and secure their dream careers.
        </p>
        
        {/* CTA Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-3 bg-white text-slate-900 font-bold py-4 px-10 rounded-full text-xl hover:bg-slate-100 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl group"
        >
          Get Started 
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
        
        {/* Subtle Launch Indicator */}
        <div className="mt-16 text-white/60 text-sm font-medium">
          🚀 Your journey to engineering excellence starts here
        </div>
      </div>
    </div>
  );
}