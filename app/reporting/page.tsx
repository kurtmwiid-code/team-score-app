'use client'

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Search, Filter, ChevronDown, ChevronUp, Eye, Trash2, Edit, Save, X, AlertTriangle, Award, Users, TrendingUp, BarChart3, Home, FileText, Calendar, MapPin } from "lucide-react";

// --- Supabase Setup (Fixed) ---
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Types ---
type RepPerformance = {
  name: string;
  overallScore: number;
  percentage: number;
  totalSubmissions: number;
  averageByCategory: Record<string, number>;
  trend: "up" | "down";
  lastEvaluation: string;
  recentSubmissions: Submission[];
};

type Submission = {
  id: string;
  property_address: string;
  submission_date: string;
  qc_agent: string;
  sales_rep: string;
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

type EditableSubmission = {
  sales_rep: string;
  qc_agent: string;
  property_address: string;
  lead_type: "Active" | "Dead";
  final_comment: string;
};

type TeamStats = {
  teamAverage: number;
  totalEvaluations: number;
  improvementRate: number;
  monthlyChange: number;
  activeLeadRate: number;
  totalProperties: number;
};

const categories = [
  "Intro", "Bonding & Rapport", "Magic Problem", "First Ask", 
  "Property & Condition Questions", "Second Ask", "Second Call - The Close", "Overall Performance"
];

// --- Enhanced Header Component ---
const AppHeader = memo(({ currentView }: { currentView: string }) => (
  <div className="bg-gradient-to-r from-[#1F3C88] to-[#2B5AA0] text-white mb-8">
    <div className="max-w-7xl mx-auto px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Performance Reports</h1>
            <p className="text-blue-100">Comprehensive team analytics and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </a>
          <a href="/scoring" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Scoring
          </a>
        </div>
      </div>
    </div>
  </div>
));

// --- Team Stats Component ---
const TeamStatsCards = memo(({ stats }: { stats: TeamStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
    {/* Team Average Score */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{stats.teamAverage.toFixed(1)}</h3>
          <p className="text-slate-600 text-sm">Team Average</p>
          <p className="text-emerald-600 text-xs font-medium">+{stats.monthlyChange.toFixed(1)} this month</p>
        </div>
      </div>
    </div>

    {/* Total Evaluations */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{stats.totalEvaluations}</h3>
          <p className="text-slate-600 text-sm">Total Evaluations</p>
          <p className="text-blue-600 text-xs font-medium">All time</p>
        </div>
      </div>
    </div>

    {/* Improvement Rate */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{stats.improvementRate}%</h3>
          <p className="text-slate-600 text-sm">Improvement Rate</p>
          <p className="text-purple-600 text-xs font-medium">Trending up</p>
        </div>
      </div>
    </div>

    {/* Active Lead Rate */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{stats.activeLeadRate}%</h3>
          <p className="text-slate-600 text-sm">Active Lead Rate</p>
          <p className="text-green-600 text-xs font-medium">Success rate</p>
        </div>
      </div>
    </div>

    {/* Total Properties */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
          <MapPin className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{stats.totalProperties}</h3>
          <p className="text-slate-600 text-sm">Properties</p>
          <p className="text-orange-600 text-xs font-medium">Evaluated</p>
        </div>
      </div>
    </div>

    {/* This Month */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-slate-800">{new Date().getDate()}</h3>
          <p className="text-slate-600 text-sm">Days This Month</p>
          <p className="text-indigo-600 text-xs font-medium">{new Date().toLocaleString('default', { month: 'long' })}</p>
        </div>
      </div>
    </div>
  </div>
));

// --- Enhanced Rep Card Component ---
const RepCard = memo(({ rep, index, onRepClick }: { 
  rep: RepPerformance; 
  index: number; 
  onRepClick: (name: string) => void; 
}) => {
  const getBadgeStyle = (index: number) => {
    switch(index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-500'; // Gold
      case 1: return 'bg-gradient-to-r from-gray-400 to-gray-500'; // Silver  
      case 2: return 'bg-gradient-to-r from-orange-400 to-orange-500'; // Bronze
      default: return 'bg-gradient-to-r from-[#1F3C88] to-[#2B4F8F]'; // Blue
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div 
        onClick={() => onRepClick(rep.name)}
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getBadgeStyle(index)}`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{rep.name}</h3>
              <p className="text-sm text-gray-600">{rep.totalSubmissions} evaluations</p>
              <p className="text-xs text-gray-500">Last: {new Date(rep.lastEvaluation).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getPerformanceColor(rep.percentage)}`}>
                {rep.percentage}%
              </div>
              <div className="text-sm text-gray-600">Performance</div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-semibold text-gray-900">
                {rep.overallScore.toFixed(1)}/3.0
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${rep.trend === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium flex items-center gap-1 ${rep.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-3 h-3 ${rep.trend === 'down' ? 'rotate-180' : ''}`} />
                {rep.trend === 'up' ? 'Improving' : 'Needs Focus'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Team Leaderboard Component ---
const TeamLeaderboard = memo(({ repData, onRepClick }: { 
  repData: RepPerformance[]; 
  onRepClick: (name: string) => void; 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Performance Leaderboard</h2>
    <div className="space-y-4">
      {repData.slice(0, 10).map((rep, index) => (
        <RepCard
          key={rep.name}
          rep={rep}
          index={index}
          onRepClick={onRepClick}
        />
      ))}
    </div>
  </div>
));

// --- Submission Card Component ---
const SubmissionCard = memo(({ 
  submission, 
  onEdit, 
  onDelete, 
  onExpand, 
  isExpanded, 
  editingSubmission, 
  editForm, 
  onSaveEdit, 
  onCancelEdit, 
  onEditFormChange 
}: {
  submission: Submission;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExpand: (id: string) => void;
  isExpanded: boolean;
  editingSubmission: string | null;
  editForm: EditableSubmission;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditFormChange: (field: keyof EditableSubmission, value: string) => void;
}) => {
  const isEditing = editingSubmission === submission.id;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-[#2B4F8F] rounded-xl flex items-center justify-center text-white font-bold">
              {submission.overall_average.toFixed(1)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.property_address}
                    onChange={(e) => onEditFormChange('property_address', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  submission.property_address
                )}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(submission.submission_date).toLocaleDateString()} • QC: {submission.qc_agent}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              submission.lead_type === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isEditing ? (
                <select
                  value={editForm.lead_type}
                  onChange={(e) => onEditFormChange('lead_type', e.target.value as "Active" | "Dead")}
                  className="border border-gray-300 rounded px-1 text-xs"
                >
                  <option value="Active">Active</option>
                  <option value="Dead">Dead</option>
                </select>
              ) : (
                submission.lead_type
              )}
            </span>
            {isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={onSaveEdit}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(submission.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExpand(submission.id)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(submission.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sales Rep and Comments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Sales Rep:</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.sales_rep}
                onChange={(e) => onEditFormChange('sales_rep', e.target.value)}
                className="block w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
              />
            ) : (
              <p className="text-gray-900 mt-1">{submission.sales_rep}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">QC Agent:</label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.qc_agent}
                onChange={(e) => onEditFormChange('qc_agent', e.target.value)}
                className="block w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
              />
            ) : (
              <p className="text-gray-900 mt-1">{submission.qc_agent}</p>
            )}
          </div>
        </div>

        {/* Final Comment */}
        {(submission.final_comment || isEditing) && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">Final Comment:</label>
            {isEditing ? (
              <textarea
                value={editForm.final_comment}
                onChange={(e) => onEditFormChange('final_comment', e.target.value)}
                className="block w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1"
                rows={3}
              />
            ) : (
              <p className="text-gray-900 mt-1">{submission.final_comment}</p>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => onExpand(submission.id)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">Detailed Scores</h4>
          <div className="grid gap-4">
            {categories.map(category => {
              const categoryScores = submission.scores.filter(score => score.section === category);
              const avgScore = categoryScores.length > 0 
                ? categoryScores.reduce((sum, score) => sum + (typeof score.rating === 'number' ? score.rating : 0), 0) / categoryScores.length 
                : 0;

              return (
                <div key={category} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">{category}</h5>
                    <span className="text-sm font-medium text-gray-600">Avg: {avgScore.toFixed(1)}</span>
                  </div>
                  <div className="space-y-2">
                    {categoryScores.map((score, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{score.question}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            score.rating === 'NA' ? 'bg-gray-100 text-gray-600' :
                            score.rating === 1 ? 'bg-red-100 text-red-800' :
                            score.rating === 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {score.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

// --- Main Component ---
export default function ReportingPage() {
  const [view, setView] = useState<"overview" | "individual">("overview");
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [repData, setRepData] = useState<RepPerformance[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [editingSubmission, setEditingSubmission] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableSubmission>({
    sales_rep: '',
    qc_agent: '',
    property_address: '',
    lead_type: 'Active',
    final_comment: ''
  });

  // Load real data from Supabase
  useEffect(() => {
    loadRepData();
  }, []);

  const loadRepData = async () => {
    try {
      setLoading(true);
      
      // Get all submissions with their scores
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_scores(*)
        `)
        .order('submission_date', { ascending: false });

      if (submissionsError) {
        console.error("Error loading submissions:", submissionsError);
        setLoading(false);
        return;
      }

      // Transform the data
      const transformedSubmissions: Submission[] = submissionsData.map(sub => ({
        id: sub.id,
        property_address: sub.property_address,
        submission_date: sub.submission_date,
        qc_agent: sub.qc_agent,
        sales_rep: sub.sales_rep,
        lead_type: sub.lead_type,
        overall_average: sub.overall_average,
        final_comment: sub.final_comment || '',
        scores: sub.submission_scores?.map((score: any) => ({
          section: score.section,
          question: score.question,
          rating: score.rating === 'NA' ? 'NA' : parseInt(score.rating),
          comment: score.comment || ''
        })) || []
      }));

      setSubmissions(transformedSubmissions);

      // Calculate rep performance data
      const repPerformance = calculateRepPerformance(transformedSubmissions);
      setRepData(repPerformance);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRepPerformance = useCallback((submissions: Submission[]): RepPerformance[] => {
    const repMap = new Map<string, RepPerformance>();

    submissions.forEach(submission => {
      const repName = submission.sales_rep;
      
      if (!repMap.has(repName)) {
        repMap.set(repName, {
          name: repName,
          overallScore: 0,
          percentage: 0,
          totalSubmissions: 0,
          averageByCategory: {},
          trend: "up", // Default to up, could be calculated from historical data
          lastEvaluation: submission.submission_date,
          recentSubmissions: []
        });
      }

      const rep = repMap.get(repName)!;
      rep.totalSubmissions += 1;
      rep.overallScore += submission.overall_average;
      rep.recentSubmissions.push(submission);

      // Update last evaluation date
      if (new Date(submission.submission_date) > new Date(rep.lastEvaluation)) {
        rep.lastEvaluation = submission.submission_date;
      }

      // Calculate category averages
      categories.forEach(category => {
        const categoryScores = submission.scores.filter(score => score.section === category);
        if (categoryScores.length > 0) {
          const categoryAvg = categoryScores.reduce((sum, score) => 
            sum + (typeof score.rating === 'number' ? score.rating : 0), 0
          ) / categoryScores.length;
          
          if (!rep.averageByCategory[category]) {
            rep.averageByCategory[category] = 0;
          }
          rep.averageByCategory[category] += categoryAvg;
        }
      });
    });

    // Finalize calculations
    const reps = Array.from(repMap.values()).map(rep => {
      rep.overallScore = rep.overallScore / rep.totalSubmissions;
      rep.percentage = Math.round((rep.overallScore / 3) * 100);
      
      // Average the category scores
      Object.keys(rep.averageByCategory).forEach(category => {
        rep.averageByCategory[category] = rep.averageByCategory[category] / rep.totalSubmissions;
      });

      // Sort recent submissions by date (newest first)
      rep.recentSubmissions.sort((a, b) => new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime());

      return rep;
    });

    return reps.sort((a, b) => b.overallScore - a.overallScore);
  }, []);

  // Calculate team stats
  const teamStats = useMemo((): TeamStats => {
    if (repData.length === 0 || submissions.length === 0) {
      return { teamAverage: 0, totalEvaluations: 0, improvementRate: 0, monthlyChange: 0, activeLeadRate: 0, totalProperties: 0 };
    }

    const teamAverage = repData.reduce((sum, rep) => sum + rep.overallScore, 0) / repData.length;
    const totalEvaluations = repData.reduce((sum, rep) => sum + rep.totalSubmissions, 0);
    const improvingReps = repData.filter(rep => rep.trend === 'up').length;
    const improvementRate = Math.round((improvingReps / repData.length) * 100);
    
    const activeLeads = submissions.filter(sub => sub.lead_type === 'Active').length;
    const activeLeadRate = Math.round((activeLeads / submissions.length) * 100);
    
    const uniqueProperties = new Set(submissions.map(sub => sub.property_address)).size;
    
    return {
      teamAverage,
      totalEvaluations,
      improvementRate,
      monthlyChange: 0.3, // Mock value - could be calculated from historical data
      activeLeadRate,
      totalProperties: uniqueProperties
    };
  }, [repData, submissions]);

  // Event handlers
  const handleRepClick = useCallback((repName: string) => {
    setSelectedRep(repName);
    setView("individual");
  }, []);

  const handleBackToOverview = useCallback(() => {
    setView("overview");
    setSelectedRep(null);
    setSearchTerm("");
  }, []);

  const handleExpandSubmission = useCallback((submissionId: string) => {
    setExpandedSubmissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  }, []);

  const handleEditSubmission = useCallback((submissionId: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
      setEditForm({
        sales_rep: submission.sales_rep,
        qc_agent: submission.qc_agent,
        property_address: submission.property_address,
        lead_type: submission.lead_type as "Active" | "Dead",
        final_comment: submission.final_comment
      });
      setEditingSubmission(submissionId);
    }
  }, [submissions]);

  const handleSaveEdit = useCallback(async () => {
    if (!editingSubmission) return;

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          sales_rep: editForm.sales_rep,
          qc_agent: editForm.qc_agent,
          property_address: editForm.property_address,
          lead_type: editForm.lead_type,
          final_comment: editForm.final_comment
        })
        .eq('id', editingSubmission);

      if (error) {
        console.error('Error updating submission:', error);
        return;
      }

      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === editingSubmission 
          ? { ...sub, ...editForm }
          : sub
      ));

      setEditingSubmission(null);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  }, [editingSubmission, editForm]);

  const handleCancelEdit = useCallback(() => {
    setEditingSubmission(null);
  }, []);

  const handleEditFormChange = useCallback((field: keyof EditableSubmission, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleDeleteSubmission = useCallback(async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      // Delete scores first
      await supabase
        .from('submission_scores')
        .delete()
        .eq('submission_id', submissionId);

      // Delete submission
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);

      if (error) {
        console.error('Error deleting submission:', error);
        return;
      }

      // Update local state
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      
      // Recalculate rep data
      const updatedSubmissions = submissions.filter(sub => sub.id !== submissionId);
      const repPerformance = calculateRepPerformance(updatedSubmissions);
      setRepData(repPerformance);

    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  }, [submissions, calculateRepPerformance]);

  // Filtered data
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(submission => {
      const matchesRep = !selectedRep || submission.sales_rep === selectedRep;
      const matchesSearch = !searchTerm || 
        submission.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.sales_rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.qc_agent.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesRep && matchesSearch;
    });
  }, [submissions, selectedRep, searchTerm]);

  const selectedRepData = useMemo(() => {
    return repData.find(rep => rep.name === selectedRep);
  }, [repData, selectedRep]);

  // Group submissions by date for better organization
  const groupedSubmissions = useMemo(() => {
    const grouped: Record<string, Submission[]> = {};
    filteredSubmissions.forEach(submission => {
      const date = new Date(submission.submission_date).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(submission);
    });
    return grouped;
  }, [filteredSubmissions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <AppHeader currentView="loading" />
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <AppHeader currentView={view} />
      
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {view === "overview" ? (
          /* Overview View */
          <div className="space-y-8">
            {/* Team Performance Stats */}
            <TeamStatsCards stats={teamStats} />

            {/* Search and Filter Bar */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search representatives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent bg-white"
                />
              </div>
              <button 
                onClick={loadRepData}
                className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Team Performance Leaderboard */}
            <TeamLeaderboard 
              repData={repData.filter(rep => !searchTerm || rep.name.toLowerCase().includes(searchTerm.toLowerCase()))} 
              onRepClick={handleRepClick} 
            />

            {/* Show message if no data */}
            {repData.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No evaluations yet</h3>
                <p className="text-gray-600 mb-6">Submit some evaluations first to see performance reports.</p>
                <a 
                  href="/scoring" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1F3C88] to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Start Scoring
                </a>
              </div>
            )}
          </div>
        ) : (
          /* Individual Rep View */
          <div className="space-y-8">
            {/* Back Button and Rep Header */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToOverview}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-white/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </button>
            </div>

            {/* Selected Rep Performance Card */}
            {selectedRepData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#1F3C88] to-[#2B4F8F] rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      {selectedRepData.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedRepData.name}</h2>
                      <p className="text-gray-600">{selectedRepData.totalSubmissions} total evaluations</p>
                      <p className="text-sm text-gray-500">Last evaluation: {new Date(selectedRepData.lastEvaluation).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{selectedRepData.percentage}%</div>
                      <div className="text-sm text-gray-600">Performance</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{selectedRepData.overallScore.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search for submissions */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent bg-white"
              />
            </div>

            {/* Date-Grouped Submissions List */}
            <div className="space-y-8">
              {Object.keys(groupedSubmissions).length > 0 ? (
                Object.entries(groupedSubmissions)
                  .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                  .map(([date, dateSubmissions]) => (
                    <div key={date} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {date}
                        <span className="text-sm font-normal text-gray-500">
                          ({dateSubmissions.length} evaluation{dateSubmissions.length !== 1 ? 's' : ''})
                        </span>
                      </h3>
                      <div className="space-y-4 ml-7">
                        {dateSubmissions.map(submission => (
                          <SubmissionCard
                            key={submission.id}
                            submission={submission}
                            onEdit={handleEditSubmission}
                            onDelete={handleDeleteSubmission}
                            onExpand={handleExpandSubmission}
                            isExpanded={expandedSubmissions.has(submission.id)}
                            editingSubmission={editingSubmission}
                            editForm={editForm}
                            onSaveEdit={handleSaveEdit}
                            onCancelEdit={handleCancelEdit}
                            onEditFormChange={handleEditFormChange}
                          />
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `No submissions match "${searchTerm}"`
                      : selectedRep 
                        ? `No submissions found for ${selectedRep}`
                        : "No submissions available"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}