"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        if (!ignore && data.authenticated) setUser({ email: data.user.email, role: data.user.role });
      } catch {}
    })();
    return () => { ignore = true; };
  }, []);
  
  const doLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch {}
  };

  const handleRoleBasedNavigation = (targetPath: string, requiredRole: string, e: React.MouseEvent) => {
    if (user && user.role !== requiredRole) {
      e.preventDefault();
      const currentRole = user.role || 'patient';
      let message = '';
      
      if (requiredRole === 'doctor') {
        message = currentRole === 'patient' 
          ? `⚠️ Cannot access Doctor section as patient.\n\nThis area is restricted to medical professionals only. If you are a doctor, please log in with your doctor account.`
          : `⚠️ Cannot access Doctor section as ${currentRole}.\n\nThis area is restricted to medical professionals only.`;
      } else if (requiredRole === 'admin') {
        message = `⚠️ Cannot access Admin Console as ${currentRole}.\n\nThis area is restricted to administrators only. If you are an admin, please log in with your admin account.`;
      } else if (requiredRole === 'patient') {
        message = `⚠️ Cannot access Patient section as ${currentRole}.\n\nThis area is designed for patients only.`;
      }
      
      if (window.confirm(message + '\n\nWould you like to go to the homepage instead?')) {
        router.push('/');
      }
      return false;
    }
    return true;
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'doctor': return '🩺';
      case 'admin': return '⚙️';
      case 'patient': return '🏥';
      default: return '👤';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'doctor': return 'from-green-400 to-blue-500';
      case 'admin': return 'from-purple-400 to-pink-500';
      case 'patient': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg font-bold">ML</span>
            </div>
            <span className="text-xl font-bold gradient-text">MediLedger</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Dashboard - accessible by all authenticated users */}
            {user && (
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
                {user.role === 'doctor' ? 'Patient Records' : 'Dashboard'}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            
            {/* Doctor section */}
            <Link 
              href="/doctor" 
              className={`transition-all duration-300 relative group ${
                user?.role === 'doctor' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-400'
              }`}
              onClick={(e) => handleRoleBasedNavigation('/doctor', 'doctor', e)}
              title={user?.role !== 'doctor' ? 'Restricted to doctors only' : 'Access doctor portal'}
            >
              <span className="flex items-center space-x-1">
                <span>Doctor Portal</span>
                {user?.role !== 'doctor' && user && <span className="text-xs">🔒</span>}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Admin section */}
            <Link 
              href="/Admin" 
              className={`transition-all duration-300 relative group ${
                user?.role === 'admin' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-400'
              }`}
              onClick={(e) => handleRoleBasedNavigation('/Admin', 'admin', e)}
              title={user?.role !== 'admin' ? 'Restricted to admins only' : 'Access admin console'}
            >
              <span className="flex items-center space-x-1">
                <span>Admin Console</span>
                {user?.role !== 'admin' && user && <span className="text-xs">🔒</span>}
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-300 relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login" className="glass px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all duration-300">
                  Login
                </Link>
                <Link href="/signup" className="btn-gradient px-4 py-2 rounded-lg text-white font-medium shadow-lg">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* User info */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className={`w-8 h-8 bg-gradient-to-r ${getRoleBadgeColor(user.role)} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-sm">{getRoleIcon(user.role)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">{user.email.split('@')[0]}</p>
                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <button 
                  onClick={doLogout} 
                  className="glass px-4 py-2 rounded-lg text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden glass p-2 rounded-lg"
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
                <span className={`block h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 glass border-t border-white/10">
            <div className="px-6 py-4 space-y-4">
              <Link href="/" className="block text-gray-300 hover:text-white transition-colors">Home</Link>
              {user && (
                <Link href="/dashboard" className="block text-gray-300 hover:text-white transition-colors">
                  {user.role === 'doctor' ? 'Patient Records' : 'Dashboard'}
                </Link>
              )}
              <Link href="/doctor" className="block text-gray-300 hover:text-white transition-colors">
                Doctor Portal {user?.role !== 'doctor' && user && '🔒'}
              </Link>
              <Link href="/Admin" className="block text-gray-300 hover:text-white transition-colors">
                Admin Console {user?.role !== 'admin' && user && '🔒'}
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-white transition-colors">About</Link>
              
              {!user ? (
                <div className="pt-4 border-t border-white/10 space-y-2">
                  <Link href="/login" className="block w-full glass px-4 py-2 rounded-lg text-center text-white">
                    Login
                  </Link>
                  <Link href="/signup" className="block w-full btn-gradient px-4 py-2 rounded-lg text-center text-white font-medium">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getRoleBadgeColor(user.role)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-sm">{getRoleIcon(user.role)}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button 
                    onClick={doLogout} 
                    className="w-full glass px-4 py-2 rounded-lg text-white hover:bg-red-500/20"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
