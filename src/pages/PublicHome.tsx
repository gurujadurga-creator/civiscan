import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Shield,
  Camera,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  BarChart,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

export const PublicHome: React.FC = () => {
  const { setCurrentPage, stats, issues, setSelectedIssue } = useApp();

  const recentResolved = issues.filter((i) => i.status === 'Completed').slice(0, 2);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-8 md:p-14 shadow-xl">
        {/* Subtle background mesh pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Next-Gen Civic Infrastructure AI Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            CIVISCAN
            <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-blue-400 mt-2">
              Detect Early. Prioritize Smartly. Build Safer Cities.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive municipal road damage and garbage monitoring system. Automated computer vision triaging, explainable hazard priority rankings, GPS mapping, and verified field repair workflows for resilient civic environments.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setCurrentPage('upload')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-600/30 transition-all active:scale-98"
            >
              <Camera className="h-4.5 w-4.5" />
              Report Hazard or Road Defect
            </button>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-800 hover:text-white transition-all backdrop-blur-md"
            >
              <span>Explore Municipal Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="relative z-10 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats?.totalIssues || 6}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Tracked Civic Deficiencies</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats?.completedIssues || 2}
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Verified Remediations</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {stats?.resolutionRatePercent || 33}%
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Current Resolution Rate</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              ~1.8 Days
            </div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Average Field Dispatch Time</div>
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Lifecycle */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">How CIVISCAN Powers Smarter Cities</h2>
          <p className="text-sm text-slate-600">
            From the moment a pothole or illegal dump is detected to final official sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold mb-4">
              <Camera className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Step 1</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Capture & Geotag</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Upload field imagery from mobile cameras or vehicle mounts. High-accuracy GPS or image EXIF metadata establishes the exact street coordinate with zero guesswork.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 font-bold mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Step 2</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Computer Vision AI & Priority</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Autonomous inspection algorithms classify craters, longitudinal cracks, or garbage blockages. Severity scoring computes explainable High, Medium, or Low urgency.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step 3</span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">Field Repair & Officer Sign-Off</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Dispatched technicians complete repairs with materials logging. Official municipal officers must inspect before-and-after proof before an issue is finalized.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Remediation Showcase */}
      {recentResolved.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Before & After Field Remediations</h2>
              <p className="text-xs text-slate-500">Transparent proof of municipal work across the city</p>
            </div>
            <button
              onClick={() => setCurrentPage('completed')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All Resolved Archive</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentResolved.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIssue(item)}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all"
              >
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="relative rounded-lg overflow-hidden aspect-4/3 bg-slate-200">
                    <img
                      src={item.imageUrl}
                      alt="Before repair"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-red-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      BEFORE
                    </span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden aspect-4/3 bg-slate-200">
                    <img
                      src={item.repairData?.completionPhotoUrl || item.imageUrl}
                      alt="After repair"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 bg-emerald-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      REPAIRED
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">{item.id}</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Officer Verified
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {item.location.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Role Navigation Portal */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Municipal Operations Portal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">City Dashboard</h4>
            <p className="text-xs text-slate-500 mt-1">Real-time counts, severity graphs, and department workload.</p>
          </button>

          <button
            onClick={() => setCurrentPage('map')}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Interactive GIS Map</h4>
            <p className="text-xs text-slate-500 mt-1">Pinpoint hazard locations across city sectors on OpenStreetMap.</p>
          </button>

          <button
            onClick={() => setCurrentPage('future-scope')}
            className="rounded-xl border border-slate-200 p-5 text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-900">Solar & Future Scope</h4>
            <p className="text-xs text-slate-500 mt-1">Solar pavement IoT sensors, drone sweeps, and sustainability.</p>
          </button>
        </div>
      </section>
    </div>
  );
};
