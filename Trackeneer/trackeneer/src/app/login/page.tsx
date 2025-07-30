'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { Suspense } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="bg-slate-800/80 backdrop-blur-sm p-10 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Trackeneer</h1>
          <p className="text-slate-300 text-lg">Sign in to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-400/50 text-red-200 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
            <p className="font-medium">Authentication failed</p>
            <p className="text-sm mt-1 text-red-300">Please try again</p>
            {error !== 'OAuthSignin' && (
              <p className="text-xs mt-2 text-red-400">({error})</p>
            )}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 font-semibold py-4 px-6 rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] shadow-lg group"
          >
            <FaGoogle className="text-red-500 text-xl" />
            <span>Sign in with Google</span>
          </button>
          
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-4 bg-slate-700 hover:bg-slate-600 font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg border border-slate-600 group"
          >
            <FaGithub className="text-white text-xl" />
            <span>Sign in with GitHub</span>
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          🔒 Secure authentication powered by OAuth
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-cyan-400">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
