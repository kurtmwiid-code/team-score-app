"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, BarChart3 } from "lucide-react";

// Setup Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Score = {
  id: string;
  repName: string;
  propertyAddress: string;
  leadType: string;
  totalScore: number;
  created_at: string;
};

export default function HomePage() {
  const [recentScores, setRecentScores] = useState<Score[]>([]);

  useEffect(() => {
    const fetchRecentScores = async () => {
      const { data, error } = await supabase
        .from("scores")
        .select("id, repName, propertyAddress, leadType, totalScore, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching recent scores:", error);
      } else {
        setRecentScores(data || []);
      }
    };

    fetchRecentScores();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QC Dashboard</h1>
        <p className="text-muted-foreground">
          Sales Rep Scoring System – manage and review scores with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Submit Score</CardTitle>
            <FilePlus className="h-5 w-5 text-[#1F3C88]" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Record a new score for a rep.
            </p>
            <Button asChild>
              <Link href="/scoring">Go to Scoring</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>View Reporting</CardTitle>
            <BarChart3 className="h-5 w-5 text-[#1F3C88]" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              See reports and insights from submitted scores.
            </p>
            <Button asChild>
              <Link href="/reporting">Go to Reporting</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Scores</CardTitle>
        </CardHeader>
        <CardContent>
          {recentScores.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scores have been submitted yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-3 py-2">Rep</th>
                    <th className="px-3 py-2">Property</th>
                    <th className="px-3 py-2">Lead Type</th>
                    <th className="px-3 py-2">Score</th>
                    <th className="px-3 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentScores.map((score) => (
                    <tr key={score.id} className="border-b last:border-0">
                      <td className="px-3 py-2">{score.repName}</td>
                      <td className="px-3 py-2">{score.propertyAddress}</td>
                      <td className="px-3 py-2">{score.leadType}</td>
                      <td className="px-3 py-2 font-medium">
                        {score.totalScore}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(score.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
