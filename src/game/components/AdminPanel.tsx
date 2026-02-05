import { useState, useEffect } from "react";
import { GAME_CONFIG_V2 } from "../constantsV2";

export type CurrencySymbol = "€" | "$";

export interface AdminSettings {
  targetFillPercent: number;
  milkValuePerL: number;
  haulageCostPerLoad: number;
  timeCostPerMin: number;
  farmLoadsPerDay: number;
  flowRateBase: number;
  flowRateVariance: number;
  agitationTimeSaved: number;
  weighbridgeTimeCost: number;
  gameSpeedMultiplier: number;
  currency: CurrencySymbol;
  piperSlowdownThreshold: number;
  piperSlowdownFactor: number;
}

const DEFAULT_SETTINGS: AdminSettings = {
  targetFillPercent: GAME_CONFIG_V2.TARGET_FILL_PERCENT * 100,
  milkValuePerL: GAME_CONFIG_V2.MILK_VALUE_PER_L,
  haulageCostPerLoad: GAME_CONFIG_V2.HAULAGE_COST_PER_LOAD,
  timeCostPerMin: GAME_CONFIG_V2.TIME_COST_PER_MIN,
  farmLoadsPerDay: GAME_CONFIG_V2.FARM_LOADS_PER_DAY,
  flowRateBase: GAME_CONFIG_V2.FLOW_RATE_BASE_LPS,
  flowRateVariance: GAME_CONFIG_V2.FLOW_VARIANCE_PERCENT,
  agitationTimeSaved: GAME_CONFIG_V2.AGITATION_TIME_SAVED,
  weighbridgeTimeCost: GAME_CONFIG_V2.WEIGHBRIDGE_TIME_COST,
  gameSpeedMultiplier: GAME_CONFIG_V2.GAME_SPEED_MULTIPLIER,
  currency: "€",
  piperSlowdownThreshold: GAME_CONFIG_V2.PIPER_SLOWDOWN_THRESHOLD * 100,
  piperSlowdownFactor: GAME_CONFIG_V2.PIPER_SLOWDOWN_FACTOR * 100,
};

const STORAGE_KEY = "fill-tank-admin-settings";

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
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

  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // Computed config
  const config = {
    TANKER_CAPACITY_L: GAME_CONFIG_V2.TANKER_CAPACITY_L,
    FARM_TANK_CAPACITY_L: GAME_CONFIG_V2.FARM_TANK_CAPACITY_L,
    TARGET_FILL_PERCENT: settings.targetFillPercent / 100,
    MILK_VALUE_PER_L: settings.milkValuePerL,
    HAULAGE_COST_PER_LOAD: settings.haulageCostPerLoad,
    TIME_COST_PER_MIN: settings.timeCostPerMin,
    FARM_LOADS_PER_DAY: settings.farmLoadsPerDay,
    DAYS_PER_YEAR: GAME_CONFIG_V2.DAYS_PER_YEAR,
    AGITATION_TIME_SAVED: settings.agitationTimeSaved,
    WEIGHBRIDGE_TIME_COST: settings.weighbridgeTimeCost,
    FLOW_RATE_BASE_LPS: settings.flowRateBase,
    FLOW_RATE_MIN_LPS: settings.flowRateBase * (1 - settings.flowRateVariance / 100),
    FLOW_RATE_MAX_LPS: settings.flowRateBase * (1 + settings.flowRateVariance / 100),
    FLOW_VARIANCE_PERCENT: settings.flowRateVariance,
    FLOW_VARIANCE_INTERVAL_MS: GAME_CONFIG_V2.FLOW_VARIANCE_INTERVAL_MS,
    PIPER_SLOWDOWN_THRESHOLD: settings.piperSlowdownThreshold / 100,
    PIPER_SLOWDOWN_FACTOR: settings.piperSlowdownFactor / 100,
    RESULTS_DISPLAY_TIME: GAME_CONFIG_V2.RESULTS_DISPLAY_TIME,
    ATTRACT_IDLE_TIME: GAME_CONFIG_V2.ATTRACT_IDLE_TIME,
    GAME_SPEED_MULTIPLIER: settings.gameSpeedMultiplier,
    CURRENCY: settings.currency,
    get TARGET_FILL_L() {
      return this.TANKER_CAPACITY_L * this.TARGET_FILL_PERCENT;
    },
  };

  return {
    settings,
    config,
    isOpen,
    setIsOpen,
    updateSetting,
    resetToDefaults,
  };
}

interface AdminPanelProps {
  settings: AdminSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => void;
  onReset: () => void;
}

