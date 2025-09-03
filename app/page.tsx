"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
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
  ChevronRight
} from "lucide-react";

export default function HomePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q1 2024');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Your existing sections with Trusted Home Buyers branding
  const sections = [
    {
      title: "Scoring",
      description: "Evaluate and score team members quickly and easily.",
      href: "/scoring",
      icon: <FilePlus className="h-10 w-10 text-white" />,
      gradient: "from-[#1F3C88] to-blue-600",
      stats: "24 Reviews",
    },
    {
      title: "Reporting",
      description: "View analytics and performance reports.",
      href: "/reporting", 
      icon: <BarChart3 className="h-10 w-10 text-white" />,
      gradient: "from-green-500 to-green-600",
      stats: "15 Reports",
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

  // Team members data (your actual team)
  const teamMembers = [
    { id: 1, name: 'Desmaine', role: 'Senior Developer', score: 92, trend: 'up', avatar: 'D' },
    { id: 2, name: 'Jonathan', role: 'Project Manager', score: 88, trend: 'up', avatar: 'J' },
    { id: 3, name: 'Kyle', role: 'UI/UX Designer', score: 85, trend: 'down', avatar: 'K' },
    { id: 4, name: 'Jean', role: 'Backend Developer', score: 90, trend: 'up', avatar: 'J' },
    { id: 5, name: 'JP', role: 'DevOps Engineer', score: 87, trend: 'up', avatar: 'JP' },
    { id: 6, name: 'Phumla', role: 'QA Engineer', score: 89, trend: 'up', avatar: 'P' },
    { id: 7, name: 'Michelle B', role: 'Data Analyst', score: 86, trend: 'down', avatar: 'M' },
    { id: 8, name: 'Tiyani', role: 'Frontend Developer', score: 91, trend: 'up', avatar: 'T' },
    { id: 9, name: 'Hadya', role: 'Business Analyst', score: 84, trend: 'up', avatar: 'H' },
    { id: 10, name: 'Banele', role: 'Full Stack Developer', score: 93, trend: 'up', avatar: 'B' }
  ];

  // Performance data for charts
  const performanceData = [
    { month: 'Jan', score: 75, target: 80 },
    { month: 'Feb', score: 78, target: 80 },
    { month: 'Mar', score: 82, target: 80 },
    { month: 'Apr', score: 85, target: 85 },
    { month: 'May', score: 88, target: 85 },
    { month: 'Jun', score: 87, target: 85 }
  ];

  const departmentData = [
    { name: 'Development', score: 89 },
    { name: 'Design', score: 85 },
    { name: 'QA', score: 92 },
    { name: 'DevOps', score: 87 },
    { name: 'Analysis', score: 88 }
  ];

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-white via-slate-50 to-white border-r border-slate-200 shadow-xl h-screen fixed left-0 top-0 z-50 transition-all duration-300`}>
      <div className="p-6">
        {/* Trusted Home Buyers Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src="/THB.webp"
              alt="Trusted Home Buyers Logo"
              className="h-12 object-contain"
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
        
        <nav className="space-y-3">
          {[
            { id: 'home', label: 'Home', icon: Home, href: '/', count: '5' },
            { id: 'scoring', label: 'Scoring', icon: FilePlus, href: '/scoring', count: '24' },
            { id: 'reporting', label: 'Reporting', icon: BarChart3, href: '/reporting', count: '15' },
            { id: 'settings', label: 'Settings', icon: Settings, href: '/settings', count: '8' }
          ].map(item => (
            <Link key={item.id} href={item.href}>
              <div className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group hover:bg-[#1F3C88]/10 hover:shadow-md`}>
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

        {sidebarOpen && (
          <div className="mt-8 p-4 bg-gradient-to-r from-[#1F3C88]/5 to-blue-500/5 rounded-xl border border-[#1F3C88]/20">
            <h4 className="font-semibold text-[#1F3C88] mb-2">Quick Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Team Average</span>
                <span className="font-bold text-green-600">88.2%</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>This Month</span>
                <span className="font-bold text-[#1F3C88]">+5.2%</span>
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

  return (
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
                  <option>Q1 2024</option>
                  <option>Q2 2024</option>
                  <option>Q3 2024</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Team Average Score" 
              value="88.2" 
              change={5.2} 
              icon={Users} 
              color="from-[#1F3C88] to-blue-600" 
            />
            <StatCard 
              title="Top Performer" 
              value="93" 
              change={2.1} 
              icon={Trophy} 
              color="from-amber-500 to-yellow-500" 
            />
            <StatCard 
              title="Projects Completed" 
              value="24" 
              change={12.5} 
              icon={Target} 
              color="from-emerald-500 to-green-600" 
            />
            <StatCard 
              title="Improvement Rate" 
              value="15%" 
              change={8.3} 
              icon={TrendingUp} 
              color="from-purple-500 to-purple-600" 
            />
          </div>

          {/* Navigation Cards - Enhanced with THB branding */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="shadow-lg border-slate-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Performance Trend</h3>
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium px-3 py-1 bg-emerald-100 rounded-full">
                    <ArrowUp className="w-4 h-4" />
                    +12% this quarter
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={performanceData}>
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
                    QA Leading
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={departmentData}>
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

          {/* Top Performers Section */}
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-slate-800">🏆 Top Performers This Month</h3>
                <Link href="/reporting">
                  <Button variant="outline" className="text-[#1F3C88] border-[#1F3C88]/30 hover:bg-[#1F3C88]/10">
                    View All Reports →
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {teamMembers
                  .sort((a, b) => b.score - a.score)
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
                      <div className="text-2xl font-bold text-slate-800 mb-1">{member.score}</div>
                      <div className="flex items-center justify-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${member.trend === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${member.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {member.trend === 'up' ? '+' : '-'}{Math.floor(Math.random() * 5) + 1}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}