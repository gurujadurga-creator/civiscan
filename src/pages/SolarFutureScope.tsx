import React, { useState } from 'react';
import {
  SunMedium,
  Zap,
  Radio,
  Cpu,
  Layers,
  Sparkles,
  Plane,
  Truck,
  Leaf,
  Activity,
  ArrowRight,
  TrendingDown,
  BarChart,
} from 'lucide-react';

export const SolarFutureScope: React.FC = () => {
  const [selectedSensorNode, setSelectedSensorNode] = useState('Node-Solar-01');
  const [trafficLoadSlider, setTrafficLoadSlider] = useState(85);

  // Computed degradation forecast based on traffic slider
  const estimatedYearsLeft = Math.max(1.2, (10 - trafficLoadSlider * 0.08).toFixed(1) as any);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-300">
            <SunMedium className="h-4 w-4 text-amber-300" />
            <span>Clean Energy & Smart Infrastructure Roadmap</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Solar Pavement & Future City Infrastructure Scope
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Expanding CIVISCAN beyond reactive reporting into predictive, clean-energy smart civic grids. Combining solar-harvested pavement sensors, autonomous municipal drone sweeps, and vehicular edge computer vision.
          </p>
        </div>

        <div className="absolute -right-12 -bottom-12 opacity-10 text-white pointer-events-none">
          <SunMedium className="h-96 w-96" />
        </div>
      </div>

      {/* 4 Pillars of Future Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Solar-Powered IoT Pavement Sensors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <SunMedium className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                1. Solar-Harvested Road Subsurface IoT
              </h3>
              <p className="text-xs text-slate-500">Autonomous energy-harvesting piezoelectric studs</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Embedded solar roadside studs and piezoelectric kinetic harvesters power ultra-low-power vibration sensors. These detect microscopic sub-base fissures before they propagate into deep craters.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Telemetry Node: Central Blvd P-04</span>
              <span className="text-emerald-600 flex items-center gap-1">
                <Zap className="h-3 w-3" /> 98% Battery (Solar Float)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Vibration Accel</span>
                <span className="font-bold text-slate-900">0.42 g-force</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Sub-layer Moisture</span>
                <span className="font-bold text-blue-600">14% (Dry)</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Solar Voltage</span>
                <span className="font-bold text-amber-600">3.65 V</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar 2: Drone Photogrammetry Sweeps */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                2. Autonomous Aerial Drone Photogrammetry
              </h3>
              <p className="text-xs text-slate-500">Scheduled early morning low-altitude city corridor scans</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pre-programmed autonomous drone flights capture high-resolution orthomosaic imagery across multi-lane highways. Computer vision models automatically tag pothole coordinates into the CIVISCAN queue prior to rush hour.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Flight Sector Bravo (Highways 101/80 Junction)</span>
              <span className="text-blue-600">Scheduled 04:30 AM</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Coverage: 28 lane-kilometers • Ground Sampling Distance: 0.8 cm/pixel • Direct GeoTIFF export to dispatch database.
            </p>
          </div>
        </div>

        {/* Pillar 3: Fleet Dashcam Crowdsourcing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                3. Municipal Fleet Edge Computer Vision
              </h3>
              <p className="text-xs text-slate-500">City buses & sanitation compactors acting as dynamic road scanners</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Deploying lightweight edge AI accelerator units onto municipal buses and garbage trucks. As regular routes are traversed daily, edge models flag pavement depressions and roadside dumping anomalies without manual reporting.
          </p>

          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Municipal Bus Line 38 Rapid</span>
            <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
              Edge AI Camera Ready
            </span>
          </div>
        </div>

        {/* Pillar 4: Circular Green Asphalt Recycling (RAP) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                4. Circular RAP Asphalt Remediation
              </h3>
              <p className="text-xs text-slate-500">Recycled asphalt pavement lifecycle & CO2 emissions tracking</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Integrating sustainability metrics into repair logging. CIVISCAN tracks tonnage of reclaimed asphalt pavement (RAP) reused, estimating reduced bitumen consumption and avoided municipal landfill dumping.
          </p>

          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900">YTD Avoided Landfill Waste:</span>
            <span className="font-extrabold text-emerald-700 text-sm">48.2 Metric Tons</span>
          </div>
        </div>
      </div>

      {/* Interactive Predictive Degradation Simulator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Interactive Pavement Degradation Forecasting Sandbox
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate how daily equivalent single-axle loads (ESAL) impact predicted roadway lifespan before structural pothole breakthrough.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Corridor Heavy Vehicle Traffic Intensity:</span>
                <span className="text-blue-600 font-mono">{trafficLoadSlider}% Load</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={trafficLoadSlider}
                onChange={(e) => setTrafficLoadSlider(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Light (Residential)</span>
                <span>Moderate (Commercial)</span>
                <span>Heavy (Port Corridor / Transit)</span>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-xs">
              <span className="text-slate-500 font-medium">Degradation Model Prediction:</span>
              <p className="text-slate-800 leading-relaxed font-semibold">
                Under {trafficLoadSlider}% load, micro-fracture propagation accelerates by{' '}
                <span className="text-red-600 font-bold">{(trafficLoadSlider * 0.45).toFixed(0)}%</span>.
                Preventive slurry sealing is recommended before winter precipitation cycle.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Estimated Years Until Structural Defect:
            </span>
            <div className="text-4xl font-extrabold text-blue-900">
              {estimatedYearsLeft} Years
            </div>
            <p className="text-xs text-blue-800 max-w-xs mx-auto">
              Automated early intervention via CIVISCAN crack-sealing saves up to 4.2x in full-depth asphalt replacement costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
