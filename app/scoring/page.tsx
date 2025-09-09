'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle, Star, Clock, User, MapPin, FileText, Building, Home, BarChart3, Calendar } from 'lucide-react'

// --- Supabase Setup (Fixed) ---
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Types ---
type ScoreItem = {
  section: string;
  question: string;
  rating: 1 | 2 | 3 | "NA";
  comment: string;
};

type Submission = {
  salesRep: string
  qcAgent: string
  propertyAddress: string
  leadType: string
  callDateTime: string
  finalComment: string
  overallAverage: number
  submissionDate: string
  scores: Record<string, ScoreItem>
}

// --- Team Members (Updated with Susan) ---
const salesReps = [
  'Desmaine', 'Jonathan', 'Kyle', 'Jean', 'JP', 'Phumla', 'Michelle B', 'Tiyani', 'Hadya', 'Banele', 'Susan'
]

const qcAgents = [
  'Jennifer', 'Popi'
]

const leadTypes = [
  'Active',
  'Dead'
]

// --- Correct Categories and Questions ---
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

export default function ScoringPage() {
  // --- State Management ---
  const [scores, setScores] = useState<Record<string, ScoreItem>>(
    Object.fromEntries(
      categories.flatMap((c) =>
        c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
      )
    )
  );

  const [salesRep, setSalesRep] = useState('')
  const [qcAgent, setQcAgent] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [leadType, setLeadType] = useState('')
  const [callDateTime, setCallDateTime] = useState('')
  const [finalComment, setFinalComment] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize expanded categories to show first category
  useEffect(() => {
    setExpandedCategories({ [categories[0].name]: true })
  }, [])

  // --- Helper Functions ---
  const handleScoreChange = (question: string, rating: 1 | 2 | 3 | "NA") => {
    setScores(prev => ({
      ...prev,
      [question]: { ...prev[question], rating }
    }))
  }

  const handleCommentChange = (question: string, comment: string) => {
    setScores(prev => ({
      ...prev,
      [question]: { ...prev[question], comment }
    }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const calculateOverallAverage = () => {
    const validScores = Object.values(scores).filter(s => s.rating !== "NA") as { rating: number }[];
    return validScores.length > 0 ? validScores.reduce((acc, s) => acc + s.rating, 0) / validScores.length : 0;
  }

  const validateForm = () => {
    if (!salesRep || !qcAgent || !propertyAddress || !leadType) {
      setErrorMessage('Please fill in all required fields (Sales Rep, QC Agent, Property Address, Lead Type)')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return false
    }

    // Check if at least some scores are filled
    const hasScores = Object.values(scores).some(score => score.rating !== "NA")

    if (!hasScores) {
      setErrorMessage('Please provide at least some evaluation scores')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return false
    }

    return true
  }

  const resetForm = () => {
    setSalesRep('')
    setQcAgent('')
    setPropertyAddress('')
    setLeadType('')
    setCallDateTime('')
    setFinalComment('')
    
    // Reset scores
    setScores(
      Object.fromEntries(
        categories.flatMap((c) =>
          c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
        )
      )
    )
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const overallAverage = calculateOverallAverage()
      
      // Insert submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .insert([
          {
            sales_rep: salesRep,
            qc_agent: qcAgent,
            property_address: propertyAddress,
            lead_type: leadType,
            final_comment: finalComment,
            overall_average: overallAverage,
            submission_date: new Date().toISOString()
          }
        ])
        .select()

      if (submissionError) throw submissionError

      const submissionId = submissionData[0].id

      // Prepare score records
      const scoreRecords = Object.values(scores)
        .filter(score => score.rating !== "NA")
        .map(score => ({
          submission_id: submissionId,
          section: score.section,
          question: score.question,
          rating: score.rating,
          comment: score.comment || ''
        }))

      // Insert scores
      if (scoreRecords.length > 0) {
        const { error: scoresError } = await supabase
          .from('submission_scores')
          .insert(scoreRecords)

        if (scoresError) throw scoresError
      }

      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      
      // Reset form
      resetForm()

    } catch (error) {
      console.error('Submission error:', error)
      setErrorMessage('Failed to save submission. Please try again.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCompletionPercentage = () => {
    const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0)
    const answeredQuestions = Object.values(scores).filter(score => score.rating !== "NA").length
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }

  const calculateCurrentScore = () => {
    const validScores = Object.values(scores).filter(s => s.rating !== "NA") as { rating: number }[];
    if (validScores.length === 0) return { average: 0, percentage: 0, count: 0 };
    
    const average = validScores.reduce((acc, s) => acc + s.rating, 0) / validScores.length;
    const percentage = (average / 3) * 100;
    return { average: Math.round(average * 100) / 100, percentage: Math.round(percentage), count: validScores.length };
  };

  const currentScore = calculateCurrentScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Success/Error Messages - Fixed Position */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          <div>
            <div className="font-bold">Scoring Submitted Successfully!</div>
            <div className="text-sm">The evaluation has been saved to the database.</div>
          </div>
        </div>
      )}

      {showError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <div className="font-bold">Error</div>
            <div className="text-sm">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Enhanced Header with Navigation */}
      <div className="bg-gradient-to-r from-[#1F3C88] to-[#2B5AA0] text-white">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">QC Scoring System</h1>
                <p className="text-blue-100">Comprehensive sales evaluation platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </a>
              <a href="/reporting" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Reports
              </a>
              <div className="text-right">
                <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
                <div className="text-sm text-blue-100">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Basic Information Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Evaluation Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* QC Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                QC Agent *
              </label>
              <select
                value={qcAgent}
                onChange={(e) => setQcAgent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
              >
                <option value="">Select QC Agent</option>
                {qcAgents.map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Sales Rep */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Sales Representative *
              </label>
              <select
                value={salesRep}
                onChange={(e) => setSalesRep(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
              >
                <option value="">Select Sales Rep</option>
                {salesReps.map(rep => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
            </div>

            {/* Lead Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Lead Status *
              </label>
              <select
                value={leadType}
                onChange={(e) => setLeadType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
              >
                <option value="">Select Lead Status</option>
                <option value="Active">🟢 Active Lead</option>
                <option value="Dead">🔴 Dead Lead</option>
              </select>
            </div>

            {/* Property Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Property Address *
              </label>
              <input
                type="text"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
                placeholder="123 Main St, City, State ZIP"
              />
            </div>

            {/* Call Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Call Date & Time
              </label>
              <input
                type="datetime-local"
                value={callDateTime}
                onChange={(e) => setCallDateTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
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
        </div>

        {/* Scoring Categories */}
        <div className="space-y-6">
          {categories.map((category, categoryIndex) => {
            const isExpanded = expandedCategories[category.name]
            const answeredCount = category.questions.filter(q => scores[q]?.rating !== "NA").length
            
            return (
              <div key={category.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {categoryIndex + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {answeredCount}/{category.questions.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {category.questions.map((question) => {
                      const score = scores[question]
                      
                      return (
                        <div key={question} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <h4 className="font-medium text-gray-900 mb-4">{question}</h4>
                          
                          {/* Enhanced Rating Options */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                            {[
                              { value: 1, label: "1 - Poor/Not Done", color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
                              { value: 2, label: "2 - Met Expectations", color: "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200" },
                              { value: 3, label: "3 - Exceeded Expectations", color: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200" },
                              { value: "NA", label: "N/A - Not Applicable", color: "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200" }
                            ].map((option) => (
                              <label key={option.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${score.rating === option.value ? option.color + ' ring-2 ring-offset-2 ring-current shadow-md' : 'bg-white border-slate-300 ' + option.color.replace('bg-', 'hover:bg-')}`}>
                                <input
                                  type="radio"
                                  name={question}
                                  checked={score.rating === option.value}
                                  onChange={() => handleScoreChange(question, option.value as 1 | 2 | 3 | "NA")}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border-2 ${score.rating === option.value ? 'bg-current border-current' : 'border-slate-400'}`}></div>
                                <span className="font-medium text-sm">{option.label}</span>
                              </label>
                            ))}
                          </div>
                          
                          {/* Comment Field */}
                          <textarea
                            value={score.comment}
                            onChange={(e) => handleCommentChange(question, e.target.value)}
                            placeholder="Add specific comments about this criteria..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Final Comment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Comments & Overall Assessment</h3>
          <textarea
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            placeholder="Provide overall feedback, areas for improvement, strengths observed, etc..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent resize-none"
            rows={5}
          />
        </div>

        {/* Enhanced Submit Button with Live Stats */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progress: {getCompletionPercentage()}% complete ({currentScore.count} questions scored)
              {currentScore.count > 0 && (
                <span className="ml-4">
                  Current Average: {currentScore.average}/3.0 ({currentScore.percentage}%)
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !salesRep || !qcAgent || !propertyAddress || !leadType}
              className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSubmitting || !salesRep || !qcAgent || !propertyAddress || !leadType
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting Evaluation...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit Scoring Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}