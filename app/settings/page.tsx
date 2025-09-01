"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";   // ✅ now available
import { Label } from "@/components/ui/label";   // ✅ now available

// --- Types ---
type Keyword = { id: string; category: string; keyword: string };
type Rep = { id: string; name: string; active: boolean };
type QCAgent = { id: string; name: string; email: string; active: boolean };

export default function SettingsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [qcAgents, setQcAgents] = useState<QCAgent[]>([]);

  // Form states
  const [newCategory, setNewCategory] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newRep, setNewRep] = useState("");
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");

  // --- Fetch data ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: keywordsData } = await supabase.from("keywords").select("*");
      const { data: repsData } = await supabase.from("reps").select("*");
      const { data: qcData } = await supabase.from("qc_agents").select("*");

      if (keywordsData) setKeywords(keywordsData);
      if (repsData) setReps(repsData);
      if (qcData) setQcAgents(qcData);
    };
    fetchData();
  }, []);

  // --- Add Keyword ---
  const addKeyword = async () => {
    if (!newCategory || !newKeyword) return;
    const { data, error } = await supabase
      .from("keywords")
      .insert([{ category: newCategory, keyword: newKeyword }])
      .select();

    if (error) {
      console.error("Error adding keyword:", error.message);
    } else if (data) {
      setKeywords((prev) => [...prev, ...data]);
      setNewCategory("");
      setNewKeyword("");
    }
  };

  // --- Add Rep ---
  const addRep = async () => {
    if (!newRep) return;
    const { data, error } = await supabase
      .from("reps")
      .insert([{ name: newRep }])
      .select();

    if (error) {
      console.error("Error adding rep:", error.message);
    } else if (data) {
      setReps((prev) => [...prev, ...data]);
      setNewRep("");
    }
  };

  // --- Add QC Agent ---
  const addAgent = async () => {
    if (!newAgentName || !newAgentEmail) return;
    const { data, error } = await supabase
      .from("qc_agents")
      .insert([{ name: newAgentName, email: newAgentEmail }])
      .select();

    if (error) {
      console.error("Error adding QC agent:", error.message);
    } else if (data) {
      setQcAgents((prev) => [...prev, ...data]);
      setNewAgentName("");
      setNewAgentEmail("");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* --- Keywords --- */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Manage Keywords</h2>
          <div className="flex gap-2">
            <div>
              <Label>Category</Label>
              <Input
                value={newCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCategory(e.target.value)
                }
              />
            </div>
            <div>
              <Label>Keyword</Label>
              <Input
                value={newKeyword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewKeyword(e.target.value)
                }
              />
            </div>
            <Button onClick={addKeyword}>Add</Button>
          </div>
          <ul className="list-disc pl-5">
            {keywords.map((k) => (
              <li key={k.id}>
                {k.category}: <span className="italic">{k.keyword}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* --- Reps --- */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Manage Reps</h2>
          <div className="flex gap-2">
            <div>
              <Label>Rep Name</Label>
              <Input
                value={newRep}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewRep(e.target.value)
                }
              />
            </div>
            <Button onClick={addRep}>Add</Button>
          </div>
          <ul className="list-disc pl-5">
            {reps.map((r) => (
              <li key={r.id}>
                {r.name} {r.active ? "(active)" : "(inactive)"}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* --- QC Agents --- */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-lg font-semibold">Manage QC Agents</h2>
          <div className="flex gap-2">
            <div>
              <Label>Name</Label>
              <Input
                value={newAgentName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAgentName(e.target.value)
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newAgentEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewAgentEmail(e.target.value)
                }
              />
            </div>
            <Button onClick={addAgent}>Add</Button>
          </div>
          <ul className="list-disc pl-5">
            {qcAgents.map((a) => (
              <li key={a.id}>
                {a.name} ({a.email}) {a.active ? "(active)" : "(inactive)"}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
