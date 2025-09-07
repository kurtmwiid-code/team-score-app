"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthWrapper from '@/components/AuthWrapper';
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
  ChevronDown,
  ChevronRight,
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

interface RepStats {
  rep: string;
  total_examples: number;
  excellent_count: number;
  great_count: number;
  good_count: number;
  sections: string[];
  latest_addition: string;
}

/* ------------------------ Supabase Configuration ----------------------- */
const supabaseUrl = "https://qcfgxqtlkqttqbrwygol.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmd4cXRsa3F0dHFicnd5Z29sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MzczNjcsImV4cCI6MjA3MjIxMzM2N30.rN-zOVDOtJdwoRSO0Yi5tr3tK3MGVPJhwvV9yBjUnF0";

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/* --------------------------- Constants --------------------------- */
const salesReps = [
  "Desmaine", "Jonathan", "Kyle", "Jean", "JP", "Phumla",
  "Michelle B", "Tiyani", "Hadya", "Banele", "Susan"
];

const qcAgents = ["Jennifer", "Popi"];

const scoringSections = [
  "Intro", "Bonding & Rapport", "Magic Problem", "First Ask",
  "Property & Condition Questions", "Second Ask", "Second Call - The Close", "Overall Performance"
];

const qualityLevels = [
  { value: "Good", color: "bg-blue-100 text-blue-700", icon: "👍" },
  { value: "Great", color: "bg-emerald-100 text-emerald-700", icon: "⭐" },
  { value: "Excellent", color: "bg-purple-100 text-purple-700", icon: "🏆" },
];

/* ---------------------- Database Functions ---------------------- */
const saveTrainingExample = async (
  example: Omit<TrainingExample, "id" | "created_at" | "updated_at">
) => {
  if (!supabase) throw new Error("Database connection not available");
  const { data, error } = await supabase
    .from("training_examples")
    .insert([{ ...example, key_techniques: JSON.stringify(example.key_techniques) }])
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
      key_techniques: typeof item.key_techniques === "string"
        ? JSON.parse(item.key_techniques)
        : item.key_techniques || [],
    })) || []
  );
};

const deleteTrainingExample = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from("training_examples").delete().eq("id", id);
  if (error) throw error;
};

/* ===================== COMPONENTS ===================== */

// Collapsible Training Card
interface CollapsibleTrainingCardProps {
  example: TrainingExample;
  isExpanded: boolean;
  onToggle: () => void;
}

