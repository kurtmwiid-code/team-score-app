'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ChevronDown, ChevronUp, Save, AlertCircle, CheckCircle, Star, Clock, User, MapPin, FileText, Building } from 'lucide-react'
import AuthWrapper from '@/components/AuthWrapper'
import { supabase } from '@/lib/supabaseClient'

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
  'Prospecting',
  'Follow-up',
  'Cold Lead',
  'Warm Lead',
  'Hot Lead'
]

// --- Call Time Options ---
const callTimeOptions = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
]

// --- YOUR ACTUAL Scoring Criteria ---
const scoringSections = {
  'Intro': [
    'introduces self clearly and professionally',
    'states company name and purpose of call',
    'confirms time availability with prospect'
  ],
  'Bonding & Rapport': [
    'Used open-ended questions to get the client talking',
    'Finds personal connection and builds trust',
    'Shows genuine interest and sincerity'
  ],
  'Magic Problem': [
    'Listens without interrupting',
    'Identifies core reason for selling. Goes down the Pain Funnel',
    'Summarizes and confirms understanding'
  ],
  'First Ask': [
    'Asks for first desired price confidently',
    'Asks about timeframe',
    'Explains our process clearly'
  ],
  'Property & Condition Questions': [
    'Collects decision maker information',
    'Gathered occupancy/tenant details',
    'Covered condition of all major systems and possible repairs'
  ],
  'Second Ask': [
    'Reviews repair estimate with seller',
    'Frames "walk away" amount effectively',
    'Prepares seller for follow up call'
  ],
  'Second Call - The Close': [
    'Presents CASH and RBP offers clearly',
    'Uses seller motivation to position offer',
    'Handles objections confidently'
  ],
  'Overall Performance': [
    'Maintains positive, professional tone',
    'Follows script while adapting naturally',
    'Achieves call objective- closes the deal'
  ]
}

