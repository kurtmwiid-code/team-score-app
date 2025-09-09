'use client'

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ArrowLeft, Search, Filter, ChevronDown, ChevronUp, Eye, Trash2, Edit, Save, X, AlertTriangle } from "lucide-react";
import AuthWrapper from '@/components/AuthWrapper'
import { supabase } from '@/lib/supabaseClient'

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
        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
        'bg-gradient-to-r from-[#1F3C88] to-[#2B4F8F]'
      }`}>
        {index + 1}
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900">{rep.name}</h3>
        <p className="text-sm text-gray-600">{rep.totalSubmissions} evaluations</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-2xl font-bold text-gray-900">{rep.percentage}%</div>
      <div className="text-sm text-gray-600">Avg: {rep.overallScore.toFixed(1)}</div>
    </div>
  </div>
));

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
          trend: "up",
          lastEvaluation: submission.submission_date
        });
      }

      const rep = repMap.get(repName)!;
      rep.totalSubmissions += 1;
      rep.overallScore += submission.overall_average;

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

      return rep;
    });

    return reps.sort((a, b) => b.overallScore - a.overallScore);
  }, []);

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

  if (loading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-8">
          <div className="max-w-7xl mx-auto">
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
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="max-w-7xl mx-auto p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Team Performance Reports
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive analytics and insights into sales team performance
            </p>
          </div>

          {view === "overview" ? (
            /* Overview View */
            <div className="space-y-8">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search representatives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
                  />
                </div>
                <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Representatives Grid */}
              <div className="grid gap-6">
                {repData
                  .filter(rep => !searchTerm || rep.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((rep, index) => (
                    <RepCard
                      key={rep.name}
                      rep={rep}
                      index={index}
                      onRepClick={handleRepClick}
                    />
                  ))}
              </div>
            </div>
          ) : (
            /* Individual Rep View */
            <div className="space-y-8">
              {/* Back Button and Rep Header */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Overview
                </button>
              </div>

              {selectedRepData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedRepData.name}</h2>
                      <p className="text-gray-600">{selectedRepData.totalSubmissions} total evaluations</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">{selectedRepData.percentage}%</div>
                      <div className="text-sm text-gray-600">Average Score: {selectedRepData.overallScore.toFixed(1)}</div>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
                />
              </div>

              {/* Submissions */}
              <div className="space-y-6">
                {filteredSubmissions.map(submission => (
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
          )}
        </div>
      </div>
    </AuthWrapper>
  );
}