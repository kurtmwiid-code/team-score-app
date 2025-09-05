"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { createClient } from "@supabase/supabase-js";
import AuthWrapper from '@/components/AuthWrapper';
import { 
  BarChart3, 
  Settings, 
  Users, 
  TrendingUp, 
  Trophy, 
  Star, 
  Target, 
  ArrowUp, 
  ArrowDown,
  Award,
  Home,
  FilePlus,
  Menu,
  X,
  ChevronRight,
  BookOpen, 
  LogOut
} from "lucide-react";

// --- TypeScript Interfaces ---
interface PerformanceData {
  month: string;
  score: number;
  target: number;
}

interface DepartmentData {
  name: string;
  score: number;
}

interface TopPerformer {
  id: number;
  name: string;
  role: string;
  score: number;
  trend: 'up' | 'down';
  avatar: string;
  trendValue: number;
}

interface RecentSubmission {
  id: string;
  sales_rep: string;
  submission_date: string;
  overall_average: number;
}

interface RealDataState {
  totalSubmissions: number;
  totalReps: number;
  teamAverage: number;
  topPerformer: { name: string; score: number };
  recentSubmissions: RecentSubmission[];
  performanceData: PerformanceData[];
  departmentData: DepartmentData[];
  topPerformers: TopPerformer[];
}

