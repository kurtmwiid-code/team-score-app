'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle, Star, Clock, User, MapPin, FileText, Building } from 'lucide-react'

// --- Supabase Setup (Fixed) ---
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Form Data Types ---
interface Submission {
  salesRep: string
  qcAgent: string
  propertyAddress: string
  leadType: string
  callTime: string
  finalComment: string
  overallAverage: number
  submissionDate: string
  scores: Record<string, Record<string, { rating: string; comment: string }>>
}

// --- Team Members ---
const salesReps = [
  'Desmaine', 'Jonathan', 'Kyle', 'Jean', 'JP', 'Phumla', 'Michelle B', 'Tiyani', 'Hadya', 'Banele'
]

const qcAgents = [
  'Jennifer', 'Popi'
]

const leadTypes = [
  'Active',
  'Dead'
]

// --- Categories and Questions ---
const categories = {
  "Intro": [
    "Does the rep introduce themself and/or company?",
    "Does the rep verify contact information?",
    "Does the rep indicate what the call is about/regarding?"
  ],
  "Bonding & Rapport": [
    "Does the rep establish rapport?",
    "Is the rep conversational and not robotic?",
    "Does the rep sound confident and knowledgeable?"
  ],
  "Magic Problem": [
    "Does the rep ask about motivation to sell?",
    "Does the rep ask about pain points?",
    "Does the rep identify the customer's timeline?"
  ],
  "First Ask": [
    "Does the rep ask for the address?",
    "Does the rep ask for property condition details?"
  ],
  "Property & Condition Questions": [
    "Does the rep ask detailed property questions?",
    "Does the rep confirm property ownership?",
    "Does the rep ask about repairs needed?"
  ],
  "Second Ask": [
    "Does the rep ask for price expectations?",
    "Does the rep manage price objections effectively?"
  ],
  "Second Call - The Close": [
    "Does the rep schedule the next steps?",
    "Does the rep confirm contact details for follow-up?",
    "Does the rep maintain enthusiasm throughout?"
  ],
  "Overall Performance": [
    "Professional communication throughout call",
    "Active listening and appropriate responses",
    "Overall call effectiveness"
  ]
}

