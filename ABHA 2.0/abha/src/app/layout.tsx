import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MediLedger — Next-Gen Healthcare Platform",
  description: "Revolutionary decentralized health records with blockchain security, IPFS storage & AI-powered diagnostics.",
  keywords: "healthcare, blockchain, IPFS, AI diagnostics, medical records, decentralized",
  authors: [{ name: "MediLedger Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased animated-bg min-h-screen`}>
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl floating"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-pink-600/20 rounded-full blur-3xl floating" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-600/10 rounded-full blur-3xl floating" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10">
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-2xl font-bold gradient-text mb-4">MediLedger</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    Revolutionary healthcare platform combining blockchain security, 
                    decentralized storage, and AI-powered diagnostics for the future of medicine.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">ML</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                    <li><a href="/doctor" className="hover:text-white transition-colors">Doctor Portal</a></li>
                    <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Technology</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>Blockchain Security</li>
                    <li>IPFS Storage</li>
                    <li>AI Diagnostics</li>
                    <li>End-to-End Encryption</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-white/10 mt-8 pt-8 text-center">
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