// --- Supabase Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export default function HomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState<RealDataState>({
    totalSubmissions: 0,
    totalReps: 0,
    teamAverage: 0,
    topPerformer: { name: '', score: 0 },
    recentSubmissions: [],
    performanceData: [],
    departmentData: [],
    topPerformers: []
  });

    // ADD THIS LOGOUT FUNCTION HERE
  const handleLogout = async () => {
    const supabase = createClient(
      "https://qcfgxqtlkqttqbrwygol.supabase.co", 
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0"
    );
    await supabase.auth.signOut();
  };

  // Load real data from Supabase
  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get all submissions with scores
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_scores(*)
        `)
        .order('submission_date', { ascending: false });

      if (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        return;
      }

      // Process the data
      const totalSubmissions = submissionsData?.length || 0;
      const uniqueReps = [...new Set(submissionsData?.map((s: any) => s.sales_rep) || [])];
      const totalReps = uniqueReps.length;

      // Calculate team average
      const avgScores = submissionsData?.filter((s: any) => s.overall_average > 0) || [];
      const teamAverage = avgScores.length > 0 
        ? avgScores.reduce((acc: number, s: any) => acc + s.overall_average, 0) / avgScores.length 
        : 0;

      // Find top performer
      const repAverages: { [key: string]: { total: number, count: number } } = {};
      submissionsData?.forEach((submission: any) => {
        if (!repAverages[submission.sales_rep]) {
          repAverages[submission.sales_rep] = { total: 0, count: 0 };
        }
        if (submission.overall_average > 0) {
          repAverages[submission.sales_rep].total += submission.overall_average;
          repAverages[submission.sales_rep].count += 1;
        }
      });

      let topPerformer = { name: '', score: 0 };
      Object.entries(repAverages).forEach(([name, data]: [string, any]) => {
        const average = data.count > 0 ? data.total / data.count : 0;
        if (average > topPerformer.score) {
          topPerformer = { name, score: average };
        }
      });

      // Create top performers list
      const topPerformers: TopPerformer[] = Object.entries(repAverages)
        .map(([name, data]: [string, any]) => ({
          id: Math.random(),
          name,
          role: getRole(name),
          score: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
          trend: 'up' as const,
          avatar: name.charAt(0).toUpperCase(),
          trendValue: Math.floor(Math.random() * 5) + 1
        }))
        .filter(rep => rep.score > 0)
        .sort((a, b) => b.score - a.score);

      // Performance trend data (mock for now, could be enhanced with date-based analysis)
      const performanceData: PerformanceData[] = [
        { month: 'Jan', score: teamAverage * 0.85, target: 2.5 },
        { month: 'Feb', score: teamAverage * 0.90, target: 2.5 },
        { month: 'Mar', score: teamAverage * 0.95, target: 2.5 },
        { month: 'Apr', score: teamAverage, target: 2.5 }
      ];

      // Department data (simplified - could be enhanced with role-based grouping)
      const departmentData: DepartmentData[] = [
        { name: 'Development', score: Math.round(teamAverage * 0.95 * 100) / 100 },
        { name: 'Management', score: Math.round(teamAverage * 1.05 * 100) / 100 },
        { name: 'Sales', score: Math.round(teamAverage * 0.98 * 100) / 100 },
        { name: 'QA', score: Math.round(teamAverage * 1.02 * 100) / 100 }
      ];

      setRealData({
        totalSubmissions,
        totalReps,
        teamAverage: Math.round(teamAverage * 100) / 100,
        topPerformer,
        recentSubmissions: submissionsData?.slice(0, 10) || [],
        performanceData,
        departmentData,
        topPerformers
      });

    } catch (error) {
      console.error('Error processing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to assign roles (you can enhance this)
  const getRole = (name: string): string => {
    const roles: { [key: string]: string } = {
      'Desmaine': 'Sales Representative',
      'Jonathan': 'Sales Representative',
      'Kyle': 'Sales Representative',
      'Jean': 'Sales Representative',
      'JP': 'Sales Representative',
      'Phumla': 'Sales Representative',
      'Michelle B': 'Sales Representative',
      'Tiyani': 'Sales Representative',
      'Hadya': 'Sales Representative',
      'Banele': 'Sales Representative', 
      'Susan': 'Sales Representative'
    };
    return roles[name] || 'Team Member';
  };

  // Your existing sections with real counts
  const sections = [
    {
      title: "Scoring",
      description: "Evaluate and score team members quickly and easily.",
      href: "/scoring",
      icon: <FilePlus className="h-10 w-10 text-white" />,
      gradient: "from-[#1F3C88] to-blue-600",
      stats: `${realData.totalSubmissions} Evaluations`,
    },
     {
    title: "Training",
    description: "Curated examples of excellent call techniques by section.",
    href: "/training",
    icon: <BookOpen className="h-10 w-10 text-white" />,
    gradient: "from-emerald-500 to-emerald-600",
    stats: "Training Library",
   },
    {
      title: "Reporting",
      description: "View analytics and performance reports.",
      href: "/reporting", 
      icon: <BarChart3 className="h-10 w-10 text-white" />,
      gradient: "from-green-500 to-green-600",
      stats: `${realData.totalReps} Reports`,
    },
    {
      title: "Settings",
      description: "Configure scoring criteria and app preferences.",
      href: "/settings",
      icon: <Settings className="h-10 w-10 text-white" />,
      gradient: "from-purple-500 to-purple-600",
      stats: "5 Configs",
    },
  ];

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-white via-slate-50 to-white border-r border-slate-200 shadow-xl h-screen fixed left-0 top-0 z-50 transition-all duration-300`}>
      <div className="p-4">
        {/* Trusted Home Buyers Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 w-full">
            <img
              src="/THB.webp"
              alt="Trusted Home Buyers Logo"
              className="h-12 w-auto object-contain flex-shrink-0"
            />
            {sidebarOpen && (
              <div className="overflow-hidden min-w-0 flex-1">
                <h1 className="text-lg font-bold text-[#1F3C88] leading-tight">TeamScore Pro</h1>
                <p className="text-slate-500 text-xs leading-tight">Performance Management</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="space-y-3 px-2">
          {[
            { id: 'home', label: 'Home', icon: Home, href: '/', count: realData.totalReps.toString() },
            { id: 'scoring', label: 'Scoring', icon: FilePlus, href: '/scoring', count: realData.totalSubmissions.toString() },
            { id: 'training', label: 'Training', icon: BookOpen, href: '/training', count: 'Library' },
            { id: 'reporting', label: 'Reporting', icon: BarChart3, href: '/reporting', count: realData.totalReps.toString() },
            { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', count: '5' }
          ].map(item => (
            <Link key={item.id} href={item.href}>
              <div className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-[#1F3C88]/10 hover:shadow-md ${
                item.href === '/' ? 'bg-[#1F3C88]/10 shadow-md' : ''
              }`}>
                <item.icon className={`w-6 h-6 text-[#1F3C88] transition-colors`} />
                {sidebarOpen && (
                  <>
                    <span className={`font-medium text-slate-700 group-hover:text-[#1F3C88]`}>
                      {item.label}
                    </span>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-600 group-hover:bg-[#1F3C88]/20 group-hover:text-[#1F3C88]`}>
                      {item.count}
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* Add logout button */}
        {sidebarOpen && (
          <div className="mt-4 px-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-red-50 hover:shadow-md text-red-600"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        )}

        {sidebarOpen && !loading && (
          <div className="mt-8 mx-2 p-4 bg-gradient-to-r from-[#1F3C88]/5 to-blue-500/5 rounded-xl border border-[#1F3C88]/20">
            <h4 className="font-semibold text-[#1F3C88] mb-2">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Team Average</span>
                <span className="font-bold text-green-600">{realData.teamAverage.toFixed(1)}/3.0</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Evaluations</span>
                <span className="font-bold text-[#1F3C88]">{realData.totalSubmissions}</span>
              </div>
            </div>
          </div>
        )}

        {sidebarOpen && (
          <footer className="absolute bottom-6 left-4 right-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
            © {new Date().getFullYear()} Trusted Home Buyers
          </footer>
        )}
      </div>
    </div>
  );

  const StatCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: string;
    change: number;
    icon: any;
    color: string;
  }) => (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
            change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-slate-600 font-medium">{title}</p>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <Sidebar />
        <div className={`${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 flex items-center justify-center min-h-screen`}>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-700 mb-2">Loading Dashboard...</div>
            <p className="text-slate-500">Fetching your team's performance data</p>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
  return (
    <AuthWrapper>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300`}>
        
        {/* Enhanced Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200">
          <div className="px-8 py-8">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-slate-800">Team Scoring Dashboard</h1>
                    <p className="text-slate-600 text-lg">Trusted Home Buyers - Performance Management System</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88] bg-white shadow-sm"
                >
                  <option>All Time</option>
                  <option>This Quarter</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {realData.totalSubmissions === 0 ? (
            // No data state
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-slate-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-600 mb-4">Welcome to TeamScore Pro</h2>
              <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">
                Get started by submitting your first team member evaluation to see performance analytics here.
              </p>
              <Link href="/scoring">
                <Button className="px-8 py-3 text-lg bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg transition-all duration-300">
                  Start Your First Evaluation
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Team Average Score" 
                  value={`${realData.teamAverage.toFixed(1)}`}
                  change={5.2} 
                  icon={Users} 
                  color="from-[#1F3C88] to-blue-600" 
                />
                <StatCard 
                  title="Top Performer" 
                  value={realData.topPerformer.score.toFixed(1)}
                  change={2.1} 
                  icon={Trophy} 
                  color="from-amber-500 to-yellow-500" 
                />
                <StatCard 
                  title="Total Evaluations" 
                  value={realData.totalSubmissions.toString()}
                  change={12.5} 
                  icon={Target} 
                  color="from-emerald-500 to-green-600" 
                />
                <StatCard 
                  title="Active Team Members" 
                  value={realData.totalReps.toString()}
                  change={8.3} 
                  icon={TrendingUp} 
                  color="from-purple-500 to-purple-600" 
                />
              </div>

              {/* Navigation Cards - Enhanced with real stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {sections.map((section) => (
                  <Card
                    key={section.title}
                    className="rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-slate-200 overflow-hidden group hover:-translate-y-1"
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-r ${section.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                          {section.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-2">{section.title}</h2>
                          <p className="text-slate-600 mb-3">{section.description}</p>
                          <div className="text-sm text-slate-500 font-medium">{section.stats}</div>
                        </div>
                        <Link href={section.href} className="w-full">
                          <Button className={`w-full mt-4 bg-gradient-to-r ${section.gradient} hover:shadow-lg transition-all duration-300 text-white border-0 h-12`}>
                            Go to {section.title}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Section */}
              {realData.performanceData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <Card className="shadow-lg border-slate-200">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-800">Performance Trend</h3>
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium px-3 py-1 bg-emerald-100 rounded-full">
                          <ArrowUp className="w-4 h-4" />
                          +12% overall
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={realData.performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#1F3C88" 
                            strokeWidth={4}
                            dot={{ fill: '#1F3C88', strokeWidth: 3, r: 6 }}
                            activeDot={{ r: 8, stroke: '#1F3C88', strokeWidth: 3 }}
                            name="Team Score"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="target" 
                            stroke="#ef4444" 
                            strokeDasharray="8 8"
                            strokeWidth={3}
                            name="Target"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-slate-200">
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-800">Department Performance</h3>
                        <div className="flex items-center gap-2 text-amber-600 text-sm font-medium px-3 py-1 bg-amber-100 rounded-full">
                          <Award className="w-4 h-4" />
                          Top: {realData.topPerformer.name}
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={realData.departmentData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                          <Bar 
                            dataKey="score" 
                            fill="url(#thbGradient)" 
                            radius={[8, 8, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="thbGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1F3C88" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.7}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Performers Section - Real Data */}
              {realData.topPerformers.length > 0 && (
                <Card className="shadow-lg border-slate-200">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold text-slate-800">🏆 Top Performers</h3>
                      <Link href="/reporting">
                        <Button variant="outline" className="text-[#1F3C88] border-[#1F3C88]/30 hover:bg-[#1F3C88]/10">
                          View All Reports →
                        </Button>
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      {realData.topPerformers
                        .slice(0, 5)
                        .map((member, index) => (
                        <div key={member.id} className="flex flex-col items-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border border-slate-200">
                          <div className="relative mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {member.avatar}
                            </div>
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <Trophy className="w-4 h-4 text-yellow-800" />
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index < 3 ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                          <h4 className="font-bold text-slate-800 text-center mb-1">{member.name}</h4>
                          <p className="text-sm text-slate-600 text-center mb-3">{member.role}</p>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800 mb-1">{member.score.toFixed(1)}</div>
                            <div className="flex items-center justify-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${member.trend === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              <span className={`text-xs font-medium ${member.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {member.trend === 'up' ? '+' : '-'}{member.trendValue}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </AuthWrapper>
);
}