"use client";

import React, { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Home, FileText, User, TrendingUp, TrendingDown, Calendar, MapPin, Award, ArrowLeft, Filter, Search, BarChart3 } from "lucide-react";

// --- Types ---
type RepPerformance = {
  name: string;
  overallScore: number;
  percentage: number;
  totalSubmissions: number;
  averageByCategory: Record<string, number>;
  trend: "up" | "down";
  lastEvaluation: string;
};

type Submission = {
  id: string;
  property_address: string;
  submission_date: string;
  qc_agent: string;
  lead_type: "Active" | "Dead";
  overall_average: number;
  final_comment: string;
  scores: Array<{
    section: string;
    question: string;
    rating: number | "NA";
    comment: string;
  }>;
};

// --- Supabase Setup ---
let supabase: SupabaseClient | null = null;
if (typeof window !== "undefined" && !supabase) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  if (url && key) {
    supabase = createClient(url, key);
  }
}

const categories = [
  "Intro", "Bonding & Rapport", "Magic Problem", "First Ask", 
  "Property & Condition Questions", "Second Ask", "Second Call - The Close", "Overall Performance"
];

// --- Mock Data (replace with Supabase queries) ---
const mockRepData: RepPerformance[] = [
  {
    name: "Banele",
    overallScore: 2.8,
    percentage: 93,
    totalSubmissions: 15,
    averageByCategory: {
      "Intro": 2.9,
      "Bonding & Rapport": 3.0,
      "Magic Problem": 2.7,
      "First Ask": 2.8,
      "Property & Condition Questions": 2.9,
      "Second Ask": 2.6,
      "Second Call - The Close": 2.8,
      "Overall Performance": 2.9
    },
    trend: "up",
    lastEvaluation: "2024-01-15"
  },
  {
    name: "Desmaine", 
    overallScore: 2.7,
    percentage: 90,
    totalSubmissions: 12,
    averageByCategory: {
      "Intro": 2.8,
      "Bonding & Rapport": 2.9,
      "Magic Problem": 2.5,
      "First Ask": 2.7,
      "Property & Condition Questions": 2.8,
      "Second Ask": 2.6,
      "Second Call - The Close": 2.6,
      "Overall Performance": 2.7
    },
    trend: "up",
    lastEvaluation: "2024-01-14"
  },
  {
    name: "Tiyani",
    overallScore: 2.6,
    percentage: 87,
    totalSubmissions: 10,
    averageByCategory: {
      "Intro": 2.7,
      "Bonding & Rapport": 2.8,
      "Magic Problem": 2.4,
      "First Ask": 2.6,
      "Property & Condition Questions": 2.7,
      "Second Ask": 2.5,
      "Second Call - The Close": 2.5,
      "Overall Performance": 2.6
    },
    trend: "up",
    lastEvaluation: "2024-01-13"
  }
];

const mockSubmissions: Record<string, Submission[]> = {
  "Banele": [
    {
      id: "1",
      property_address: "123 Oak Street, Tampa, FL 33101",
      submission_date: "2024-01-15",
      qc_agent: "Jennifer",
      lead_type: "Active",
      overall_average: 2.9,
      final_comment: "Exceptional performance on this call. Strong rapport building and closing technique.",
      scores: []
    },
    {
      id: "2", 
      property_address: "456 Pine Avenue, Orlando, FL 32801",
      submission_date: "2024-01-10",
      qc_agent: "Popi",
      lead_type: "Dead",
      overall_average: 2.7,
      final_comment: "Good effort despite lead going dead. Could improve on objection handling.",
      scores: []
    }
  ]
};

