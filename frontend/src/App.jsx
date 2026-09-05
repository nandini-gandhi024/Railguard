import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import FaultDetectionStudio from './components/FaultDetectionStudio';
import RiskXAIModule from './components/RiskXAIModule';
import BlockPlanningStudio from './components/BlockPlanningStudio';
import RiskSimulatorLab from './components/RiskSimulatorLab';
import RailwayMap from './components/RailwayMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedZone, setSelectedZone] = useState('Northern Railway (NR - Delhi Div)');
  const [selectedTrackId, setSelectedTrackId] = useState('TRK-NR-101');
  const [tracks, setTracks] = useState([]);
  const [summary, setSummary] = useState(null);

  // Initial tracks data for fallback
  const fallbackTracks = [
    {
      track_id: 'TRK-NR-101',
      location: 'Delhi - Kanpur Line, KM 142.5',
      section: 'NDLS-CNB Mainline',
      zone: 'Northern Railway (NR)',
      traffic_per_day: 58,
      composite_risk: 88.5,
      risk_category: 'CRITICAL RISK',
      tsr_speed: 30,
      days_to_critical: 2
    },
    {
      track_id: 'TRK-NR-108',
      location: 'Aligarh - Ghaziabad, KM 88.2',
      section: 'NDLS-CNB Mainline',
      zone: 'Northern Railway (NR)',
      traffic_per_day: 45,
      composite_risk: 32.0,
      risk_category: 'LOW RISK',
      tsr_speed: 130,
      days_to_critical: 28
    },
    {
      track_id: 'TRK-CR-204',
      location: 'Kharghar - Panvel Section, KM 42.1',
      section: 'CSTM-PUNE Corridor',
      zone: 'Central Railway (CR)',
      traffic_per_day: 68,
      composite_risk: 82.0,
      risk_category: 'CRITICAL RISK',
      tsr_speed: 30,
      days_to_critical: 3
    },
    {
      track_id: 'TRK-WR-302',
      location: 'Virar - Dahanu Road, KM 74.8',
      section: 'BCT-ADI Mainline',
      zone: 'Western Railway (WR)',
      traffic_per_day: 52,
      composite_risk: 42.5,
      risk_category: 'MODERATE RISK',
      tsr_speed: 90,
      days_to_critical: 18
    },
    {
      track_id: 'TRK-ER-405',
      location: 'Barddhaman - Asansol, KM 195.4',
      section: 'HWH-NDLS Grand Chord',
      zone: 'Eastern Railway (ER)',
      traffic_per_day: 72,
      composite_risk: 68.0,
      risk_category: 'HIGH RISK',
      tsr_speed: 60,
      days_to_critical: 7
    }
  ];

  useEffect(() => {
    fetchTracks();
    fetchSummary();
  }, []);

  const fetchTracks = () => {
    fetch('http://localhost:8000/api/tracks')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTracks(data);
        } else {
          setTracks(fallbackTracks);
        }
      })
      .catch(() => {
        setTracks(fallbackTracks);
      });
  };

  const fetchSummary = () => {
    fetch('http://localhost:8000/api/dashboard-summary')
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null));
  };

  const handleSelectTrack = (trackId) => {
    setSelectedTrackId(trackId);
    setActiveTab('risk_xai');
  };

  const handleNavigateToBlockPlanner = (trackId) => {
    if (trackId) setSelectedTrackId(trackId);
    setActiveTab('block_planner');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans pb-12">
      <div className="app-container">
        {/* Navigation Header */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedZone={selectedZone}
          setSelectedZone={setSelectedZone}
        />

        {/* Dynamic Tab Views */}
        <main>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              summary={summary}
              tracks={tracks.length > 0 ? tracks : fallbackTracks}
              onSelectTrack={handleSelectTrack}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'geo_map' && (
            <RailwayMap
              onNavigateToSimulator={() => setActiveTab('simulator')}
            />
          )}

          {activeTab === 'cv_studio' && (
            <FaultDetectionStudio
              onAnalyzeComplete={() => fetchTracks()}
              onNavigateToRisk={() => setActiveTab('risk_xai')}
            />
          )}

          {activeTab === 'risk_xai' && (
            <RiskXAIModule
              selectedTrackId={selectedTrackId}
              tracks={tracks.length > 0 ? tracks : fallbackTracks}
              onNavigateToBlockPlanner={handleNavigateToBlockPlanner}
            />
          )}

          {activeTab === 'block_planner' && (
            <BlockPlanningStudio />
          )}

          {activeTab === 'simulator' && (
            <RiskSimulatorLab
              tracks={tracks.length > 0 ? tracks : fallbackTracks}
              onNavigateToPlanner={() => setActiveTab('block_planner')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <p className="font-semibold text-slate-400">
            RAILGUARD — AI-Powered Railway Risk Assessment & Block Availability System
          </p>
          <p className="mt-1 text-[11px]">
            Smart India Hackathon (SIH 2026) • Problem Statement SIH26027 • Indian Railways Ministry AI Initiative
          </p>
        </footer>
      </div>
    </div>
  );
}