const ScoringPage = () => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    salesRep: '',
    qcAgent: '',
    propertyAddress: '',
    leadType: '',
    callTime: '',
    finalComment: ''
  })

  const [scores, setScores] = useState<Record<string, Record<string, { rating: string; comment: string }>>>({})
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // --- Initialize scores structure ---
  useEffect(() => {
    const initialScores: Record<string, Record<string, { rating: string; comment: string }>> = {}
    Object.entries(scoringSections).forEach(([section, questions]) => {
      initialScores[section] = {}
      questions.forEach(question => {
        initialScores[section][question] = { rating: '', comment: '' }
      })
    })
    setScores(initialScores)

    // Expand all sections by default for better UX
    const expandedState: Record<string, boolean> = {}
    Object.keys(scoringSections).forEach(section => {
      expandedState[section] = true
    })
    setExpandedSections(expandedState)
  }, [])

  // --- Helper Functions ---
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleScoreChange = (section: string, question: string, field: 'rating' | 'comment', value: string) => {
    setScores(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [question]: {
          ...prev[section][question],
          [field]: value
        }
      }
    }))
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const calculateOverallAverage = () => {
    let totalScore = 0
    let totalQuestions = 0

    Object.entries(scores).forEach(([section, questions]) => {
      Object.entries(questions).forEach(([question, data]) => {
        if (data.rating && data.rating !== 'NA') {
          totalScore += parseInt(data.rating)
          totalQuestions++
        }
      })
    })

    return totalQuestions > 0 ? (totalScore / totalQuestions) : 0
  }

  const validateForm = () => {
    if (!formData.salesRep || !formData.qcAgent || !formData.propertyAddress || !formData.leadType || !formData.callTime) {
      setErrorMessage('Please fill in all required fields.')
      return false
    }

    let hasValidRatings = false
    Object.entries(scores).forEach(([section, questions]) => {
      Object.entries(questions).forEach(([question, data]) => {
        if (data.rating && data.rating !== '') {
          hasValidRatings = true
        }
      })
    })

    if (!hasValidRatings) {
      setErrorMessage('Please provide at least one rating.')
      return false
    }

    return true
  }

  // --- Database Operations ---
  const saveSubmissionToDatabase = async (submission: Submission) => {
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
            call_time: submission.callTime,
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

      // Insert individual scores
      const scoreInserts: Array<{
        submission_id: string;
        section: string;
        question: string;
        rating: string;
        comment: string | null;
      }> = [];
      Object.entries(submission.scores).forEach(([section, questions]) => {
        Object.entries(questions).forEach(([question, data]) => {
          if (data.rating && data.rating !== '') {
            scoreInserts.push({
              submission_id: submissionId,
              section: section,
              question: question,
              rating: data.rating,
              comment: data.comment || null,
            });
          }
        });
      });

      if (scoreInserts.length > 0) {
        const { error: scoresError } = await supabase
          .from("submission_scores")
          .insert(scoreInserts);

        if (scoresError) {
          console.error("Scores error:", scoresError);
          throw scoresError;
        }
      }

      console.log("Submission saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    setIsSubmitting(true)

    try {
      const submission: Submission = {
        ...formData,
        overallAverage: calculateOverallAverage(),
        submissionDate: new Date().toISOString(),
        scores
      }

      await saveSubmissionToDatabase(submission)

      // Success - reset form
      setFormData({
        salesRep: '',
        qcAgent: '',
        propertyAddress: '',
        leadType: '',
        callTime: '',
        finalComment: ''
      })

      const initialScores: Record<string, Record<string, { rating: string; comment: string }>> = {}
      Object.entries(scoringSections).forEach(([section, questions]) => {
        initialScores[section] = {}
        questions.forEach(question => {
          initialScores[section][question] = { rating: '', comment: '' }
        })
      })
      setScores(initialScores)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)

    } catch (error) {
      console.error('Submission failed:', error)
      setErrorMessage('Failed to save submission. Please try again or contact support.')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Call Scoring System
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Evaluate sales call performance across key metrics to drive continuous improvement
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="text-green-600 w-5 h-5" />
              <span className="text-green-800 font-medium">Submission saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {showError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-red-600 w-5 h-5" />
              <span className="text-red-800 font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Call Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sales Rep */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sales Representative *
                  </label>
                  <select
                    value={formData.salesRep}
                    onChange={(e) => handleInputChange('salesRep', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
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
                    QC Agent *
                  </label>
                  <select
                    value={formData.qcAgent}
                    onChange={(e) => handleInputChange('qcAgent', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select QC Agent</option>
                    {qcAgents.map(agent => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>

                {/* Call Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Call Time *
                  </label>
                  <select
                    value={formData.callTime}
                    onChange={(e) => handleInputChange('callTime', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Call Time</option>
                    {callTimeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Property Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Property Address *
                  </label>
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    placeholder="Enter property address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Lead Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Lead Type *
                  </label>
                  <select
                    value={formData.leadType}
                    onChange={(e) => handleInputChange('leadType', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Lead Type</option>
                    {leadTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scoring Sections */}
            {Object.entries(scoringSections).map(([section, questions]) => (
              <div key={section} className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Section Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    {section}
                  </h3>
                  {expandedSections[section] ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                {/* Section Content */}
                {expandedSections[section] && (
                  <div className="p-6 pt-0 space-y-6">
                    {questions.map((question, index) => (
                      <div key={index} className="border-l-4 border-blue-100 pl-4">
                        <div className="mb-3">
                          <h4 className="font-medium text-gray-900 mb-2">{question}</h4>
                          
                          {/* Rating Buttons */}
                          <div className="flex gap-2 mb-3">
                            {['1', '2', '3', 'NA'].map(rating => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() => handleScoreChange(section, question, 'rating', rating)}
                                className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                                  scores[section]?.[question]?.rating === rating
                                    ? rating === 'NA'
                                      ? 'bg-gray-500 text-white border-gray-500'
                                      : rating === '1'
                                      ? 'bg-red-500 text-white border-red-500'
                                      : rating === '2'
                                      ? 'bg-yellow-500 text-white border-yellow-500'
                                      : 'bg-green-500 text-white border-green-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {rating === 'NA' ? 'N/A' : rating}
                              </button>
                            ))}
                          </div>

                          {/* Comment Field */}
                          <textarea
                            value={scores[section]?.[question]?.comment || ''}
                            onChange={(e) => handleScoreChange(section, question, 'comment', e.target.value)}
                            placeholder="Optional comments..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Final Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Final Comments
              </h3>
              <textarea
                value={formData.finalComment}
                onChange={(e) => handleInputChange('finalComment', e.target.value)}
                placeholder="Overall feedback and recommendations..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[200px] justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Submit Scoring
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthWrapper>
  )
}

export default ScoringPage