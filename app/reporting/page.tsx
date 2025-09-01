"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Cell, // ✅ added here
} from "recharts";

interface Rep {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  rep_id: string;
  property_address: string | null;
  lead_type: "Active" | "Dead" | null;
}

interface Score {
  id: string;
  submission_id: string;
  category: string;
  question: string;
  score: number | null; // 1-3 or null
  comments: string | null;
}

export default function ReportingPage() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load reps
  useEffect(() => {
    const loadReps = async () => {
      const { data, error } = await supabase.from("reps").select("*");
      if (error) {
        console.error("Error fetching reps:", error.message);
      } else {
        setReps(data || []);
      }
    };
    loadReps();
  }, []);

  // Load submissions + scores
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: subs, error: subErr } = await supabase
        .from("submissions")
        .select("*");
      if (subErr) {
        console.error("Error fetching submissions:", subErr.message);
        setLoading(false);
        return;
      }
      setSubmissions(subs || []);

      const { data: scrs, error: scoreErr } = await supabase
        .from("submission_scores")
        .select("*");
      if (scoreErr) {
        console.error("Error fetching scores:", scoreErr.message);
        setLoading(false);
        return;
      }
      setScores(scrs || []);

      setLoading(false);
    };
    loadData();
  }, []);

  // Build radar data for a selected rep
  const radarData = (() => {
    if (!selectedRep) return [];

    const repSubs = submissions.filter((s) => s.rep_id === selectedRep);
    const repScores = scores.filter((s) =>
      repSubs.some((sub) => sub.id === s.submission_id)
    );

    const grouped: { [category: string]: number[] } = {};
    repScores.forEach((s) => {
      if (s.score !== null) {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s.score);
      }
    });

    return Object.keys(grouped).map((cat) => ({
      category: cat,
      avg: grouped[cat].reduce((a, b) => a + b, 0) / grouped[cat].length,
    }));
  })();

  // Build leaderboard (all reps, avg score)
  const leaderboardData = (() => {
    return reps
      .map((rep) => {
        const repSubs = submissions.filter((s) => s.rep_id === rep.id);
        const repScores = scores.filter((s) =>
          repSubs.some((sub) => sub.id === s.submission_id)
        );

        const validScores = repScores.filter((s) => s.score !== null);
        const avg =
          validScores.length > 0
            ? validScores.reduce((a, b) => a + (b.score || 0), 0) /
              validScores.length
            : 0;

        return { rep: rep.name, avg };
      })
      .sort((a, b) => b.avg - a.avg);
  })();

  if (loading) return <p>Loading reporting data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reporting</h1>

      <div className="mb-4">
        <label className="mr-2">Filter by Rep:</label>
        <select
          value={selectedRep || ""}
          onChange={(e) => setSelectedRep(e.target.value || null)}
          className="border p-2 rounded"
        >
          <option value="">All Reps</option>
          {reps.map((rep) => (
            <option key={rep.id} value={rep.id}>
              {rep.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRep ? (
        <div>
          <h2 className="text-xl font-semibold mb-2">Radar Chart</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 3]} />
              <Radar
                name="Average"
                dataKey="avg"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={leaderboardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rep" />
              <YAxis domain={[0, 3]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" fill="#82ca9d">
                {leaderboardData.map((entry, index) => {
                  let color = "#ff4d4f"; // red default
                  if (entry.avg >= 2.5) color = "#52c41a"; // green
                  else if (entry.avg >= 1.5) color = "#faad14"; // orange
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