export function AdminPanel({
  settings,
  isOpen,
  onClose,
  onUpdate,
  onReset,
}: AdminPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-600">
          <h2 className="text-xl font-bold text-white">⚙️ Admin Settings</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Settings */}
        <div className="p-4 space-y-6">
          {/* Game Speed */}
          <SettingGroup title="Game Speed (Trade Show Mode)">
            <SpeedSelector
              value={settings.gameSpeedMultiplier}
              onChange={(v) => onUpdate("gameSpeedMultiplier", v)}
            />
          </SettingGroup>

          {/* Target Fill */}
          <SettingGroup title="Target & Difficulty">
            <SliderSetting
              label="Target Fill %"
              value={settings.targetFillPercent}
              min={80}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => onUpdate("targetFillPercent", v)}
            />
            <SliderSetting
              label="Base Flow Rate"
              value={settings.flowRateBase}
              min={500}
              max={3000}
              step={50}
              unit="L/min"
              onChange={(v) => onUpdate("flowRateBase", v)}
            />
            <SliderSetting
              label="Flow Rate Variance"
              value={settings.flowRateVariance}
              min={0}
              max={20}
              step={1}
              unit="%"
              onChange={(v) => onUpdate("flowRateVariance", v)}
            />
          </SettingGroup>

          {/* Piper Mode Settings */}
          <SettingGroup title="Piper Mode (Visual Mode)">
            <SliderSetting
              label="Slowdown Threshold"
              value={settings.piperSlowdownThreshold}
              min={70}
              max={98}
              step={1}
              unit="%"
              onChange={(v) => onUpdate("piperSlowdownThreshold", v)}
            />
            <SliderSetting
              label="Minimum Speed at 100%"
              value={settings.piperSlowdownFactor}
              min={10}
              max={50}
              step={5}
              unit="%"
              onChange={(v) => onUpdate("piperSlowdownFactor", v)}
            />
            <div className="text-xs text-slate-400 mt-2">
              Flow slows from {settings.piperSlowdownThreshold}% fill down to {settings.piperSlowdownFactor}% speed at 100%
            </div>
          </SettingGroup>

          {/* Money Values */}
          <SettingGroup title={`Money Values (${settings.currency})`}>
            <CurrencySelector
              value={settings.currency}
              onChange={(v) => onUpdate("currency", v)}
            />
            <SliderSetting
              label="Milk Value per Litre"
              value={settings.milkValuePerL}
              min={0.2}
              max={1.0}
              step={0.01}
              unit={`${settings.currency}/L`}
              decimals={2}
              onChange={(v) => onUpdate("milkValuePerL", v)}
            />
            <SliderSetting
              label="Haulage Cost per Load"
              value={settings.haulageCostPerLoad}
              min={50}
              max={500}
              step={10}
              unit={settings.currency}
              onChange={(v) => onUpdate("haulageCostPerLoad", v)}
            />
            <SliderSetting
              label="Time Cost per Minute"
              value={settings.timeCostPerMin}
              min={1}
              max={20}
              step={0.5}
              unit={`${settings.currency}/min`}
              decimals={1}
              onChange={(v) => onUpdate("timeCostPerMin", v)}
            />
          </SettingGroup>

          {/* Time Settings */}
          <SettingGroup title="Time Penalties/Savings">
            <SliderSetting
              label="Agitation Time Saved (Piper)"
              value={settings.agitationTimeSaved}
              min={5}
              max={60}
              step={5}
              unit="mins"
              onChange={(v) => onUpdate("agitationTimeSaved", v)}
            />
            <SliderSetting
              label="Weighbridge Time Cost"
              value={settings.weighbridgeTimeCost}
              min={5}
              max={30}
              step={5}
              unit="mins"
              onChange={(v) => onUpdate("weighbridgeTimeCost", v)}
            />
          </SettingGroup>

          {/* Scaling */}
          <SettingGroup title="Annualized Scaling">
            <SliderSetting
              label="Farm Loads per Day"
              value={settings.farmLoadsPerDay}
              min={1}
              max={20}
              step={1}
              unit="loads"
              onChange={(v) => onUpdate("farmLoadsPerDay", v)}
            />
          </SettingGroup>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-600">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="text-sm text-slate-400">
            Press <kbd className="bg-slate-700 px-2 py-1 rounded">Ctrl+Shift+A</kbd> to toggle
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-4 bg-slate-700/50 p-4 rounded-lg">{children}</div>
    </div>
  );
}

interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  decimals?: number;
  onChange: (value: number) => void;
}

function SliderSetting({
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 0,
  onChange,
}: SliderSettingProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex-1 text-slate-300 text-sm">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-32 accent-emerald-500"
      />
      <span className="w-24 text-right font-mono text-white">
        {value.toFixed(decimals)} {unit}
      </span>
    </div>
  );
}

const SPEED_OPTIONS = [
  { value: 1, label: "1×", description: "Real-time (~12s)" },
  { value: 2, label: "2×", description: "~6s" },
  { value: 5, label: "5×", description: "~2.5s" },
  { value: 10, label: "10×", description: "~1.2s" },
];

interface SpeedSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

function SpeedSelector({ value, onChange }: SpeedSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-300 text-sm">Demo Speed</span>
        <span className="text-xs text-slate-400">
          Timer shows simulated real-world time
        </span>
      </div>
      <div className="flex gap-2">
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
              value === option.value
                ? "bg-emerald-600 text-white border-2 border-emerald-400"
                : "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500"
            }`}
          >
            <div className="text-lg font-bold">{option.label}</div>
            <div className="text-xs opacity-75">{option.description}</div>
          </button>
        ))}
      </div>
      <div className="text-xs text-amber-400/80 text-center">
        ⚡ Higher speeds make demos faster while preserving accurate time-cost calculations
      </div>
    </div>
  );
}

const CURRENCY_OPTIONS: { value: CurrencySymbol; label: string }[] = [
  { value: "€", label: "Euro (€)" },
  { value: "$", label: "Dollar ($)" },
];

interface CurrencySelectorProps {
  value: CurrencySymbol;
  onChange: (value: CurrencySymbol) => void;
}

function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="flex-1 text-slate-300 text-sm">Currency</label>
      <div className="flex gap-2">
        {CURRENCY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value === option.value
                ? "bg-emerald-600 text-white border-2 border-emerald-400"
                : "bg-slate-700 text-slate-300 border-2 border-slate-600 hover:border-slate-500"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
