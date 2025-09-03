"use client";

import React, { useState, useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Home, FileText, User, TrendingUp, TrendingDown, Calendar, MapPin, Award, ArrowLeft, Filter, Search, ChevronDown, ChevronUp, Eye } from "lucide-react";

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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// Fix: Properly type supabase but allow null
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const categories = [
  "Intro", "Bonding & Rapport", "Magic Problem", "First Ask", 
  "Property & Condition Questions", "Second Ask", "Second Call - The Close", "Overall Performance"
];

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

  // Load real data from Supabase
  useEffect(() => {
    loadRepData();
  }, []);

  const loadRepData = async () => {
    if (!supabase) {
      console.error("Supabase not initialized");
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

      // Fix: Add type annotation to forEach parameter
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

        // Process category averages - Fix: Add type annotation to forEach parameter
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
    } catch (error) {
      console.error("Error processing rep data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRepSubmissions = async (repName: string) => {
    if (!supabase) return;

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

      // Transform the data - Fix: Add type annotation to map parameter
      const transformedSubmissions: Submission[] = submissionsData?.map((submission: any) => ({
        id: submission.id.toString(),
        property_address: submission.property_address,
        submission_date: submission.submission_date,
        qc_agent: submission.qc_agent,
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
  };

  const handleRepClick = (repName: string) => {
    setSelectedRep(repName);
    setView("individual");
    loadRepSubmissions(repName);
  };

  const handleSubmissionClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setView("submission");
  };

  const toggleSubmissionExpansion = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
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

  // Calculate team stats
  const teamAverage = repData.length > 0 
    ? repData.reduce((acc, rep) => acc + rep.overallScore, 0) / repData.length 
    : 0;
  
  const totalEvaluations = repData.reduce((acc, rep) => acc + rep.totalSubmissions, 0);
  const improvingReps = repData.filter(rep => rep.trend === "up").length;
  const improvementRate = repData.length > 0 ? Math.round((improvingReps / repData.length) * 100) : 0;

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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={loadRepData}
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
                    <h3 className="text-2xl font-bold text-slate-800">{teamAverage.toFixed(1)}</h3>
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
                    <h3 className="text-2xl font-bold text-slate-800">{totalEvaluations}</h3>
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
                    <h3 className="text-2xl font-bold text-slate-800">{improvementRate}%</h3>
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
                          {rep.trend === "up" ? "Improving" : "Needs Focus"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  // --- Individual Rep Dashboard ---
  const IndividualDashboard = () => {
    const rep = repData.find(r => r.name === selectedRep);
    if (!rep) return null;

    const radarData = getRadarData(rep);

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
                  <div key={submission.id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <div 
                      className="p-6 hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => toggleSubmissionExpansion(submission.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <MapPin className="w-5 h-5 text-slate-500" />
                          <div>
                            <h3 className="font-bold text-slate-800">{submission.property_address}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-600">
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
                              handleSubmissionClick(submission);
                            }}
                            className="flex items-center gap-2 text-[#1F3C88] hover:bg-[#1F3C88]/10"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </Button>
                          {expandedSubmissions.has(submission.id) ? (
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
                    {expandedSubmissions.has(submission.id) && (
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // --- Submission Detail View ---
  const SubmissionDetailView = () => {
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
  };

  return (
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
    </div>
  );
}