"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, FileText, Settings, Users, Wrench } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#1F3C88] to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-600">System configuration and preferences</p>
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
                  <Users className="w-4 h-4" />
                  Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Wrench className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-700 mb-4">Settings Coming Soon</h2>
            <p className="text-slate-500 text-lg max-w-md mx-auto mb-8">
              Advanced configuration options and system preferences will be available in the next update.
            </p>
            <div className="space-y-4 text-slate-600 max-w-lg mx-auto">
              <p className="font-medium">Planned features:</p>
              <ul className="text-left space-y-2">
                <li>• User management and permissions</li>
                <li>• Scoring criteria customization</li>
                <li>• Email notification settings</li>
                <li>• Data export preferences</li>
                <li>• Integration configurations</li>
              </ul>
            </div>
            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/">
                <Button className="bg-gradient-to-r from-[#1F3C88] to-blue-600">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/scoring">
                <Button variant="outline">
                  Start Scoring
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}