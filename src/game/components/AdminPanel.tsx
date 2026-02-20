import { useState, useEffect } from "react";
import { GAME_DEFAULTS, GameSettings, GameConfig, settingsToConfig } from "../constantsV2";

export type CurrencySymbol = "$" | "€";

const STORAGE_KEY = "fill-tank-admin-settings-v8";
const OLD_KEYS = [
  "fill-tank-admin-settings",
  "fill-tank-admin-settings-v1",
  "fill-tank-admin-settings-v2",
  "fill-tank-admin-settings-v3",
  "fill-tank-admin-settings-v4",
  "fill-tank-admin-settings-v5",
  "fill-tank-admin-settings-v6",
  "fill-tank-admin-settings-v7",
];

export function useAdminSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => {
    // Clear all old storage keys
    OLD_KEYS.forEach((key) => localStorage.removeItem(key));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...GAME_DEFAULTS, ...JSON.parse(saved) } as GameSettings;
      } catch {
        return { ...GAME_DEFAULTS } as GameSettings;
      }
    }
    return { ...GAME_DEFAULTS } as GameSettings;
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings({ ...GAME_DEFAULTS } as GameSettings);
  };

  const config: GameConfig = settingsToConfig(settings);

  return { settings, config, isOpen, setIsOpen, updateSetting, resetToDefaults };
}

// --- Admin Panel UI ---

interface AdminPanelProps {
  settings: GameSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
  onReset: () => void;
}

export function AdminPanel({ settings, isOpen, onClose, onUpdate, onReset }: AdminPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">⚙️ Admin Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-4 space-y-6">
          {/* Game Speed */}
          <SettingGroup title="Game Speed (Trade Show Mode)">
            <SpeedSelector value={settings.gameSpeedMultiplier} onChange={(v) => onUpdate("gameSpeedMultiplier", v)} />
          </SettingGroup>

          {/* Load & Production */}
          <SettingGroup title="Load & Production">
            <NumberSetting label="Target Load" value={settings.targetLoadLbs} min={10000} max={100000} step={1000} unit="lbs" onChange={(v) => onUpdate("targetLoadLbs", v)} />
            <NumberSetting label="Max Overfill" value={settings.maxOverfillLbs} min={50} max={2000} step={50} unit="lbs" onChange={(v) => onUpdate("maxOverfillLbs", v)} />
            <NumberSetting label="Loads per Day" value={settings.loadsPerDay} min={1} max={20} step={1} unit="loads" onChange={(v) => onUpdate("loadsPerDay", v)} />
            <NumberSetting label="Days per Year" value={settings.daysPerYear} min={1} max={366} step={1} unit="days" onChange={(v) => onUpdate("daysPerYear", v)} />
            <div className="text-xs text-slate-400 mt-1">
              Annual loads: {settings.annualLoadsOverride ?? (settings.loadsPerDay * settings.daysPerYear)}
            </div>
          </SettingGroup>

          {/* Overfill Rules */}
          <SettingGroup title="Overfill Rules">
            <NumberSetting label="Overfill Events/Year" value={settings.overfillEventsPerYear} min={1} max={100} step={1} unit="events" onChange={(v) => onUpdate("overfillEventsPerYear", v)} />
            <ToggleSetting label="Fire on 3 Overfills" value={settings.fireOnThreeOverfills} onChange={(v) => onUpdate("fireOnThreeOverfills", v)} />
          </SettingGroup>

          {/* Cost Assumptions */}
          <SettingGroup title={`Cost Assumptions (${settings.currency})`}>
            <CurrencySelector value={settings.currency} onChange={(v) => onUpdate("currency", v)} />
            <NumberSetting label="Underfill Cost per Load" value={settings.underfillCostPerLoad} min={0} max={5000} step={50} unit={settings.currency} onChange={(v) => onUpdate("underfillCostPerLoad", v)} />
            <NumberSetting label="Milk Cost per lb" value={settings.milkCostPerLb} min={0.01} max={2} step={0.01} unit={`${settings.currency}/lb`} decimals={2} onChange={(v) => onUpdate("milkCostPerLb", v)} />
            <NumberSetting label="Driver Rate per Hour" value={settings.driverRatePerHour} min={10} max={500} step={10} unit={`${settings.currency}/hr`} onChange={(v) => onUpdate("driverRatePerHour", v)} />
          </SettingGroup>

          {/* Time Penalties */}
          <SettingGroup title="Time Penalties">
            <NumberSetting label="Agitation Minutes" value={settings.agitationMinutes} min={0} max={60} step={1} unit="mins" onChange={(v) => onUpdate("agitationMinutes", v)} />
            <NumberSetting label="Weigh Scale Minutes" value={settings.weighScaleMinutes} min={0} max={60} step={1} unit="mins" onChange={(v) => onUpdate("weighScaleMinutes", v)} />
          </SettingGroup>

          {/* Flow Mechanics */}
          <SettingGroup title="Flow Mechanics">
            <NumberSetting label="Flow Rate" value={settings.flowRateLbsPerMin} min={500} max={10000} step={100} unit="lbs/min" onChange={(v) => onUpdate("flowRateLbsPerMin", v)} />
            <NumberSetting label="Flow Jitter" value={settings.flowJitterPercent} min={0} max={20} step={1} unit="%" onChange={(v) => onUpdate("flowJitterPercent", v)} />
            <ToggleSetting label="Auto-stop at Max Overfill" value={settings.stopAutomaticallyAtMaxOverfill} onChange={(v) => onUpdate("stopAutomaticallyAtMaxOverfill", v)} />
          </SettingGroup>

          {/* Piper Mode */}
          <SettingGroup title="Piper Mode (Visual Mode)">
            <NumberSetting label="Slowdown Threshold" value={settings.piperSlowdownThreshold} min={70} max={98} step={1} unit="%" onChange={(v) => onUpdate("piperSlowdownThreshold", v)} />
            <NumberSetting label="Min Speed at 100%" value={settings.piperSlowdownFactor} min={10} max={50} step={5} unit="%" onChange={(v) => onUpdate("piperSlowdownFactor", v)} />
          </SettingGroup>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-600 space-y-3">
          <p className="text-xs text-amber-400/80 text-center">
            ⚠️ Changing these values affects future games only.
          </p>
          <div className="flex justify-between items-center">
            <button onClick={onReset} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors">
              Reset to Piper Defaults
            </button>
            <div className="text-sm text-slate-400">
              <kbd className="bg-slate-700 px-2 py-1 rounded">Ctrl+Shift+A</kbd>
            </div>
            <button onClick={onClose} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors">
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wide">{title}</h3>
      <div className="space-y-4 bg-slate-700/50 p-4 rounded-lg">{children}</div>
    </div>
  );
}

