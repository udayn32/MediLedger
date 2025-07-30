// You would place this code in a Next.js page, e.g., `pages/index.tsx`
//
// --- SETUP INSTRUCTIONS ---
// 1. Install dependencies for icons:
//    npm install lucide-react

'use client'; // Required for Next.js App Router

import React, { FC } from 'react';
import { ShieldCheck, UploadCloud, Cpu } from 'lucide-react';

// --- Reusable Feature Card Component ---
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-start">
        <div className="bg-gray-700 p-3 rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);


// --- Main Welcome Page Component ---
export default function WelcomePage() {
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <main className="container mx-auto p-8 text-center">
                <header className="py-16 md:py-24">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Welcome to ABHA 2.0
                    </h1>
                    <p className="text-gray-300 mt-4 text-lg md:text-xl max-w-3xl mx-auto">
                        A decentralized platform for secure health record management and AI-powered diagnostics, putting you in control of your data.
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8 my-16 text-left">
                    <FeatureCard
                        icon={<ShieldCheck className="w-10 h-10 text-cyan-400" />}
                        title="Blockchain Security"
                        description="Your health record ownership is immutably logged on the blockchain, providing a transparent and tamper-proof audit trail for all interactions."
                    />
                    <FeatureCard
                        icon={<UploadCloud className="w-10 h-10 text-cyan-400" />}
                        title="Decentralized Storage"
                        description="Sensitive medical files are stored on the InterPlanetary File System (IPFS), not on a central server, giving you true ownership and control over your data."
                    />
                    <FeatureCard
                        icon={<Cpu className="w-10 h-10 text-cyan-400" />}
                        title="AI-Powered Diagnostics"
                        description="Leverage a cutting-edge deep learning model to get instant, AI-driven analysis of medical images like X-rays for pneumonia detection."
                    />
                </div>

                <div className="mt-16">
                    <button
                        // This button is for display purposes on the welcome page.
                        // You would later add an onClick handler to launch the main DApp.
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        Launch App
                    </button>
                </div>
            </main>
        </div>
    );
}
