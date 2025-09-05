"use client";

import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Home,
  FileText,
  BookOpen,
  Clock,
  MapPin,
  User,
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Volume2,
  X,
  Award,
  Target,
} from "lucide-react";

/* ----------------------------- Types ----------------------------- */
interface TrainingExample {
  id: string;
  sales_rep: string;
  qc_agent: string;
  property_address: string;
  call_date: string;
  call_time?: string;
  section: string;
  timestamp_start: string;
  timestamp_end?: string;
  quality_level: "Good" | "Great" | "Excellent";
  description: string;
  key_techniques: string[];
  notes: string;
  created_at: string;
  updated_at: string;
}

interface SectionStats {
  section: string;
  total_examples: number;
  excellent_count: number;
  great_count: number;
  good_count: number;
  latest_addition: string;
}

/* ------------------------ Supabase (yours) ----------------------- */
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/* --------------------------- Constants --------------------------- */
const salesReps = [
  "Desmaine",
  "Jonathan",
  "Kyle",
  "Jean",
  "JP",
  "Phumla",
  "Michelle B",
  "Tiyani",
  "Hadya",
  "Banele",
];

const qcAgents = ["Jennifer", "Popi"];

const scoringSections = [
  "Intro",
  "Bonding & Rapport",
  "Magic Problem",
  "First Ask",
  "Property & Condition Questions",
  "Second Ask",
  "Second Call - The Close",
  "Overall Performance",
];

const qualityLevels = [
  { value: "Good", color: "bg-blue-100 text-blue-700", icon: "👍" },
  { value: "Great", color: "bg-emerald-100 text-emerald-700", icon: "⭐" },
  { value: "Excellent", color: "bg-purple-100 text-purple-700", icon: "🏆" },
];

