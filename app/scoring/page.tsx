"use client";

import React, { useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AuthWrapper from '@/components/AuthWrapper';
import Link from "next/link";
import { Home, FileText } from "lucide-react";

// --- Types ---
type ScoreItem = {
  section: string;
  question: string;
  rating: 1 | 2 | 3 | "NA";
  comment: string;
};

type Submission = {
  id: string;
  salesRep: string;
  submissionDate: string;
  qcAgent: string;
  propertyAddress: string;
  leadType: string;
  finalComment: string;
  overallAverage: number;
  scores: Record<string, ScoreItem>;
};

// --- Supabase Setup (Fixed) ---
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}


// --- Data Arrays ---
const salesReps = [
  "Desmaine", "Jonathan", "Kyle", "Jean", "JP", 
  "Phumla", "Michelle B", "Tiyani", "Hadya", "Banele", "Susan"
];

const qcAgents = ["Jennifer", "Popi"];

// --- Categories ---
const categories = [
  { 
    name: "Intro", 
    questions: [
      "Introduces self clearly and professionally", 
      "States company name and purpose of call", 
      "Confirms time availability with prospect"
    ] 
  },
  { 
    name: "Bonding & Rapport", 
    questions: [
      "Used open-ended questions to get the client talking", 
      "Finds personal connection and builds trust", 
      "Shows genuine interest and sincerity"
    ] 
  },
  { 
    name: "Magic Problem", 
    questions: [
      "Listens without interrupting", 
      "Identifies core reason for selling. Goes down the Pain Funnel", 
      "Summarizes and confirms understanding"
    ] 
  },
  { 
    name: "First Ask", 
    questions: [
      "Asks for first desired price confidently", 
      "Asks about timeframe", 
      "Explains our process clearly"
    ] 
  },
  { 
    name: "Property & Condition Questions", 
    questions: [
      "Collects decision maker information", 
      "Gathered occupancy/tenant details", 
      "Covered condition of all major systems and possible repairs"
    ] 
  },
  { 
    name: "Second Ask", 
    questions: [
      "Reviews repair estimate with seller", 
      "Frames 'walk away' amount effectively", 
      "Prepares seller for follow up call"
    ] 
  },
  { 
    name: "Second Call - The Close", 
    questions: [
      "Presents CASH and RBP offers clearly", 
      "Uses seller motivation to position offer", 
      "Handles objections confidently"
    ] 
  },
  { 
    name: "Overall Performance", 
    questions: [
      "Maintains positive, professional tone", 
      "Follows script while adapting naturally", 
      "Achieves call objective - closes the deal"
    ] 
  }
];

// --- DB Save Helper (Fixed) ---
const saveSubmissionToDatabase = async (submission: Submission) => {
  if (!supabase) {
    console.error("Supabase not initialized");
    throw new Error("Database connection failed");
  }

  try {
    // Insert into submissions table
    const { data: submissionData, error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          sales_rep: submission.salesRep,
          submission_date: submission.submissionDate,
          qc_agent: submission.qcAgent,
          property_address: submission.propertyAddress,
          lead_type: submission.leadType,
          final_comment: submission.finalComment,
          overall_average: submission.overallAverage,
        },
      ])
      .select()
      .single();

    if (submissionError) {
      console.error("Submission error:", submissionError);
      throw submissionError;
    }

    const submissionId = submissionData.id;

    // Insert scores
    const scoresPayload = (Object.values(submission.scores) as ScoreItem[])
      .filter((s) => s.rating !== "NA")
      .map((s) => ({
        submission_id: submissionId,
        section: s.section,
        question: s.question,
        rating: s.rating.toString(),
        comment: s.comment,
      }));

    if (scoresPayload.length > 0) {
      const { error: scoresError } = await supabase
        .from("submission_scores")
        .insert(scoresPayload);
      
      if (scoresError) {
        console.error("Scores error:", scoresError);
        throw scoresError;
      }
    }

    return submissionId;
  } catch (err) {
    console.error("Save failed:", err);
    throw err;
  }
};

