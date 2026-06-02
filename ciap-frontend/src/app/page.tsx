"use client";

import { useState, useEffect, use } from "react";
import { apiService } from "@/services/api";

// View Components
import { CreatorOverviewView } from "@/components/dashboard/views/CreatorOverviewView";
import { SmeOverviewView } from "@/components/dashboard/views/SmeOverviewView";
import { DiscoveryView } from "@/components/dashboard/views/DiscoveryView";
import { CampaignsView } from "@/components/dashboard/views/CampaignsView";
import { ContentView } from "@/components/dashboard/views/ContentView";
import { AudienceView } from "@/components/dashboard/views/AudienceView";
import { GrowthView } from "@/components/dashboard/views/GrowthView";
import { SmeSavedCreatorsView } from "@/components/dashboard/views/SmeSavedCreatorsView";
import { CompareView } from "@/components/dashboard/views/CompareView";

// Navigation Components
import { DashboardSidebar } from "@/components/dashboard/navigation/DashboardSidebar";
import { DashboardBottomNav } from "@/components/dashboard/navigation/DashboardBottomNav";

interface PlatformItem {
  platform?: string;
}

type HomePageProps = {
  searchParams: Promise<{
    view?: string | string[];
  }>;
};

interface ContentItem {
  id: string;
  title: string;
  views: string;
  engagement: string;
  platform: string;
  imageUrl: string;
}

import { useAuth } from "@/context/AuthContext";

