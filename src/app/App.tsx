import { useState } from "react";

import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";

import { StatCard } from "./components/StatCard";
import { RecentDocumentsTable } from "./components/RecentDocumentsTable";
import { IncomingDocuments } from "./components/IncomingDocuments";

import { SmartSearch } from "./components/SmartSearch";

import { MonthlyTaskStats } from "./components/MonthlyTaskStats";
import { CategoryChart } from "./components/CategoryChart";
import { RecentActivity } from "./components/RecentActivity";
import { QuickActions } from "./components/QuickActions";

import { DocumentProcessingFlow } from "./components/DocumentProcessingFlow";
import { DocumentRoutingFlow } from "./components/DocumentRoutingFlow";

import { ClientRequestChat } from "./components/ClientRequestChat";
import { DepartmentInbox } from "./components/DepartmentInbox";

import {
  FileText,
  FileDown,
  AlertCircle,
  CheckSquare,
} from "lucide-react";

export default function App() {
  const [activeItem, setActiveItem] = useState("dashboard");

  const hideTopBarPages = ["search", "chat", "inbox"];

  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />

      {/* Main content */}
      <div className="ml-64">

        {!hideTopBarPages.includes(activeItem) && <TopBar />}

        {/* Router */}
        {activeItem === "incoming" ? (
          <IncomingDocuments />
        ) : activeItem === "inbox" ? (
          <DepartmentInbox />
        ) : activeItem === "search" ? (
          <SmartSearch />
        ) : activeItem === "chat" ? (
          <ClientRequestChat />
        ) : (
          <main className="p-8">

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Boshqaruv paneli
              </h1>

              <p className="text-muted-foreground">
                Bugungi hujjatlar va jarayonlar holatini shu yerda ko‘rishingiz mumkin.
              </p>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              <StatCard
                title="Jami hujjatlar"
                value="1,284"
                icon={FileText}
                trend={{ value: "+12.5% o'tgan oyga nisbatan", isPositive: true }}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
              />

              <StatCard
                title="Kelib tushgan hujjatlar"
                value="342"
                icon={FileDown}
                trend={{ value: "+8.2% o'tgan haftaga nisbatan", isPositive: true }}
                iconColor="text-cyan-600"
                iconBg="bg-cyan-100"
              />

              <StatCard
                title="Jarayondagi vazifalar"
                value="87"
                icon={CheckSquare}
                trend={{ value: "-3.1% kechagi kunga nisbatan", isPositive: false }}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />

              <StatCard
                title="Kechikkan vazifalar"
                value="12"
                icon={AlertCircle}
                trend={{ value: "Kechadan beri +2 ta", isPositive: false }}
                iconColor="text-red-600"
                iconBg="bg-red-100"
              />

            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MonthlyTaskStats />
              <CategoryChart />
            </div>

            {/* Routing diagram */}
            <div className="mb-8">
              <DocumentRoutingFlow />
            </div>

            {/* Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              <div className="lg:col-span-2">
                <RecentDocumentsTable />
              </div>

              <RecentActivity />

            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <QuickActions />

              <div className="lg:col-span-2">
                <DocumentProcessingFlow />
              </div>

            </div>

          </main>
        )}
      </div>
    </div>
  );
}