// --- Main Component ---
export default function ScoringPage() {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(
      categories.flatMap((c) =>
        c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
      )
    )
  );

  const [selectedRep, setSelectedRep] = useState("");
  const [selectedQC, setSelectedQC] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [leadType, setLeadType] = useState("");
  const [finalComment, setFinalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleScoreChange = (question: string, field: keyof ScoreItem, value: any) => {
    setScores((prev) => ({ ...prev, [question]: { ...prev[question], [field]: value } }));
  };

  const handleSubmit = async () => {
    setShowSuccess(false);
    setShowError(false);
    
    if (!selectedRep || !selectedQC || !propertyAddress || !leadType) {
      setErrorMessage("Please fill in all required fields: Sales Rep, QC Agent, Property Address, and Lead Type.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    if (!supabase) {
      setErrorMessage("Database connection not available. Please check environment variables.");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }
    
    setIsSubmitting(true);

    try {
      const validScores = Object.values(scores).filter(s => s.rating !== "NA");
      const overallAverage = validScores.length > 0 
        ? validScores.reduce((acc, s) => acc + Number(s.rating), 0) / validScores.length 
        : 0;

      const submission: Submission = {
        id: Math.random().toString(36).substring(2),
        salesRep: selectedRep,
        submissionDate: new Date().toISOString().split("T")[0],
        qcAgent: selectedQC,
        propertyAddress,
        leadType,
        finalComment,
        overallAverage: Math.round(overallAverage * 100) / 100,
        scores: scores as Record<string, ScoreItem>,
      };

      await saveSubmissionToDatabase(submission);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // Reset form
      setScores(
        Object.fromEntries(
          categories.flatMap((c) =>
            c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
          )
        )
      );
      setFinalComment("");
      setSelectedRep("");
      setSelectedQC("");
      setPropertyAddress("");
      setLeadType("");
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage("Failed to save submission. Please try again or contact support.");
      setShowError(true);
      setTimeout(() => setShowError(false), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCurrentScore = () => {
    const validScores = Object.values(scores).filter(s => s.rating !== "NA");
    if (validScores.length === 0) return { average: 0, percentage: 0, count: 0 };
    
    const average = validScores.reduce((acc, s) => acc + Number(s.rating), 0) / validScores.length;
    const percentage = (average / 3) * 100;
    return { average: Math.round(average * 100) / 100, percentage: Math.round(percentage), count: validScores.length };
  };

  const currentScore = calculateCurrentScore();

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
                <h1 className="text-3xl font-bold text-slate-800">Quality Control Scoring</h1>
                <p className="text-slate-600">Evaluate sales representative performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/reporting">
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Success/Error Messages - Fixed Position */}
        {showSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
            <span className="text-emerald-500 text-xl">✅</span>
            <div>
              <span className="font-bold">Scoring Submitted Successfully!</span>
              <p className="text-sm">The evaluation has been saved to the database.</p>
            </div>
          </div>
        )}

        {showError && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
            <span className="text-red-500 text-xl">❌</span>
            <div>
              <span className="font-bold">Error:</span>
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Scoring Setup */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Scoring Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* QC Agent Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">QC Agent *</label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                  value={selectedQC}
                  onChange={(e) => setSelectedQC(e.target.value)}
                >
                  <option value="">Select QC Agent</option>
                  {qcAgents.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>

              {/* Sales Rep Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Sales Representative *</label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                  value={selectedRep}
                  onChange={(e) => setSelectedRep(e.target.value)}
                >
                  <option value="">Select Sales Rep</option>
                  {salesReps.map(rep => (
                    <option key={rep} value={rep}>{rep}</option>
                  ))}
                </select>
              </div>

              {/* Lead Type */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lead Status *</label>
                <select
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                  value={leadType}
                  onChange={(e) => setLeadType(e.target.value)}
                >
                  <option value="">Select Lead Status</option>
                  <option value="Active">🟢 Active Lead</option>
                  <option value="Dead">🔴 Dead Lead</option>
                </select>
              </div>

              {/* Property Address */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Property Address *</label>
                <input
                  type="text"
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Current Score Display */}
            {currentScore.count > 0 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#1F3C88]/10 to-blue-500/10 rounded-xl border border-[#1F3C88]/20">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Current Score Progress:</span>
                  <div className="flex gap-6 text-sm">
                    <span className="font-bold text-[#1F3C88]">Average: {currentScore.average}/3.0</span>
                    <span className="font-bold text-emerald-600">Percentage: {currentScore.percentage}%</span>
                    <span className="text-slate-600">Questions Scored: {currentScore.count}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scoring Categories */}
        {categories.map((category, index) => (
          <Card key={category.name} className="shadow-xl border-slate-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{category.name}</h2>
              </div>

              <div className="space-y-8">
                {category.questions.map((question) => {
                  const score = scores[question];
                  return (
                    <div key={question} className="border-b border-slate-100 pb-6 last:border-b-0">
                      <h3 className="font-semibold text-slate-700 mb-4">{question}</h3>
                      
                      {/* Rating Options */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { value: 1, label: "1 - Poor/Not Done", color: "bg-red-100 text-red-700 border-red-300" },
                          { value: 2, label: "2 - Met Expectations", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                          { value: 3, label: "3 - Exceeded Expectations", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
                          { value: "NA", label: "N/A - Not Applicable", color: "bg-slate-100 text-slate-700 border-slate-300" }
                        ].map((option) => (
                          <label key={option.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${score.rating === option.value ? option.color + ' ring-2 ring-offset-2 ring-current' : 'bg-white border-slate-300'}`}>
                            <input
                              type="radio"
                              name={question}
                              checked={score.rating === option.value}
                              onChange={() => handleScoreChange(question, "rating", option.value)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 ${score.rating === option.value ? 'bg-current border-current' : 'border-slate-400'}`}></div>
                            <span className="font-medium text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>

                      {/* Comment Box */}
                      <textarea
                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all resize-none"
                        placeholder="Add specific comments about this criteria..."
                        rows={3}
                        value={score.comment}
                        onChange={(e) => handleScoreChange(question, "comment", e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Final Comments */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Final Comments & Overall Assessment</h2>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all resize-none"
              placeholder="Provide overall feedback, areas for improvement, strengths observed, etc..."
              rows={5}
              value={finalComment}
              onChange={(e) => setFinalComment(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Submit Section */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedRep || !selectedQC || !propertyAddress || !leadType}
            className="px-12 py-4 text-lg font-bold bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-xl transition-all duration-300"
          >
            {isSubmitting ? "Submitting Evaluation..." : "Submit Scoring Evaluation"}
          </Button>
        </div>
      </div>
    </div>
  </AuthWrapper>
);
}