interface NumberSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimals?: number;
  onChange: (value: number) => void;
}

function NumberSetting({ label, value, min, max, step, unit, decimals = 0, onChange }: NumberSettingProps) {
  const safeValue = value ?? min;
  return (
    <div className="flex items-center gap-4">
      <label className="flex-1 text-slate-300 text-sm">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeValue}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value)))}
        className="w-32 accent-emerald-500"
      />
      <span className="w-28 text-right font-mono text-white text-sm">
        {safeValue.toFixed(decimals)} {unit}
      </span>
    </div>
  );
}

function ToggleSetting({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-slate-600"}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? "left-6" : "left-0.5"}`} />
      </button>
    </div>
  );
}

const SPEED_OPTIONS = [
  { value: 1,  label: "1×",  description: "Real-time" },
  { value: 10, label: "10×", description: "~1.5 min" },
  { value: 24, label: "24×", description: "~6 min" },
  { value: 48, label: "48×", description: "~12 min" },
];

function SpeedSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
              value === opt.value
                ? "bg-emerald-600 text-white border-2 border-emerald-400"
                : "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500"
            }`}
          >
            <div className="text-lg font-bold">{opt.label}</div>
            <div className="text-xs opacity-75">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const CURRENCY_OPTIONS: { value: CurrencySymbol; label: string }[] = [
  { value: "$", label: "Dollar ($)" },
  { value: "€", label: "Euro (€)" },
];

function CurrencySelector({ value, onChange }: { value: CurrencySymbol; onChange: (v: CurrencySymbol) => void }) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex-1 text-slate-300 text-sm">Currency</label>
      <div className="flex gap-2">
        {CURRENCY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value === opt.value
                ? "bg-emerald-600 text-white border-2 border-emerald-400"
                : "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
