'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Brain,
  Building2,
  FileText,
  Settings,
  Bell,
  Search,
  Plus,
  LogOut,
  User,
} from 'lucide-react';
import AIAssistant from '../components/AIAssistant';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Get user's first name for personalization
  const firstName = session.user?.name?.split(' ')[0] || 'Student';

  // Placeholder data - in a real app, this would come from your database
  const userData = {
    name: firstName,
    upcomingAssignments: [
      { title: 'Data Structures Quiz 2', dueDate: 'July 30, 2025', subject: 'CSE' },
      { title: 'DBMS Project Phase 1', dueDate: 'Aug 5, 2025', subject: 'IT' },
      { title: 'OS Lab Submission', dueDate: 'Aug 8, 2025', subject: 'CSE' },
    ],
    aptitude: {
      strongest: 'Logical Reasoning',
      weakest: 'Quantitative Aptitude',
    },
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-10">Trackeneer</h1>
          <nav className="space-y-4">
            <a href="#" className="flex items-center p-2 bg-slate-700 rounded-lg text-white font-semibold">
              <LayoutDashboard className="mr-3" /> Dashboard
            </a>
            <a href="#" className="flex items-center p-2 hover:bg-slate-800 rounded-lg">
              <Calendar className="mr-3" /> Study Planner
            </a>
            <a href="#" className="flex items-center p-2 hover:bg-slate-800 rounded-lg">
              <Brain className="mr-3" /> Aptitude Prep
            </a>
            <a href="#" className="flex items-center p-2 hover:bg-slate-800 rounded-lg">
              <Building2 className="mr-3" /> Company Insights
            </a>
            <a href="#" className="flex items-center p-2 hover:bg-slate-800 rounded-lg">
              <FileText className="mr-3" /> Resume Coach
            </a>
          </nav>
        </div>
        <div className="space-y-2">
          {/* User Profile Section */}
          <div className="flex items-center p-2 bg-slate-800 rounded-lg mb-4">
            <img
              src={session.user?.image || ''}
              alt={session.user?.name || ''}
              className="w-8 h-8 rounded-full mr-3"
            />
            <div>
              <p className="text-sm font-medium">{session.user?.name}</p>
              <p className="text-xs text-slate-400">XIE Student</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center p-2 hover:bg-slate-800 rounded-lg w-full text-red-400 hover:text-red-300"
          >
            <LogOut className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {userData.name}! 🚀</h2>
            <p className="text-slate-400">Ready to accelerate your engineering journey today?</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full">
              <Bell />
            </button>
          </div>
        </header>

        {/* Dashboard Widgets */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* AI Assistant - Takes full height on right side */}
            <div className="xl:col-span-1 order-1 xl:order-2">
              <AIAssistant userId={session.user?.email || ''} />
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-3 order-2 xl:order-1 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Deadlines Card */}
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Upcoming Deadlines</h3>
                  <ul className="space-y-4">
                    {userData.upcomingAssignments.map((item, index) => (
                      <li key={index} className="flex justify-between items-center bg-slate-900 p-3 rounded-md">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-slate-400">{item.subject}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-cyan-400">{item.dueDate}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aptitude Snapshot Card */}
                <div className="bg-slate-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Aptitude Snapshot</h3>
                  <div className="space-y-4">
                     <div>
                        <p className="text-sm text-slate-400">Strongest Area</p>
                        <p className="text-lg font-semibold text-green-400">{userData.aptitude.strongest}</p>
                     </div>
                     <div>
                        <p className="text-sm text-slate-400">Area to Improve</p>
                        <p className="text-lg font-semibold text-yellow-400">{userData.aptitude.weakest}</p>
                     </div>
                     <button className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center justify-center">
                        <Brain className="mr-2 h-5 w-5"/> Start a New Quiz
                     </button>
                  </div>
                </div>
              </div>

               {/* Quick Actions Card */}
               <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg flex flex-col items-center justify-center">
                        <FileText className="h-8 w-8 mb-2 text-cyan-400"/>
                        <span className="font-semibold">Analyze My Resume</span>
                    </button>
                     <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg flex flex-col items-center justify-center">
                        <Building2 className="h-8 w-8 mb-2 text-cyan-400"/>
                        <span className="font-semibold">Explore Companies</span>
                    </button>
                     <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg flex flex-col items-center justify-center">
                        <Calendar className="h-8 w-8 mb-2 text-cyan-400"/>
                        <span className="font-semibold">Plan My Week</span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}