const CollapsibleTrainingCard: React.FC<CollapsibleTrainingCardProps> = ({
  example, isExpanded, onToggle
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded]);

  const getQualityBadgeColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'great': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'good': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {example.sales_rep || 'Unknown Rep'}
                </h3>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getQualityBadgeColor(example.quality_level)}`}>
                  {example.quality_level || 'Not Rated'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span className="truncate">{example.property_address || 'No address provided'}</span>
              <span className="flex-shrink-0 ml-4">{formatDate(example.created_at)}</span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ height: `${height}px`, transition: 'height 0.3s ease-in-out', overflow: 'hidden' }}>
        <div ref={contentRef} className="border-t border-gray-200">
          <div className="p-4 space-y-4">
            {example.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{example.description}</p>
              </div>
            )}
            {example.key_techniques && example.key_techniques.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Techniques Used</h4>
                <div className="flex flex-wrap gap-1">
                  {example.key_techniques.map((technique: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {technique}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {example.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{example.notes}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Call Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div><span className="font-medium">Date:</span> {example.call_date}</div>
                {example.call_time && <div><span className="font-medium">Time:</span> {example.call_time}</div>}
                <div><span className="font-medium">Section:</span> {example.section}</div>
                <div><span className="font-medium">QC Agent:</span> {example.qc_agent}</div>
              </div>
            </div>
            {(example.timestamp_start || example.timestamp_end) && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recording Timestamps</h4>
                <div className="text-sm text-gray-600">
                  {example.timestamp_start && <div><span className="font-medium">Start:</span> {example.timestamp_start}</div>}
                  {example.timestamp_end && <div><span className="font-medium">End:</span> {example.timestamp_end}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Rep Profile Card
interface RepProfileCardProps {
  rep: string;
  stats: RepStats;
  selectedSection?: string;
  onClick: (rep: string) => void;
}

const RepProfileCard: React.FC<RepProfileCardProps> = ({ rep, stats, selectedSection, onClick }) => {
  return (
    <Card 
      className="shadow-lg border-slate-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300"
      onClick={() => onClick(rep)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            {rep.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{rep}</h3>
            {selectedSection && <p className="text-sm text-slate-500">{selectedSection} Examples</p>}
          </div>
          <div className="w-full space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1F3C88]">{stats.total_examples}</div>
              <div className="text-xs text-slate-600">
                {selectedSection ? `${selectedSection} Examples` : 'Total Examples'}
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                🏆 {stats.excellent_count}
              </span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                ⭐ {stats.great_count}
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                👍 {stats.good_count}
              </span>
            </div>
            {!selectedSection && (
              <div className="text-xs text-slate-500">Active in {stats.sections.length} sections</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Rep Profile Grid
interface RepProfileGridProps {
  examples: TrainingExample[];
  selectedSection?: string;
  onSelectRep: (rep: string) => void;
  onBack: () => void;
}

const RepProfileGrid: React.FC<RepProfileGridProps> = ({ examples, selectedSection, onSelectRep, onBack }) => {
  const repStats = useMemo(() => {
    const stats: { [key: string]: RepStats } = {};
    const filteredExamples = selectedSection 
      ? examples.filter(ex => ex.section === selectedSection)
      : examples;

    filteredExamples.forEach(example => {
      const rep = example.sales_rep;
      if (!stats[rep]) {
        stats[rep] = {
          rep, total_examples: 0, excellent_count: 0, great_count: 0, good_count: 0,
          sections: [], latest_addition: example.created_at
        };
      }
      stats[rep].total_examples++;
      switch (example.quality_level) {
        case 'Excellent': stats[rep].excellent_count++; break;
        case 'Great': stats[rep].great_count++; break;
        case 'Good': stats[rep].good_count++; break;
      }
      if (!stats[rep].sections.includes(example.section)) {
        stats[rep].sections.push(example.section);
      }
      if (new Date(example.created_at) > new Date(stats[rep].latest_addition)) {
        stats[rep].latest_addition = example.created_at;
      }
    });

    return Object.values(stats).sort((a, b) => b.total_examples - a.total_examples);
  }, [examples, selectedSection]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            {selectedSection ? `Back to ${selectedSection}` : 'Back to Overview'}
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              {selectedSection ? `${selectedSection} - Rep Profiles` : 'All Rep Profiles'}
            </h1>
            <p className="text-slate-600 text-lg">View training examples by sales representative</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1F3C88] mb-1">{repStats.length}</div>
            <div className="text-slate-600">Active Reps</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {repStats.reduce((sum, rep) => sum + rep.total_examples, 0)}
            </div>
            <div className="text-slate-600">
              {selectedSection ? `${selectedSection} Examples` : 'Total Examples'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">
              {repStats.reduce((sum, rep) => sum + rep.excellent_count, 0)}
            </div>
            <div className="text-slate-600">Excellent Examples</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              {Math.round(repStats.reduce((sum, rep) => sum + rep.total_examples, 0) / repStats.length) || 0}
            </div>
            <div className="text-slate-600">Avg Examples/Rep</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Sales Representatives</h2>
        {repStats.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl font-semibold text-slate-600 mb-2">No examples found</div>
            <p className="text-slate-500">
              {selectedSection 
                ? `No training examples in ${selectedSection} section yet.`
                : 'No training examples added yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {repStats.map((repStat) => (
              <RepProfileCard
                key={repStat.rep}
                rep={repStat.rep}
                stats={repStat}
                selectedSection={selectedSection}
                onClick={onSelectRep}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Rep Profile
interface IndividualRepProfileProps {
  rep: string;
  examples: TrainingExample[];
  selectedSection?: string;
  onBack: () => void;
  expandedCards: Set<string>;
  toggleCard: (cardId: string) => void;
}

const IndividualRepProfile: React.FC<IndividualRepProfileProps> = ({
  rep, examples, selectedSection, onBack, expandedCards, toggleCard
}) => {
  const repExamples = examples.filter(ex => 
    ex.sales_rep === rep && (selectedSection ? ex.section === selectedSection : true)
  );

  const repStats = useMemo(() => {
    const stats = {
      total: repExamples.length,
      excellent: repExamples.filter(ex => ex.quality_level === 'Excellent').length,
      great: repExamples.filter(ex => ex.quality_level === 'Great').length,
      good: repExamples.filter(ex => ex.quality_level === 'Good').length,
      sections: [...new Set(repExamples.map(ex => ex.section))],
      latest: repExamples.length > 0 ? repExamples.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at : null
    };
    return stats;
  }, [repExamples]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Back to Rep Profiles
          </Button>
          <div className="w-14 h-14 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            {rep.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">{rep}</h1>
            <p className="text-slate-600 text-lg">
              {selectedSection ? `${selectedSection} Training Examples` : 'All Training Examples'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#1F3C88] mb-1">{repStats.total}</div>
            <div className="text-slate-600">
              {selectedSection ? `${selectedSection} Examples` : 'Total Examples'}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{repStats.excellent}</div>
            <div className="text-slate-600">Excellent</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-1">{repStats.great}</div>
            <div className="text-slate-600">Great</div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">{repStats.sections.length}</div>
            <div className="text-slate-600">Active Sections</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl border-slate-200">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Training Examples</h2>
            {repStats.latest && (
              <div className="text-sm text-slate-500">
                Latest: {new Date(repStats.latest).toLocaleDateString()}
              </div>
            )}
          </div>
          {repExamples.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl font-semibold text-slate-600 mb-2">No examples found</div>
              <p className="text-slate-500">
                {selectedSection 
                  ? `${rep} has no training examples in ${selectedSection} section yet.`
                  : `${rep} has no training examples yet.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {repExamples.map((example: TrainingExample) => (
                <CollapsibleTrainingCard
                  key={example.id}
                  example={example}
                  isExpanded={expandedCards.has(example.id)}
                  onToggle={() => toggleCard(example.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Overview Dashboard
interface OverviewDashboardProps {
  examples: TrainingExample[];
  sectionStats: SectionStats[];
  setShowAddForm: (v: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onRefresh: () => void;
  onOpenSection: (section: string) => void;
  onViewRepProfiles: () => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  examples, sectionStats, setShowAddForm, setFormData, onRefresh, onOpenSection, onViewRepProfiles
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Training Library</h1>
          <p className="text-slate-600 text-lg">Curated examples of excellent call techniques by section</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onViewRepProfiles} variant="outline" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Rep Profiles
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-[#1F3C88] to-blue-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Training Example
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={onRefresh}>
            <Filter className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{examples.length}</h3>
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
                  {examples.filter((ex) => ex.quality_level === "Excellent").length}
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
                <h3 className="text-2xl font-bold text-slate-800">{scoringSections.length}</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoringSections.map((section, index) => {
          const stats = sectionStats.find((s) => s.section === section);
          const hasExamples = stats && stats.total_examples > 0;
          return (
            <Card
              key={section}
              onClick={() => (hasExamples ? onOpenSection(section) : null)}
              className={`shadow-xl border-slate-200 overflow-hidden group transition-all duration-300 ${
                hasExamples ? "hover:shadow-2xl hover:-translate-y-1 cursor-pointer" : "opacity-60"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{section}</h3>
                  </div>
                  {hasExamples && (
                    <div className="text-2xl font-bold text-[#1F3C88]">{stats!.total_examples}</div>
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
                      Latest: {stats!.latest_addition
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
                        setFormData((prev: any) => ({ ...prev, section }));
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

// Section Detail View
interface SectionDetailViewProps {
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
  expandedCards: Set<string>;
  toggleCard: (cardId: string) => void;
  onViewRepProfiles: (section: string) => void;
}

const SectionDetailView: React.FC<SectionDetailViewProps> = ({
  selectedSection, filteredExamples, sectionStats, searchTerm, setSearchTerm,
  qualityFilter, setQualityFilter, setShowAddForm, setFormData, onDelete, onReload,
  expandedCards, toggleCard, onViewRepProfiles
}) => {
  if (!selectedSection) return null;

  const sectionExamples = filteredExamples.filter((ex) => ex.section === selectedSection);
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
            <h1 className="text-4xl font-bold text-slate-800">{selectedSection}</h1>
            <p className="text-slate-600 text-lg">Training examples and best practices</p>
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
            onClick={() => onViewRepProfiles(selectedSection)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Rep Profiles
          </Button>
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

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-[#1F3C88] mb-1">{stats.total_examples}</div>
              <div className="text-slate-600">Total Examples</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.excellent_count}</div>
              <div className="text-slate-600">Excellent</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.great_count}</div>
              <div className="text-slate-600">Great</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.good_count}</div>
              <div className="text-slate-600">Good</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-xl border-slate-200">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Training Examples</h2>
          {sectionExamples.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-xl font-semibold text-slate-600 mb-2">No examples found</div>
              <p className="text-slate-500 mb-4">Be the first to add a training example for this section.</p>
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
            <div className="space-y-3">
              {sectionExamples.map((example: TrainingExample) => (
                <CollapsibleTrainingCard
                  key={example.id}
                  example={example}
                  isExpanded={expandedCards.has(example.id)}
                  onToggle={() => toggleCard(example.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Add Example Form
interface AddExampleFormProps {
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
}

const autoGrow = (el: HTMLTextAreaElement) => {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

const AddExampleForm: React.FC<AddExampleFormProps> = ({
  formData, setFormData, newTechnique, setNewTechnique,
  onAddTechnique, onRemoveTechnique, onClose, onSave
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Add Training Example</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sales Rep *</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.sales_rep}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, sales_rep: e.target.value }))}
              >
                <option value="">Select Sales Rep</option>
                {salesReps.map((rep) => (
                  <option key={rep} value={rep}>{rep}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">QC Agent</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.qc_agent}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, qc_agent: e.target.value }))}
              >
                <option value="">Select QC Agent</option>
                {qcAgents.map((agent) => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Property Address *</label>
              <input
                type="text"
                placeholder="123 Main St, City, State ZIP"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.property_address}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, property_address: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Call Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.call_date}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, call_date: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Training Section *</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.section}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, section: e.target.value }))}
              >
                <option value="">Select Section</option>
                {scoringSections.map((section) => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quality Level *</label>
              <select
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.quality_level}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, quality_level: e.target.value as "Good" | "Great" | "Excellent" }))}
              >
                {qualityLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.icon} {level.value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Time *</label>
              <input
                type="text"
                placeholder="e.g., 2:30 or 1:45"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.timestamp_start}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, timestamp_start: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Time (Optional)</label>
              <input
                type="text"
                placeholder="e.g., 3:45"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
                value={formData.timestamp_end}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, timestamp_end: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">What made this example excellent?</label>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
              placeholder="Describe what the sales rep did exceptionally well..."
              rows={1}
              value={formData.description}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
              onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Key Techniques Used</label>
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

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes</label>
            <textarea
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-[#1F3C88] focus:ring-2 focus:ring-[#1F3C88]/20 transition-all"
              placeholder="Any additional context, coaching points, or observations..."
              rows={1}
              value={formData.notes}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, notes: e.target.value }))}
              onInput={(e) => autoGrow(e.target as HTMLTextAreaElement)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
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

/* ============================ MAIN PAGE ============================ */
export default function TrainingPage() {
  const [view, setView] = useState<"overview" | "section" | "rep-profiles" | "individual-rep">("overview");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [examples, setExamples] = useState<TrainingExample[]>([]);
  const [sectionStats, setSectionStats] = useState<SectionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [qualityFilter, setQualityFilter] = useState<string>("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    sales_rep: "", qc_agent: "", property_address: "", call_date: "", call_time: "",
    section: "", timestamp_start: "", timestamp_end: "",
    quality_level: "Good" as "Good" | "Great" | "Excellent",
    description: "", key_techniques: [] as string[], notes: ""
  });

  const [newTechnique, setNewTechnique] = useState("");

  const toggleCard = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const handleRepSelect = (rep: string) => {
    setSelectedRep(rep);
    setView("individual-rep");
  };

  const handleBackFromRepProfile = () => {
    setSelectedRep(null);
    if (selectedSection) {
      setView("section");
    } else {
      setView("overview");
    }
  };

  const handleBackFromIndividualRep = () => {
    setSelectedRep(null);
    setView("rep-profiles");
  };

  const handleViewRepProfiles = (section?: string) => {
    if (section) {
      setSelectedSection(section);
    }
    setView("rep-profiles");
  };

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
          excellent_count: sectionExamples.filter((ex) => ex.quality_level === "Excellent").length,
          great_count: sectionExamples.filter((ex) => ex.quality_level === "Great").length,
          good_count: sectionExamples.filter((ex) => ex.quality_level === "Good").length,
          latest_addition: sectionExamples.length > 0
            ? sectionExamples.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
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
    if (!formData.sales_rep || !formData.section || !formData.property_address || !formData.timestamp_start) {
      setErrorMessage("Please fill in all required fields");
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      return;
    }

    try {
      await saveTrainingExample({
        ...formData,
        call_date: formData.call_date || new Date().toISOString().split("T")[0],
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);

      setFormData({
        sales_rep: "", qc_agent: "", property_address: "", call_date: "", call_time: "",
        section: "", timestamp_start: "", timestamp_end: "", quality_level: "Good",
        description: "", key_techniques: [], notes: ""
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
    if (newTechnique.trim() && !formData.key_techniques.includes(newTechnique.trim())) {
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
    .filter((ex) =>
      ex.sales_rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        {showSuccess && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-emerald-100 border border-emerald-400 text-emerald-700 px-6 py-4 rounded-xl flex items-center gap-3 shadow-2xl max-w-md">
            <div>
              <span className="font-bold">Training Example Added!</span>
              <p className="text-sm">The example has been saved to the training library.</p>
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

        <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Training Library</h1>
                  <p className="text-slate-600">Curated examples of excellent call techniques</p>
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
              <div className="text-2xl font-bold text-slate-700 mb-2">Loading Training Library...</div>
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
                  onViewRepProfiles={() => handleViewRepProfiles()}
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
                  expandedCards={expandedCards}
                  toggleCard={toggleCard}
                  onViewRepProfiles={handleViewRepProfiles}
                />
              )}
              {view === "rep-profiles" && (
                <RepProfileGrid
                  examples={examples}
                  selectedSection={selectedSection || undefined}
                  onSelectRep={handleRepSelect}
                  onBack={handleBackFromRepProfile}
                />
              )}
              {view === "individual-rep" && selectedRep && (
                <IndividualRepProfile
                  rep={selectedRep}
                  examples={examples}
                  selectedSection={selectedSection || undefined}
                  onBack={handleBackFromIndividualRep}
                  expandedCards={expandedCards}
                  toggleCard={toggleCard}
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
    </AuthWrapper>
  );
}