/* ---------------------- DB helper functions ---------------------- */
const saveTrainingExample = async (
  example: Omit<TrainingExample, "id" | "created_at" | "updated_at">
) => {
  if (!supabase) throw new Error("Database connection not available");

  const { data, error } = await supabase
    .from("training_examples")
    .insert([
      {
        ...example,
        key_techniques: JSON.stringify(example.key_techniques),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const loadTrainingExamples = async (): Promise<TrainingExample[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("training_examples")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading training examples:", error);
    return [];
  }

  return (
    data?.map((item: any) => ({
      ...item,
      key_techniques:
        typeof item.key_techniques === "string"
          ? JSON.parse(item.key_techniques)
          : item.key_techniques || [],
    })) || []
  );
};

const deleteTrainingExample = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from("training_examples")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

/* ===================== PRESENTATION COMPONENTS ===================== */
/* NOTE: These are OUTSIDE the page component so React
   does NOT remount them on every keystroke. This fixes the
   “click after each character” focus-loss bug. */

type OverviewDashboardProps = {
  examples: TrainingExample[];
  sectionStats: SectionStats[];
  setShowAddForm: (v: boolean) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      sales_rep: string;
      qc_agent: string;
      property_address: string;
      call_date: string;
      call_time: string;
      section: string;
      timestamp_start: string;
      timestamp_end: string;
      quality_level: "Good" | "Great" | "Excellent";
      description: string;
      key_techniques: string[];
      notes: string;
    }>
  >;
  onRefresh: () => void;
  onOpenSection: (section: string) => void;
};

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  examples,
  sectionStats,
  setShowAddForm,
  setFormData,
  onRefresh,
  onOpenSection,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Training Library
          </h1>
          <p className="text-slate-600 text-lg">
            Curated examples of excellent call techniques by section
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Training Example
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <Filter className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {examples.length}
                </h3>
                <p className="text-slate-600">Total Examples</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {examples.filter((ex) => ex.quality_level === "Excellent")
                    .length}
                </h3>
                <p className="text-slate-600">Excellent Examples</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {scoringSections.length}
                </h3>
                <p className="text-slate-600">Training Sections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {[...new Set(examples.map((ex) => ex.sales_rep))].length}
                </h3>
                <p className="text-slate-600">Featured Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoringSections.map((section, index) => {
          const stats = sectionStats.find((s) => s.section === section);
          const hasExamples = stats && stats.total_examples > 0;

          return (
            <Card
              key={section}
              onClick={() => (hasExamples ? onOpenSection(section) : null)}
              className={`shadow-xl border-slate-200 overflow-hidden group transition-all duration-300 ${
                hasExamples
                  ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      {section}
                    </h3>
                  </div>
                  {hasExamples && (
                    <div className="text-2xl font-bold text-[#1F3C88]">
                      {stats!.total_examples}
                    </div>
                  )}
                </div>

                {hasExamples ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 text-sm">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        🏆 {stats!.excellent_count}
                      </span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        ⭐ {stats!.great_count}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        👍 {stats!.good_count}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Latest:{" "}
                      {stats!.latest_addition
                        ? new Date(stats!.latest_addition).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-2">No examples yet</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, section }));
                        setShowAddForm(true);
                      }}
                    >
                      Add First Example
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

type SectionDetailViewProps = {
  selectedSection: string | null;
  filteredExamples: TrainingExample[];
  sectionStats: SectionStats[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  qualityFilter: string;
  setQualityFilter: (v: string) => void;
  setShowAddForm: (v: boolean) => void;
  setFormData: React.Dispatch<any>;
  onDelete: (id: string) => Promise<void>;
  onReload: () => Promise<void>;
};

const SectionDetailView: React.FC<SectionDetailViewProps> = ({
  selectedSection,
  filteredExamples,
  sectionStats,
  searchTerm,
  setSearchTerm,
  qualityFilter,
  setQualityFilter,
  setShowAddForm,
  setFormData,
  onDelete,
  onReload,
}) => {
  if (!selectedSection) return null;

  const sectionExamples = filteredExamples.filter(
    (ex) => ex.section === selectedSection
  );
  const stats = sectionStats.find((s) => s.section === selectedSection);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/training")}
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Back to Library
          </Button>
          <div className="w-14 h-14 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {scoringSections.indexOf(selectedSection) + 1}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              {selectedSection}
            </h1>
            <p className="text-slate-600 text-lg">
              Training examples and best practices
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search examples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
            />
          </div>
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1F3C88] focus:border-[#1F3C88]"
          >
            <option value="All">All Quality Levels</option>
            <option value="Excellent">Excellent</option>
            <option value="Great">Great</option>
            <option value="Good">Good</option>
          </select>
          <Button
            onClick={() => {
              setFormData((prev: any) => ({ ...prev, section: selectedSection }));
              setShowAddForm(true);
            }}
            className="bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Example
          </Button>
        </div>
      </div>

      {/* Section Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#1F3C88] mb-1">
                {stats.total_examples}
              </div>
              <div className="text-slate-600">Total Examples</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {stats.excellent_count}
              </div>
              <div className="text-slate-600">Excellent</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">
                {stats.great_count}
              </div>
              <div className="text-slate-600">Great</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.good_count}
              </div>
              <div className="text-slate-600">Good</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Examples List */}
      <Card className="shadow-xl border-slate-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            Training Examples
          </h2>
          {sectionExamples.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl font-semibold text-slate-600 mb-2">
                No examples found
              </div>
              <p className="text-slate-500 mb-4">
                Be the first to add a training example for this section.
              </p>
              <Button
                onClick={() => {
                  setFormData((prev: any) => ({ ...prev, section: selectedSection }));
                  setShowAddForm(true);
                }}
                className="bg-gradient-to-r from-[#1F3C88] to-blue-600"
              >
                Add First Example
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {sectionExamples.map((example: TrainingExample) => {
                const qualityConfig = qualityLevels.find(
                  (q) => q.value === example.quality_level
                );
                return (
                  <div
                    key={example.id}
                    className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {example.sales_rep.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-800">
                              {example.sales_rep}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${qualityConfig?.color}`}
                            >
                              {qualityConfig?.icon} {example.quality_level}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {example.property_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(example.call_date).toLocaleDateString()}
                              {example.call_time && ` at ${example.call_time}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {example.timestamp_start}
                              {example.timestamp_end &&
                                ` - ${example.timestamp_end}`}
                            </span>
                          </div>
                          {example.qc_agent && (
                            <div className="text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                QC Agent: {example.qc_agent}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-[#1F3C88]">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={async () => {
                            if (
                              confirm(
                                "Are you sure you want to delete this training example?"
                              )
                            ) {
                              await onDelete(example.id);
                              await onReload();
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-slate-800 mb-2">
                        What made this excellent:
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        {example.description}
                      </p>
                    </div>

                    {example.key_techniques.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-slate-800 mb-2">
                          Key Techniques Used:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {example.key_techniques.map(
                            (technique: string, index: number) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                              >
                                {technique}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {example.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-2">
                          Additional Notes:
                        </h4>
                        <p className="text-amber-700">{example.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

type AddExampleFormProps = {
  formData: {
    sales_rep: string;
    qc_agent: string;
    property_address: string;
    call_date: string;
    call_time: string;
    section: string;
    timestamp_start: string;
    timestamp_end: string;
    quality_level: "Good" | "Great" | "Excellent";
    description: string;
    key_techniques: string[];
    notes: string;
  };
  setFormData: React.Dispatch<any>;
  newTechnique: string;
  setNewTechnique: (v: string) => void;
  onAddTechnique: () => void;
  onRemoveTechnique: (t: string) => void;
  onClose: () => void;
  onSave: () => Promise<void>;
};

const autoGrow = (el: HTMLTextAreaElement) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

const AddExampleForm: React.FC<AddExampleFormProps> = ({
  formData,
  setFormData,
  newTechnique,
  setNewTechnique,
  onAddTechnique,
  onRemoveTechnique,
  onClose,
  onSave,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              Add Training Example
            </h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sales Rep */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Sales Rep *
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.sales_rep}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    sales_rep: e.target.value,
                  }))
                }
              >
                <option value="">Select Sales Rep</option>
                {salesReps.map((rep) => (
                  <option key={rep} value={rep}>
                    {rep}
                  </option>
                ))}
              </select>
            </div>

            {/* QC Agent */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                QC Agent
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.qc_agent}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    qc_agent: e.target.value,
                  }))
                }
              >
                <option value="">Select QC Agent</option>
                {qcAgents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Address */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Property Address *
              </label>
              <input
                type="text"
                placeholder="123 Main St, City, State ZIP"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.property_address}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    property_address: e.target.value,
                  }))
                }
              />
            </div>

            {/* Call Date */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Call Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.call_date}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    call_date: e.target.value,
                  }))
                }
              />
            </div>
            {/* Call Time */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Call Time
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.call_time}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    call_time: e.target.value,
                  }))
                }
              >
                <option value="">Select Call Time</option>
                <option value="8:00 AM">8:00 AM</option>
                <option value="8:30 AM">8:30 AM</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="9:30 AM">9:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="12:30 PM">12:30 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="1:30 PM">1:30 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="2:30 PM">2:30 PM</option>
                <option value="3:00 PM">3:00 PM</option>
                <option value="3:30 PM">3:30 PM</option>
                <option value="4:00 PM">4:00 PM</option>
                <option value="4:30 PM">4:30 PM</option>
                <option value="5:00 PM">5:00 PM</option>
                <option value="5:30 PM">5:30 PM</option>
                <option value="6:00 PM">6:00 PM</option>
                <option value="6:30 PM">6:30 PM</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Training Section *
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.section}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    section: e.target.value,
                  }))
                }
              >
                <option value="">Select Section</option>
                {scoringSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Level */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Quality Level *
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.quality_level}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    quality_level: e.target
                      .value as "Good" | "Great" | "Excellent",
                  }))
                }
              >
                {qualityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.icon} {level.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Start / End */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Start Time *
              </label>
              <input
                type="text"
                placeholder="e.g., 2:30 or 1:45"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.timestamp_start}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    timestamp_start: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Format: minutes:seconds (e.g., 2:30)
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                End Time (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 3:45"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.timestamp_end}
                onChange={(e) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    timestamp_end: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              What made this example excellent? *
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
              placeholder="Describe what the sales rep did exceptionally well..."
              rows={1}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
            />
          </div>

          {/* Key Techniques */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Key Techniques Used
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g., Active listening, Open-ended questions"
                className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={newTechnique}
                onChange={(e) => setNewTechnique(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onAddTechnique()}
              />
              <Button type="button" onClick={onAddTechnique}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.key_techniques.map((technique: string, i: number) => (
                <span
                  key={i}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {technique}
                  <button
                    onClick={() => onRemoveTechnique(technique)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Additional Notes
            </label>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
              placeholder="Any additional context, coaching points, or observations..."
              rows={1}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev: any) => ({ ...prev, notes: e.target.value }))
              }
              onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg transition-all duration-300"
            >
              Save Training Example
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ============================ PAGE ============================ */
export default function TrainingPage() {
  const [view, setView] = useState<"overview" | "section">("overview");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualityFilter, setQualityFilter] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    sales_rep: "",
    qc_agent: "",
    property_address: "",
    call_date: "",
    call_time: "",
    section: "",
    timestamp_start: "",
    timestamp_end: "",
    quality_level: "Good" as "Good" | "Great" | "Excellent",
    description: "",
    key_techniques: [] as string[],
    notes: "",
  });

  const [newTechnique, setNewTechnique] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await loadTrainingExamples();
      setExamples(data);

      const stats: SectionStats[] = scoringSections.map((section) => {
        const sectionExamples = data.filter((ex) => ex.section === section);
        return {
          section,
          total_examples: sectionExamples.length,
          excellent_count: sectionExamples.filter(
            (ex) => ex.quality_level === "Excellent"
          ).length,
          great_count: sectionExamples.filter((ex) => ex.quality_level === "Great")
            .length,
          good_count: sectionExamples.filter((ex) => ex.quality_level === "Good")
            .length,
          latest_addition:
            sectionExamples.length > 0
              ? sectionExamples.sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )[0].created_at
              : "",
        };
      });

      setSectionStats(stats);
    } catch (error) {
      console.error("Error loading data:", error);
      setErrorMessage("Failed to load training examples");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExample = async () => {
    if (
      !formData.sales_rep ||
      !formData.section ||
      !formData.property_address ||
      !formData.timestamp_start ||
      !formData.description
    ) {
      setErrorMessage("Please fill in all required fields");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      await saveTrainingExample({
        ...formData,
        call_date:
          formData.call_date || new Date().toISOString().split("T")[0],
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      // reset form
      setFormData({
        sales_rep: "",
        qc_agent: "",
        property_address: "",
        call_date: "",
        call_time: "",
        section: "",
        timestamp_start: "",
        timestamp_end: "",
        quality_level: "Good",
        description: "",
        key_techniques: [],
        notes: "",
      });
      setNewTechnique("");
      setShowAddForm(false);

      await loadData();
    } catch (error) {
      console.error("Failed to save training example:", error);
      setErrorMessage("Failed to save training example");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const addTechnique = () => {
    if (
      newTechnique.trim() &&
      !formData.key_techniques.includes(newTechnique.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        key_techniques: [...prev.key_techniques, newTechnique.trim()],
      }));
      setNewTechnique("");
    }
  };

  const removeTechnique = (technique: string) => {
    setFormData((prev) => ({
      ...prev,
      key_techniques: prev.key_techniques.filter((t) => t !== technique),
    }));
  };

  const handleSectionClick = (section: string) => {
    setSelectedSection(section);
    setView("section");
  };

  const filteredExamples = examples
    .filter((ex) => (selectedSection ? ex.section === selectedSection : true))
    .filter((ex) => qualityFilter === "All" || ex.quality_level === qualityFilter)
    .filter(
      (ex) =>
        ex.sales_rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
          <span className="text-emerald-500 text-xl">✅</span>
          <div>
            <span className="font-bold">Training Example Added!</span>
            <p className="text-sm">
              The example has been saved to the training library.
            </p>
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

      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Training Library
                </h1>
                <p className="text-slate-600">
                  Curated examples of excellent call techniques
                </p>
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

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-2xl font-bold text-slate-700 mb-2">
              Loading Training Library...
            </div>
            <p className="text-slate-500">Fetching curated call examples</p>
          </div>
        ) : (
          <>
            {view === "overview" && (
              <OverviewDashboard
                examples={examples}
                sectionStats={sectionStats}
                setShowAddForm={setShowAddForm}
                setFormData={setFormData}
                onRefresh={loadData}
                onOpenSection={handleSectionClick}
              />
            )}
            {view === "section" && (
              <SectionDetailView
                selectedSection={selectedSection}
                filteredExamples={filteredExamples}
                sectionStats={sectionStats}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                qualityFilter={qualityFilter}
                setQualityFilter={setQualityFilter}
                setShowAddForm={setShowAddForm}
                setFormData={setFormData}
                onDelete={deleteTrainingExample}
                onReload={loadData}
              />
            )}
            {showAddForm && (
              <AddExampleForm
                formData={formData}
                setFormData={setFormData}
                newTechnique={newTechnique}
                setNewTechnique={setNewTechnique}
                onAddTechnique={addTechnique}
                onRemoveTechnique={removeTechnique}
                onClose={() => setShowAddForm(false)}
                onSave={handleSubmitExample}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}