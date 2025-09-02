"use client";

import React, { useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast"; // ✅ import toast hook

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
  leadType: "Active" | "Dead";
  finalComment: string;
  overallAverage: number;
  scores: Record<string, ScoreItem>;
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

// --- Categories ---
const categories = [
  { name: "Intro", questions: ["Introduces self clearly and professionally", "States company name and purpose of call", "Confirms time availability with prospect"] },
  { name: "Bonding & Rapport", questions: ["Used open-ended questions to get the client talking", "Finds personal connection and builds trust", "Shows genuine interest and sincerity"] },
  { name: "Magic Problem", questions: ["Listens without interrupting", "Identifies core reason for selling. Goes down the Pain Funnel", "Summarizes and confirms understanding"] },
  { name: "First Ask", questions: ["Asks for first desired price confidently", "Asks about timeframe", "Explains our process clearly"] },
  { name: "Property & Condition Questions", questions: ["Collects decision maker information", "Gathered occupancy/tenant details", "Covered condition of all major systems and possible repairs"] },
  { name: "Second Ask", questions: ["Reviews repair estimate with seller", "Frames 'walk away' amount effectively", "Prepares seller for follow up call"] },
  { name: "Second Call - The Close", questions: ["Presents CASH and RBP offers clearly", "Uses seller motivation to position offer", "Handles objections confidently"] },
  { name: "Overall Performance", questions: ["Maintains positive, professional tone", "Follows script while adapting naturally", "Achieves call objective - closes the deal"] },
];

// --- DB Save Helper ---
const saveSubmissionToDatabase = async (submission: Submission) => {
  if (!supabase) return submission.id;
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
      console.error("Supabase insert error (submissions):", submissionError.message);
      return submission.id;
    }

    const submissionId = submissionData.id;

    // Insert into submission_scores table
    const scoresPayload = Object.values(submission.scores).map((s) => ({
      submission_id: submissionId,
      section: s.section,
      question: s.question,
      rating: s.rating,
      comment: s.comment,
    }));

    const { error: scoresError } = await supabase.from("submission_scores").insert(scoresPayload);
    if (scoresError) {
      console.error("Supabase insert error (submission_scores):", scoresError.message);
    }

    return submissionId as string;
  } catch (err: any) {
    console.error("saveSubmissionToDatabase failed:", err);
    return submission.id;
  }
};

// --- Main Page ---
export default function Page() {
  const { toast } = useToast(); // ✅ hook
  const [scores, setScores] = useState<Record<string, ScoreItem>>(
    Object.fromEntries(
      categories.flatMap((c) =>
        c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
      )
    )
  );

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedScorer, setSelectedScorer] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [leadType, setLeadType] = useState<"Active" | "Dead" | "">("");
  const [finalComment, setFinalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScoreChange = (question: string, field: "rating" | "comment", value: number | string) => {
    setScores((prev) => ({ ...prev, [question]: { ...prev[question], [field]: value } }));
  };

  const handleSubmit = async () => {
    if (!selectedMember || !selectedScorer || !propertyAddress || !leadType) {
      toast({
        title: "Missing Info",
        description: "Please select Sales Rep, QC Agent, Lead Type, and enter a Property Address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const validScores = Object.values(scores).filter((s) => s.rating !== "NA") as { rating: number }[];
    const submission: Submission = {
      id: Math.random().toString(36).substring(2),
      salesRep: selectedMember,
      submissionDate: new Date().toISOString().split("T")[0],
      qcAgent: selectedScorer,
      propertyAddress,
      leadType,
      finalComment,
      overallAverage: validScores.length > 0 ? validScores.reduce((acc, s) => acc + s.rating, 0) / validScores.length : 0,
      scores,
    };

    try {
      await saveSubmissionToDatabase(submission);

      toast({
        title: "Submission Successful ✅",
        description: "Your scoring has been saved.",
      });

      // Reset form
      setScores(
        Object.fromEntries(
          categories.flatMap((c) =>
            c.questions.map((q) => [q, { section: c.name, question: q, rating: "NA", comment: "" }])
          )
        )
      );
      setFinalComment("");
      setSelectedMember("");
      setSelectedScorer("");
      setPropertyAddress("");
      setLeadType("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-indigo-600">Sales Rep Scoring</h1>

      {/* Top Form Fields */}
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          {/* Sales Rep */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sales Rep</label>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">-- Select a Sales Rep --</option>
              <option value="Desmaine">Desmaine</option>
              <option value="Jonathan">Jonathan</option>
              <option value="Kyle">Kyle</option>
              <option value="Jean">Jean</option>
              <option value="JP">JP</option>
              <option value="Phumla">Phumla</option>
              <option value="Michelle B">Michelle B</option>
              <option value="Tiyani">Tiyani</option>
              <option value="Hadya">Hadya</option>
              <option value="Banele">Banele</option>
            </select>
          </div>

          {/* QC Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700">QC Agent</label>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={selectedScorer}
              onChange={(e) => setSelectedScorer(e.target.value)}
            >
              <option value="">-- Select a QC Agent --</option>
              <option value="Jennifer">Jennifer</option>
              <option value="Popi">Popi</option>
            </select>
          </div>

          {/* Lead Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Lead Type</label>
            <select
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={leadType}
              onChange={(e) => setLeadType(e.target.value as "Active" | "Dead")}
            >
              <option value="">-- Select Lead Type --</option>
              <option value="Active">Active</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Address</label>
            <input
              type="text"
              placeholder="123 Main Street, Ocala, FL 34471"
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scoring Sections */}
      {categories.map((cat) => (
        <Card key={cat.name} className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">{cat.name}</h2>
            {cat.questions.map((q) => {
              const s = scores[q];
              return (
                <div key={q} className="space-y-2">
                  <p className="font-medium">{q}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={s.rating === 1} onChange={() => handleScoreChange(q, "rating", 1)} />
                      <span>1 - Did Not Do / Poor</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={s.rating === 2} onChange={() => handleScoreChange(q, "rating", 2)} />
                      <span>2 - Met Expectations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={s.rating === 3} onChange={() => handleScoreChange(q, "rating", 3)} />
                      <span>3 - Exceeded Expectations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" checked={s.rating === "NA"} onChange={() => handleScoreChange(q, "rating", "NA")} />
                      <span>N/A</span>
                    </label>
                  </div>
                  <textarea
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                    placeholder="Comment..."
                    value={s.comment}
                    onChange={(e) => handleScoreChange(q, "comment", e.target.value)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* Final Comment */}
      <Card>
        <CardContent className="p-6">
          <label className="block text-sm font-medium text-gray-700">Final Comment / Notes</label>
          <textarea
            className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            value={finalComment}
            onChange={(e) => setFinalComment(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2">
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}
