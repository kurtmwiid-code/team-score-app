"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthWrapper from '@/components/AuthWrapper'; 
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Home, FileText, User, TrendingUp, TrendingDown, Calendar, MapPin, Award, ArrowLeft, Filter, Search, ChevronDown, ChevronUp, Eye, Trash2, Edit, Save, X, AlertTriangle } from "lucide-react";

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

// --- Supabase Setup (Fixed) ---
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHEtnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  "Intro", "Bonding & Rapport", "Magic Problem", "First Ask", 
  "Property & Condition Questions", "Second Ask", "Second Call - The Close", "Overall Performance"
];

// --- Memoized Components for Performance ---
const RepCard = memo(({ rep, index, onRepClick }: { 
  rep: RepPerformance; 
  index: number; 
  onRepClick: (name: string) => void; 
}) => (
  <div
    onClick={() => onRepClick(rep.name)}
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
          {rep.trend === "up" ? "Improving" : "Needs Focus"}
        </span>
      </div>
    </div>
  </div>
));

const SubmissionCard = memo(({ 
  submission, 
  expanded, 
  onToggleExpansion, 
  onSubmissionClick, 
  onEditClick, 
  onDeleteClick 
}: {
  submission: Submission;
  expanded: boolean;
  onToggleExpansion: (id: string) => void;
  onSubmissionClick: (submission: Submission) => void;
  onEditClick: (submission: Submission) => void;
  onDeleteClick: (id: string) => void;
}) => (
  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
    <div 
      className="p-6 hover:bg-slate-100 cursor-pointer transition-colors"
      onClick={() => onToggleExpansion(submission.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <MapPin className="w-5 h-5 text-slate-500" />
          <div>
            <h3 className="font-bold text-slate-800">{submission.property_address}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>Sales Rep: {submission.sales_rep}</span>
              <span>QC Agent: {submission.qc_agent}</span>
              <span>Date: {submission.submission_date}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                submission.lead_type === "Active" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {submission.lead_type} Lead
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#1F3C88]">{submission.overall_average.toFixed(1)}</div>
            <div className="text-sm text-slate-600">Score</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(submission);
            }}
            className="flex items-center gap-2 text-blue-600 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSubmissionClick(submission);
            }}
            className="flex items-center gap-2 text-[#1F3C88] hover:bg-[#1F3C88]/10"
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this submission?')) {
                onDeleteClick(submission.id);
              }
            }}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
      
      {submission.final_comment && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold text-slate-700 mb-2">Final Comments:</h4>
          <p className="text-slate-600">{submission.final_comment}</p>
        </div>
      )}
    </div>

    {/* Expandable Detailed Scores */}
    {expanded && (
      <div className="px-6 pb-6 bg-white border-t border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Detailed Scores:</h4>
        <div className="grid gap-4">
          {submission.scores.map((score, index) => (
            <div key={index} className="flex justify-between items-start p-4 bg-slate-50 rounded-lg">
              <div className="flex-1">
                <h5 className="font-medium text-slate-800 mb-1">{score.section}</h5>
                <p className="text-sm text-slate-600 mb-2">{score.question}</p>
                {score.comment && (
                  <p className="text-sm text-slate-500 italic">"{score.comment}"</p>
                )}
              </div>
              <div className="ml-4 text-center">
                <div className={`text-lg font-bold ${
                  score.rating === "NA" ? "text-slate-400" :
                  typeof score.rating === "number" && score.rating >= 2.5 ? "text-emerald-600" :
                  typeof score.rating === "number" && score.rating >= 2 ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {score.rating === "NA" ? "N/A" : score.rating}
                </div>
                <div className="text-xs text-slate-500">
                  {score.rating !== "NA" && "out of 3"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
));

// --- Edit Modal Component ---
const EditSubmissionModal = ({ 
  submission, 
  isOpen, 
  onClose, 
  onSave 
}: {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: EditableSubmission) => Promise<void>;
}) => {
  const [editData, setEditData] = useState<EditableSubmission>({
    sales_rep: '',
    qc_agent: '',
    property_address: '',
    lead_type: 'Active',
    final_comment: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (submission) {
      setEditData({
        sales_rep: submission.sales_rep,
        qc_agent: submission.qc_agent,
        property_address: submission.property_address,
        lead_type: submission.lead_type,
        final_comment: submission.final_comment || ''
      });
    }
  }, [submission]);

  const handleSave = async () => {
    if (!submission) return;
    
    setSaving(true);
    try {
      await onSave(submission.id, editData);
      onClose();
    } catch (error) {
      console.error('Error saving submission:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Edit Submission</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sales Representative
              </label>
              <input
                type="text"
                value={editData.sales_rep}
                onChange={(e) => setEditData(prev => ({ ...prev, sales_rep: e.target.value }))}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                QC Agent
              </label>
              <input
                type="text"
                value={editData.qc_agent}
                onChange={(e) => setEditData(prev => ({ ...prev, qc_agent: e.target.value }))}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Property Address
            </label>
            <input
              type="text"
              value={editData.property_address}
              onChange={(e) => setEditData(prev => ({ ...prev, property_address: e.target.value }))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lead Type
            </label>
            <select
              value={editData.lead_type}
              onChange={(e) => setEditData(prev => ({ ...prev, lead_type: e.target.value as "Active" | "Dead" }))}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
            >
              <option value="Active">Active</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Final Comments
            </label>
            <textarea
              value={editData.final_comment}
              onChange={(e) => setEditData(prev => ({ ...prev, final_comment: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
              placeholder="Enter final evaluation comments..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-[#1F3C88] to-blue-600"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function ReportingPage() {
  const [view, setView] = useState<"overview" | "individual" | "submission">("overview");
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [repData, setRepData] = useState<RepPerformance[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [dataCache, setDataCache] = useState<{
    repData: RepPerformance[];
    timestamp: number;
  } | null>(null);

  // Memoized calculations for performance
  const filteredReps = useMemo(() => 
    repData.filter(rep => 
      rep.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
    [repData, searchTerm]
  );

  const teamStats = useMemo(() => {
    const teamAverage = repData.length > 0 
      ? repData.reduce((acc, rep) => acc + rep.overallScore, 0) / repData.length 
      : 0;
    
    const totalEvaluations = repData.reduce((acc, rep) => acc + rep.totalSubmissions, 0);
    const improvingReps = repData.filter(rep => rep.trend === "up").length;
    const improvementRate = repData.length > 0 ? Math.round((improvingReps / repData.length) * 100) : 0;

    return { teamAverage, totalEvaluations, improvementRate };
  }, [repData]);

  // Load real data from Supabase with caching
  const loadRepData = useCallback(async (forceRefresh = false) => {
    // Check cache first (5 minutes TTL)
    const now = Date.now();
    if (!forceRefresh && dataCache && (now - dataCache.timestamp) < 5 * 60 * 1000) {
      setRepData(dataCache.repData);
      setLoading(false);
      return;
    }

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

      // Process data into rep performance summaries
      const repSummaries: Record<string, {
        submissions: any[];
        totalScore: number;
        scoreCount: number;
        categoryTotals: Record<string, { total: number; count: number }>;
      }> = {};

      submissionsData?.forEach((submission: any) => {
        if (!repSummaries[submission.sales_rep]) {
          repSummaries[submission.sales_rep] = {
            submissions: [],
            totalScore: 0,
            scoreCount: 0,
            categoryTotals: {}
          };
        }

        const repSummary = repSummaries[submission.sales_rep];
        repSummary.submissions.push(submission);
        
        if (submission.overall_average) {
          repSummary.totalScore += submission.overall_average;
          repSummary.scoreCount += 1;
        }

        // Process category averages
        submission.submission_scores?.forEach((score: any) => {
          if (score.rating !== 'NA') {
            if (!repSummary.categoryTotals[score.section]) {
              repSummary.categoryTotals[score.section] = { total: 0, count: 0 };
            }
            repSummary.categoryTotals[score.section].total += parseFloat(score.rating);
            repSummary.categoryTotals[score.section].count += 1;
          }
        });
      });

      // Convert to RepPerformance array
      const repPerformanceData: RepPerformance[] = Object.entries(repSummaries).map(([repName, summary]) => {
        const overallScore = summary.scoreCount > 0 ? summary.totalScore / summary.scoreCount : 0;
        const averageByCategory: Record<string, number> = {};
        
        Object.entries(summary.categoryTotals).forEach(([category, totals]) => {
          averageByCategory[category] = totals.count > 0 ? totals.total / totals.count : 0;
        });

        return {
          name: repName,
          overallScore: Math.round(overallScore * 100) / 100,
          percentage: Math.round((overallScore / 3) * 100),
          totalSubmissions: summary.submissions.length,
          averageByCategory,
          trend: Math.random() > 0.3 ? "up" : "down", // Simplified for now
          lastEvaluation: summary.submissions[0]?.submission_date || ""
        };
      });

      // Sort by score descending
      repPerformanceData.sort((a, b) => b.overallScore - a.overallScore);
      
      setRepData(repPerformanceData);
      
      // Update cache
      setDataCache({
        repData: repPerformanceData,
        timestamp: now
      });
    } catch (error) {
      console.error("Error processing rep data:", error);
    } finally {
      setLoading(false);
    }
  }, [dataCache]);

  const loadRepSubmissions = useCallback(async (repName: string) => {
    setLoading(true);
    try {
      const { data: submissionsData, error } = await supabase
        .from('submissions')
        .select(`
          *,
          submission_scores(*)
        `)
        .eq('sales_rep', repName)
        .order('submission_date', { ascending: false });

      if (error) {
        console.error("Error loading rep submissions:", error);
        return;
      }
      
      // Transform the data
      const transformedSubmissions: Submission[] = submissionsData?.map((submission: any) => ({
        id: submission.id.toString(),
        property_address: submission.property_address,
        submission_date: submission.submission_date,
        qc_agent: submission.qc_agent,
        sales_rep: submission.sales_rep,
        lead_type: submission.lead_type,
        overall_average: submission.overall_average,
        final_comment: submission.final_comment || "",
        scores: submission.submission_scores || []
      })) || [];

      setSubmissions(transformedSubmissions);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRepData();
  }, [loadRepData]);

  const handleRepClick = useCallback((repName: string) => {
    setSelectedRep(repName);
    setView("individual");
    loadRepSubmissions(repName);
  }, [loadRepSubmissions]);

  const handleSubmissionClick = useCallback((submission: Submission) => {
    setSelectedSubmission(submission);
    setView("submission");
  }, []);

  const toggleSubmissionExpansion = useCallback((submissionId: string) => {
    setExpandedSubmissions(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(submissionId)) {
        newExpanded.delete(submissionId);
      } else {
        newExpanded.add(submissionId);
      }
      return newExpanded;
    });
  }, []);

  const handleEditSubmission = useCallback(async (id: string, updates: EditableSubmission) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          sales_rep: updates.sales_rep,
          qc_agent: updates.qc_agent,
          property_address: updates.property_address,
          lead_type: updates.lead_type,
          final_comment: updates.final_comment
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh data
      if (selectedRep) {
        await loadRepSubmissions(selectedRep);
      }
      await loadRepData(true); // Force refresh
      
      // Update selected submission if it's the one being edited
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission(prev => prev ? {
          ...prev,
          ...updates
        } : null);
      }
      
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }, [selectedRep, selectedSubmission, loadRepSubmissions, loadRepData]);

  const deleteSubmission = useCallback(async (submissionId: string) => {
    try {
      // Delete submission scores first (foreign key constraint)
      const { error: scoresError } = await supabase
        .from('submission_scores')
        .delete()
        .eq('submission_id', submissionId);
      
      if (scoresError) throw scoresError;
      
      // Then delete the main submission
      const { error: submissionError } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submissionId);
      
      if (submissionError) throw submissionError;
      
      // Refresh data
      if (selectedRep) {
        await loadRepSubmissions(selectedRep);
      }
      await loadRepData(true); // Force refresh
      
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Error deleting submission. Please try again.');
    }
  }, [selectedRep, loadRepSubmissions, loadRepData]);

  const getRadarData = useCallback((rep: RepPerformance) => {
    return categories.map(category => ({
      category: category.replace(" & ", " &\n"),
      score: rep.averageByCategory[category] || 0,
      maxScore: 3
    }));
  }, []);

  // --- Overview Dashboard ---
  const OverviewDashboard = memo(() => (
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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => loadRepData(true)}
          >
            <Filter className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg font-semibold text-slate-600">Loading performance data...</div>
        </div>
      )}

      {!loading && repData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-xl font-semibold text-slate-600 mb-2">No Data Available</div>
          <p className="text-slate-500">No scoring submissions found. Submit some evaluations first.</p>
          <Link href="/scoring">
            <Button className="mt-4 bg-gradient-to-r from-[#1F3C88] to-blue-600">
              Start Scoring
            </Button>
          </Link>
        </div>
      )}

      {!loading && repData.length > 0 && (
        <>
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">{teamStats.teamAverage.toFixed(1)}</h3>
                    <p className="text-slate-600">Team Average Score</p>
                    <p className="text-emerald-600 text-sm font-medium">out of 3.0</p>
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
                    <h3 className="text-2xl font-bold text-slate-800">{teamStats.totalEvaluations}</h3>
                    <p className="text-slate-600">Total Evaluations</p>
                    <p className="text-blue-600 text-sm font-medium">All time</p>
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
                    <h3 className="text-2xl font-bold text-slate-800">{teamStats.improvementRate}%</h3>
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
                  <RepCard
                    key={rep.name}
                    rep={rep}
                    index={index}
                    onRepClick={handleRepClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  ));

  // --- Individual Rep Dashboard ---
  const IndividualDashboard = memo(() => {
    const rep = repData.find(r => r.name === selectedRep);
    if (!rep) return null;

    return (
      <div className="space-y-8">
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
              <p className="text-slate-600 text-lg">Performance Analysis & Submission History</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
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
              <div className="text-sm text-slate-500">Team ranking: #{repData.findIndex(r => r.name === rep.name) + 1}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{rep.totalSubmissions}</div>
              <div className="text-slate-600">Total Evaluations</div>
              <div className="text-sm text-slate-500">All time</div>
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
                {rep.trend === "up" ? "Improving" : "Needs Focus"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions History with Expandable Details */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Evaluation History</h2>
            {loading ? (
              <div className="text-center py-8">Loading submissions...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No submissions found for this representative.</div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    expanded={expandedSubmissions.has(submission.id)}
                    onToggleExpansion={toggleSubmissionExpansion}
                    onSubmissionClick={handleSubmissionClick}
                    onEditClick={(submission) => setEditingSubmission(submission)}
                    onDeleteClick={deleteSubmission}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  });

  // --- Submission Detail View ---
  const SubmissionDetailView = memo(() => {
    if (!selectedSubmission) return null;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setView("individual")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {selectedRep}
            </Button>
            <MapPin className="w-8 h-8 text-[#1F3C88]" />
            <div>
              <h1 className="text-4xl font-bold text-slate-800">{selectedSubmission.property_address}</h1>
              <p className="text-slate-600 text-lg">Detailed Evaluation Breakdown</p>
            </div>
          </div>
          <Button
            onClick={() => setEditingSubmission(selectedSubmission)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
          >
            <Edit className="w-4 h-4" />
            Edit Submission
          </Button>
        </div>

        {/* Submission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#1F3C88] mb-1">{selectedSubmission.overall_average.toFixed(1)}</div>
              <div className="text-slate-600">Overall Score</div>
              <div className="text-sm text-emerald-600 font-medium">out of 3.0</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-slate-800 mb-1">{selectedSubmission.qc_agent}</div>
              <div className="text-slate-600">QC Agent</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-lg font-bold text-slate-800 mb-1">{selectedSubmission.submission_date}</div>
              <div className="text-slate-600">Evaluation Date</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className={`text-lg font-bold mb-1 ${
                selectedSubmission.lead_type === "Active" ? "text-emerald-600" : "text-red-600"
              }`}>
                {selectedSubmission.lead_type}
              </div>
              <div className="text-slate-600">Lead Type</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Scores */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Detailed Score Breakdown</h2>
            <div className="grid gap-6">
              {selectedSubmission.scores.map((score, index) => (
                <div key={index} className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{score.section}</h3>
                      <p className="text-slate-600 mb-4">{score.question}</p>
                      {score.comment && (
                        <div className="bg-white p-4 rounded-lg border">
                          <h4 className="font-semibold text-slate-700 mb-2">Comments:</h4>
                          <p className="text-slate-600 italic">"{score.comment}"</p>
                        </div>
                      )}
                    </div>
                    <div className="ml-6 text-center">
                      <div className={`text-4xl font-bold mb-1 ${
                        score.rating === "NA" ? "text-slate-400" :
                        typeof score.rating === "number" && score.rating >= 2.5 ? "text-emerald-600" :
                        typeof score.rating === "number" && score.rating >= 2 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {score.rating === "NA" ? "N/A" : score.rating}
                      </div>
                      <div className="text-sm text-slate-500">
                        {score.rating !== "NA" && "out of 3.0"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedSubmission.final_comment && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-3">Final Evaluation Comments</h3>
                <p className="text-slate-700 leading-relaxed">{selectedSubmission.final_comment}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  });

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
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
          {view === "overview" && <OverviewDashboard />}
          {view === "individual" && <IndividualDashboard />}
          {view === "submission" && <SubmissionDetailView />}
        </div>

        {/* Edit Modal */}
        <EditSubmissionModal
          submission={editingSubmission}
          isOpen={!!editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onSave={handleEditSubmission}
        />
      </div>
    </AuthWrapper>
  );
}