export default function Home({ searchParams }: HomePageProps) {
  const { user } = useAuth();
  const resolvedSearchParams = use(searchParams);
  const initialView = typeof resolvedSearchParams.view === "string" ? resolvedSearchParams.view : "overview";
  
  // Strict role enforcement based on authenticated session
  const role = (user?.role || "CREATOR").toLowerCase();

  // State for Sub-tabs
  const [activeTab, setActiveTab] = useState("All Platforms");

  // State for Main Page Views
  const [activeView, setActiveView] = useState(initialView);
  const userName = user?.fullName || user?.email?.split('@')[0] || "User";
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState("Last 30 Days");
  const [audienceTimeTab, setAudienceTimeTab] = useState("Last 30 Days");
  const dateRanges = ["Last 7 Days", "Last 30 Days", "This Month", "This Year"];
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    if (!user || isSyncing) return;
    setIsSyncing(true);
    try {
      await apiService.queuePlatformSync([]); // Empty array means sync all platforms for this user
      // Give the backend a moment to process the sync, then refresh the dashboard
      setTimeout(() => {
        // We can just toggle a state or re-run the effect
        setActiveDateRange(prev => prev); // This will trigger the useEffect if we add a dependency, but we can also just reload
        window.location.reload(); // Simple refresh for now
      }, 2000);
    } catch (err) {
      console.error("Sync failed:", err);
      setIsSyncing(false);
    }
  }

  // Forecaster State
  const [forecasterGoal, setForecasterGoal] = useState("Brand Awareness");
  const [forecasterBudget, setForecasterBudget] = useState(250000);
  const [forecasterDuration, setForecasterDuration] = useState("14 Days");
  const [forecasterCreatorMode, setForecasterCreatorMode] = useState("Mixed");
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(["All Platforms"]);

  // Discovery State
  const [discoverySearch, setDiscoverySearch] = useState("");
  const [selectedCreatorsCount, setSelectedCreatorsCount] = useState(0);
  const [selectedCreatorIds, setSelectedCreatorIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAllData() {
      if (!user) return;
      try {
        if (role === 'creator') {
          const cid = user.id;
          const results = await Promise.allSettled([
            apiService.fetchInfluenceScore(cid),
            apiService.fetchCreatorDashboard(cid, activeDateRange),
            apiService.fetchContent(activeDateRange),
            apiService.fetchConnectedPlatforms()
          ]);
          if (cancelled) return;

          const [scoreResult, dashboardResult, contentResult, platformResult] = results;

          const scoreData = scoreResult.status === 'fulfilled' ? scoreResult.value : {};
          const dashboardData = dashboardResult.status === 'fulfilled' ? dashboardResult.value : {};
          if (dashboardResult.status === 'rejected') console.error("Dashboard fetch failed:", dashboardResult.reason);

          setStats({ ...(scoreData?.data || {}), ...(dashboardData?.data || {}) });
          setContent(contentResult.status === 'fulfilled' ? contentResult.value.data?.items || [] : []);

          const platforms = platformResult.status === 'fulfilled'
            ? ((platformResult.value.data?.items || []) as PlatformItem[]).map((p) => {
                const name = p.platform || "";
                if (name.toLowerCase() === "youtube") return "YouTube";
                return name.charAt(0).toUpperCase() + name.slice(1);
              })
            : [];
          setConnectedPlatforms(["All Platforms", ...platforms]);
        } else {
          const smeResult = await apiService.fetchSmeDashboard().catch(() => null);
          setStats(smeResult?.data || {});
        }
      } catch (err) {
        console.error("Dashboard Loading Error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAllData();
    return () => { cancelled = true; };
  }, [role, activeDateRange, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const commonNavbarProps = {
    activeDateRange,
    isDateMenuOpen,
    dateRanges,
    onToggleDateMenu: () => setIsDateMenuOpen(!isDateMenuOpen),
    onSelectDateRange: (range: string) => { setActiveDateRange(range); setIsDateMenuOpen(false); },
    onSync: handleSync,
    isSyncing,
  };

  return (
    <main className="min-h-screen relative flex lg:justify-center bg-[#FAFAFA]">
      <DashboardSidebar 
        role={role} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <div className="flex-1 w-full max-w-[480px] lg:max-w-5xl mx-auto min-h-screen pt-0 px-6 pb-32 lg:pb-12 lg:px-12">
        {/* VIEW ROUTER */}
        {activeView === "overview" && (
          role === "creator" ? (
            <CreatorOverviewView 
              userName={userName}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              connectedPlatforms={connectedPlatforms}
              stats={stats}
              {...commonNavbarProps}
            />
          ) : (
            <SmeOverviewView stats={stats} {...commonNavbarProps} />
          )
        )}

        {activeView === "discovery" && role === "sme" && (
          showCompare ? (
            <CompareView
              onBack={() => { setShowCompare(false); setSelectedCreatorIds([]); setSelectedCreatorsCount(0); }}
              creatorIds={selectedCreatorIds}
            />
          ) : (
            <DiscoveryView 
              userName={userName}
              discoverySearch={discoverySearch}
              setDiscoverySearch={setDiscoverySearch}
              selectedCreatorsCount={selectedCreatorsCount}
              setSelectedCreatorsCount={setSelectedCreatorsCount}
              onCompare={(ids) => { setSelectedCreatorIds(ids); setShowCompare(true); }}
              {...commonNavbarProps}
            />
          )
        )}

        {activeView === "campaigns" && role === "sme" && (
          <CampaignsView 
            forecasterGoal={forecasterGoal}
            setForecasterGoal={setForecasterGoal}
            forecasterBudget={forecasterBudget}
            setForecasterBudget={setForecasterBudget}
            forecasterDuration={forecasterDuration}
            setForecasterDuration={setForecasterDuration}
            forecasterCreatorMode={forecasterCreatorMode}
            setForecasterCreatorMode={setForecasterCreatorMode}
            {...commonNavbarProps}
          />
        )}

        {activeView === "content" && role === "creator" && (
          <ContentView 
            userName={userName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            connectedPlatforms={connectedPlatforms}
            content={content}
            {...commonNavbarProps}
          />
        )}

        {activeView === "audience" && role === "creator" && (
          <AudienceView 
            userName={userName}
            audienceTimeTab={audienceTimeTab}
            setAudienceTimeTab={setAudienceTimeTab}
            {...commonNavbarProps}
          />
        )}

        {activeView === "growth" && role === "creator" && (
          <GrowthView 
            userName={userName}
            stats={stats}
            audienceTimeTab={audienceTimeTab}
            setAudienceTimeTab={setAudienceTimeTab}
            setActiveView={setActiveView}
            {...commonNavbarProps}
          />
        )}

        {activeView === "saved" && role === "sme" && (
          <SmeSavedCreatorsView />
        )}
      </div>

      <DashboardBottomNav 
        role={role} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
    </main>
  );
}