export default function ScoringPage() {
  // --- State Management ---
  const [salesRep, setSalesRep] = useState('')
  const [qcAgent, setQcAgent] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [leadType, setLeadType] = useState('')
  const [callTime, setCallTime] = useState('')
  const [finalComment, setFinalComment] = useState('')
  const [scores, setScores] = useState<Record<string, Record<string, { rating: string; comment: string }>>>({})
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Initialize scores structure
  useEffect(() => {
    const initialScores: Record<string, Record<string, { rating: string; comment: string }>> = {}
    Object.entries(categories).forEach(([category, questions]) => {
      initialScores[category] = {}
      questions.forEach(question => {
        initialScores[category][question] = { rating: '', comment: '' }
      })
    })
    setScores(initialScores)
  }, [])

  // --- Helper Functions ---
  const handleScoreChange = (category: string, question: string, rating: string) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [question]: {
          ...prev[category][question],
          rating
        }
      }
    }))
  }

  const handleCommentChange = (category: string, question: string, comment: string) => {
    setScores(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [question]: {
          ...prev[category][question],
          comment
        }
      }
    }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const calculateOverallAverage = () => {
    let total = 0
    let count = 0
    
    Object.entries(scores).forEach(([category, questions]) => {
      Object.entries(questions).forEach(([question, score]) => {
        if (score.rating && score.rating !== 'NA') {
          total += parseInt(score.rating)
          count++
        }
      })
    })
    
    return count > 0 ? total / count : 0
  }

  const validateForm = () => {
    if (!salesRep || !qcAgent || !propertyAddress || !leadType) {
      setErrorMessage('Please fill in all required fields (Sales Rep, QC Agent, Property Address, Lead Type)')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return false
    }

    // Check if at least some scores are filled
    let hasScores = false
    Object.entries(scores).forEach(([category, questions]) => {
      Object.entries(questions).forEach(([question, score]) => {
        if (score.rating && score.rating !== '') {
          hasScores = true
        }
      })
    })

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
    setCallTime('')
    setFinalComment('')
    
    // Reset scores
    const resetScores: Record<string, Record<string, { rating: string; comment: string }>> = {}
    Object.entries(categories).forEach(([category, questions]) => {
      resetScores[category] = {}
      questions.forEach(question => {
        resetScores[category][question] = { rating: '', comment: '' }
      })
    })
    setScores(resetScores)
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
      const scoreRecords: any[] = []
      Object.entries(scores).forEach(([category, questions]) => {
        Object.entries(questions).forEach(([question, score]) => {
          if (score.rating && score.rating !== '') {
            scoreRecords.push({
              submission_id: submissionId,
              section: category,
              question: question,
              rating: score.rating,
              comment: score.comment || ''
            })
          }
        })
      })

      // Insert scores
      if (scoreRecords.length > 0) {
        const { error: scoresError } = await supabase
          .from('submission_scores')
          .insert(scoreRecords)

        if (scoresError) throw scoresError
      }

      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
      
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
    let totalQuestions = 0
    let answeredQuestions = 0
    
    Object.entries(categories).forEach(([category, questions]) => {
      questions.forEach(question => {
        totalQuestions++
        if (scores[category] && scores[category][question] && scores[category][question].rating) {
          answeredQuestions++
        }
      })
    })
    
    return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
  }

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

      {/* Header */}
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
            <div className="text-right">
              <div className="text-2xl font-bold">{getCompletionPercentage()}%</div>
              <div className="text-sm text-blue-100">Complete</div>
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

            {/* Lead Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Lead Type *
              </label>
              <select
                value={leadType}
                onChange={(e) => setLeadType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
              >
                <option value="">Select Lead Type</option>
                {leadTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
                placeholder="Enter property address"
              />
            </div>

            {/* Call Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Call Time (Optional)
              </label>
              <input
                type="text"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent"
                placeholder="e.g., 10:30 AM"
              />
            </div>
          </div>
        </div>

        {/* Scoring Categories */}
        <div className="space-y-6">
          {Object.entries(categories).map(([category, questions]) => {
            const isExpanded = expandedCategories[category]
            const categoryScores = scores[category] || {}
            const answeredCount = questions.filter(q => categoryScores[q]?.rating).length
            
            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {answeredCount}/{questions.length}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {questions.map((question, qIndex) => {
                      const currentScore = categoryScores[question] || { rating: '', comment: '' }
                      
                      return (
                        <div key={qIndex} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <h4 className="font-medium text-gray-900 mb-3">{question}</h4>
                          
                          {/* Rating Options */}
                          <div className="flex gap-3 mb-3">
                            {['1', '2', '3', 'NA'].map(rating => (
                              <label key={rating} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`${category}-${qIndex}`}
                                  value={rating}
                                  checked={currentScore.rating === rating}
                                  onChange={() => handleScoreChange(category, question, rating)}
                                  className="sr-only"
                                />
                                <div className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                                  currentScore.rating === rating
                                    ? rating === 'NA' 
                                      ? 'border-gray-400 bg-gray-100 text-gray-800'
                                      : rating === '1'
                                        ? 'border-red-400 bg-red-100 text-red-800'
                                        : rating === '2'
                                          ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
                                          : 'border-green-400 bg-green-100 text-green-800'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}>
                                  {rating}
                                </div>
                              </label>
                            ))}
                          </div>
                          
                          {/* Comment Field */}
                          <textarea
                            value={currentScore.comment}
                            onChange={(e) => handleCommentChange(category, question, e.target.value)}
                            placeholder="Optional comments..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent resize-none"
                            rows={2}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Final Comments</h3>
          <textarea
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
            placeholder="Optional overall comments about this evaluation..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1F3C88] focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 mt-8 -mx-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Progress: {getCompletionPercentage()}% complete
              {calculateOverallAverage() > 0 && (
                <span className="ml-4">
                  Average Score: {calculateOverallAverage().toFixed(1)}
                </span>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Submit Evaluation
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}