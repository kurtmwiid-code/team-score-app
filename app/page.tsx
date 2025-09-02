"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ClipboardCheck, Settings } from "lucide-react";

export default function HomePage() {
  const sections = [
    {
      title: "Scoring",
      description: "Evaluate and score reps quickly and easily.",
      href: "/scoring",
      icon: <ClipboardCheck className="h-10 w-10 text-blue-600" />,
    },
    {
      title: "Reporting",
      description: "View analytics and performance reports.",
      href: "/reporting",
      icon: <BarChart3 className="h-10 w-10 text-green-600" />,
    },
    {
      title: "Settings",
      description: "Configure scoring criteria and app preferences.",
      href: "/settings",
      icon: <Settings className="h-10 w-10 text-gray-600" />,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-5xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Team Scoring Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome! Choose an area below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center text-center"
          >
            <CardContent className="flex flex-col items-center gap-4">
              {section.icon}
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="text-gray-600 text-sm">{section.description}</p>
              <Link href={section.href} className="w-full">
                <Button className="w-full mt-4">{section.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