// --- Main Component ---
export default function ReportingPage() {
  const [view, setView] = useState<"overview" | "individual">("overview");
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [repData, setRepData] = useState<RepPerformance[]>(mockRepData);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadRepSubmissions = async (repName: string) => {
    setLoading(true);
    // In production, this would be a Supabase query
    // const { data } = await supabase.from('submissions').select('*').eq('sales_rep', repName);
    setSubmissions(mockSubmissions[repName] || []);
    setLoading(false);
  };

  const handleRepClick = (repName: string) => {
    setSelectedRep(repName);
    setView("individual");
    loadRepSubmissions(repName);
  };

  const getRadarData = (rep: RepPerformance) => {
    return categories.map(category => ({
      category: category.replace(" & ", " &\n"),
      score: rep.averageByCategory[category] || 0,
      maxScore: 3
    }));
  };

  const filteredReps = repData.filter(rep => 
    rep.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Overview Dashboard ---
  const OverviewDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Performance Reports</h1>
          <p className="text-slate-600 text-lg">Team performance analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search representatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">2.7</h3>
                <p className="text-slate-600">Team Average Score</p>
                <p className="text-emerald-600 text-sm font-medium">+0.3 this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">37</h3>
                <p className="text-slate-600">Total Evaluations</p>
                <p className="text-blue-600 text-sm font-medium">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">89%</h3>
                <p className="text-slate-600">Improvement Rate</p>
                <p className="text-purple-600 text-sm font-medium">Reps trending up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="shadow-xl border-slate-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Team Performance Leaderboard</h2>
          <div className="space-y-4">
            {filteredReps.map((rep, index) => (
              <div
                key={rep.name}
                onClick={() => handleRepClick(rep.name)}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-slate-200 hover:border-[#1F3C88]/30"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                    'bg-gradient-to-r from-[#1F3C88] to-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {rep.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{rep.name}</h3>
                    <p className="text-slate-600 text-sm">{rep.totalSubmissions} evaluations</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">{rep.overallScore.toFixed(1)}/3.0</div>
                    <div className="text-sm text-slate-600">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{rep.percentage}%</div>
                    <div className="text-sm text-slate-600">Performance</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {rep.trend === "up" ? (
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${rep.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                      {rep.trend === "up" ? "Improving" : "Declining"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // --- Individual Rep Intelligence Dashboard ---
  const IndividualDashboard = () => {
    const rep = repData.find(r => r.name === selectedRep);
    if (!rep) return null;

    const radarData = getRadarData(rep);

    // Intelligence calculations
    const strongestSkill = Object.entries(rep.averageByCategory).reduce((a, b) => a[1] > b[1] ? a : b);
    const weakestSkill = Object.entries(rep.averageByCategory).reduce((a, b) => a[1] < b[1] ? a : b);
    const improvementNeeded = Object.entries(rep.averageByCategory).filter(([_, score]) => score < 2.5);

    // Mock comment patterns (in production, this would analyze actual comments)
    const commentPatterns = {
      strengths: [
        { pattern: "excellent rapport building", frequency: 8, category: "Bonding & Rapport" },
        { pattern: "clear communication", frequency: 6, category: "Intro" },
        { pattern: "confident closing", frequency: 5, category: "Second Call - The Close" }
      ],
      improvements: [
        { pattern: "needs better objection handling", frequency: 4, category: "Second Call - The Close" },
        { pattern: "could improve follow-up", frequency: 3, category: "Second Ask" }
      ]
    };

    // Performance insights
    const insights = [
      `${rep.name} excels at ${strongestSkill[0].toLowerCase()} with a ${strongestSkill[1].toFixed(1)}/3.0 average`,
      `Focus area: ${weakestSkill[0]} (${weakestSkill[1].toFixed(1)}/3.0 - below team average)`,
      `${rep.trend === 'up' ? 'Improving trend' : 'Declining trend'} - ${rep.trend === 'up' ? '+8%' : '-5%'} this month`,
      submissions.filter(s => s.lead_type === "Active").length > submissions.filter(s => s.lead_type === "Dead").length ? 
        "Strong at converting active leads" : "Struggles with lead conversion - may need prospecting training"
    ];

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setView("overview")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>
            <div className="w-16 h-16 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {rep.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">{rep.name}</h1>
              <p className="text-slate-600 text-lg">Performance Intelligence & Analysis</p>
            </div>
          </div>
        </div>

        {/* Executive Summary - Key Insights */}
        <Card className="shadow-xl border-slate-200 bg-gradient-to-r from-[#1F3C88]/5 to-blue-500/5">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#1F3C88]" />
              Executive Summary - Key Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                  <div className="w-6 h-6 bg-[#1F3C88] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#1F3C88] mb-1">{rep.overallScore.toFixed(1)}</div>
              <div className="text-slate-600">Overall Score</div>
              <div className="text-sm text-emerald-600 font-medium">out of 3.0</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{rep.percentage}%</div>
              <div className="text-slate-600">Performance</div>
              <div className="text-sm text-slate-500">Team ranking: #1</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{rep.totalSubmissions}</div>
              <div className="text-slate-600">Evaluations</div>
              <div className="text-sm text-slate-500">This month</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {rep.trend === "up" ? (
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${rep.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                  {rep.trend === "up" ? "↗" : "↘"}
                </span>
              </div>
              <div className="text-slate-600">Trend</div>
              <div className={`text-sm font-medium ${rep.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
                {rep.trend === "up" ? "+8%" : "-5%"} this month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <Card className="shadow-xl border-slate-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Skills Performance Radar</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 3]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickCount={4}
                    />
                    <Radar 
                      name={rep.name}
                      dataKey="score" 
                      stroke="#1F3C88" 
                      fill="#1F3C88" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Skills Strengths & Weaknesses */}
          <Card className="shadow-xl border-slate-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Skills Analysis</h2>
              
              {/* Strongest Skill */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-emerald-600 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Strongest Skill
                </h3>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-emerald-800">{strongestSkill[0]}</span>
                    <span className="text-2xl font-bold text-emerald-600">{strongestSkill[1].toFixed(1)}/3.0</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full" 
                      style={{ width: `${(strongestSkill[1] / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h3 className="text-lg font-bold text-amber-600 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Focus Areas
                </h3>
                <div className="space-y-3">
                  {improvementNeeded.slice(0, 2).map(([skill, score]) => (
                    <div key={skill} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-amber-800">{skill}</span>
                        <span className="text-xl font-bold text-amber-600">{score.toFixed(1)}/3.0</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${(score / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comment Analysis Intelligence */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Comment Pattern Analysis</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Strengths Patterns */}
              <div>
                <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recurring Strengths
                </h3>
                <div className="space-y-3">
                  {commentPatterns.strengths.map((pattern, index) => (
                    <div key={index} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-emerald-800 capitalize">"{pattern.pattern}"</span>
                        <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                          {pattern.frequency}x
                        </span>
                      </div>
                      <div className="text-sm text-emerald-700">
                        Category: {pattern.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Patterns */}
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Areas Mentioned for Improvement
                </h3>
                <div className="space-y-3">
                  {commentPatterns.improvements.map((pattern, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-red-800 capitalize">"{pattern.pattern}"</span>
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                          {pattern.frequency}x
                        </span>
                      </div>
                      <div className="text-sm text-red-700">
                        Category: {pattern.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Recommendations */}
        <Card className="shadow-xl border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              Recommended Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-purple-200 shadow-sm">
                <h3 className="font-bold text-purple-800 mb-3">Training Focus</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>• Advanced objection handling techniques</li>
                  <li>• Follow-up call structuring</li>
                  <li>• Closing technique refinement</li>
                </ul>
              </div>
              <div className="p-6 bg-white rounded-lg border border-blue-200 shadow-sm">
                <h3 className="font-bold text-blue-800 mb-3">Leverage Strengths</h3>
                <ul className="space-y-2 text-slate-700">
                  <li>• Mentor other reps in rapport building</li>
                  <li>• Lead team training sessions</li>
                  <li>• Handle high-value prospect calls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions (Contextual) */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Evaluation Context</h2>
            {loading ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : (
              <div className="space-y-4">
                {submissions.slice(0, 3).map((submission) => (
                  <div key={submission.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <MapPin className="w-5 h-5 text-slate-500" />
                        <div>
                          <h3 className="font-bold text-slate-800">{submission.property_address}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>QC: {submission.qc_agent}</span>
                            <span>{submission.submission_date}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              submission.lead_type === "Active" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}>
                              {submission.lead_type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#1F3C88]">{submission.overall_average.toFixed(1)}</div>
                        <div className="text-sm text-slate-600">Score</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-semibold text-slate-700 mb-2">Key Feedback:</h4>
                      <p className="text-slate-600">{submission.final_comment}</p>
                    </div>
                  </div>
                ))}
                {submissions.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline">View All {submissions.length} Evaluations</Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Performance Reports</h1>
                <p className="text-slate-600">Comprehensive team analytics and insights</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/scoring">
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Scoring
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {view === "overview" ? <OverviewDashboard /> : <IndividualDashboard />}
      </div>
    </div>
  );
}