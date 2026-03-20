// src/App.tsx
import React, { useState, useEffect } from "react";
import { Home, Users, BookOpen, Grid3x3, LogOut } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import Enrollments from "./pages/Enrollment";

type TabType = "dashboard" | "students" | "subjects" | "sections" | "enrollments";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "students", label: "Students", icon: Users },
    { id: "subjects", label: "Subjects", icon: BookOpen },
    { id: "sections", label: "Sections", icon: Grid3x3 },
    { id: "enrollments", label: "Enrollments", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-center h-12 bg-blue-600 rounded-lg">
            <span className="text-2xl font-bold">USTP</span>
          </div>
          {sidebarOpen && <p className="mt-2 text-center text-sm font-semibold">Enrollment</p>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700 transition-all">
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900">
                {navigationItems.find((item) => item.id === activeTab)?.label}
              </h1>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="p-8">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "students" && <Students />}
          {activeTab === "subjects" && <Subjects />}
          {activeTab === "sections" && <Sections />}
          {activeTab === "enrollments" && <Enrollments />}
        </section>
      </main>
    </div>
  );
};

export default App;