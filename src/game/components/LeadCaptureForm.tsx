import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LeadCaptureFormProps {
  onSubmit: (data: LeadData) => void;
  onSkip: () => void;
  gameResults: {
    accuracy: number;
    loadTime: number;
    volumeLoaded: number;
    totalCost: number;
  };
}

export interface LeadData {
  id: string;
  name: string;
  contactType: "phone" | "email";
  contactValue: string;
  wantsInfo: boolean;
  gameResults: {
    accuracy: number;
    loadTime: number;
    volumeLoaded: number;
    totalCost: number;
  };
  timestamp: string;
}

export function LeadCaptureForm({ onSubmit, onSkip, gameResults }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("email");
  const [contactValue, setContactValue] = useState("");
  const [wantsInfo, setWantsInfo] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; contact?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!contactValue.trim()) {
      newErrors.contact = `${contactType === "email" ? "Email" : "Phone"} is required`;
    } else if (contactType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactValue.trim())) {
        newErrors.contact = "Invalid email address";
      }
    } else if (contactType === "phone") {
      // Basic phone validation - allows various formats
      const phoneRegex = /^[\d\s\-+()]{7,20}$/;
      if (!phoneRegex.test(contactValue.trim())) {
        newErrors.contact = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const leadData: LeadData = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      contactType,
      contactValue: contactValue.trim(),
      wantsInfo,
      gameResults,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    const existingLeads = JSON.parse(localStorage.getItem("piper_leads") || "[]");
    existingLeads.push(leadData);
    localStorage.setItem("piper_leads", JSON.stringify(existingLeads));

    onSubmit(leadData);
  };

  return (
    <div className="bg-slate-800/80 p-6 rounded-xl border border-slate-600 max-w-lg w-full">
      <h3 className="text-lg font-bold text-white mb-4 text-center">
        Want to learn more about Piper?
      </h3>

      <div className="space-y-4">
        {/* Name input */}
        <div>
          <Label htmlFor="name" className="text-slate-300 text-sm">
            Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            maxLength={100}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Contact type toggle */}
        <div>
          <Label className="text-slate-300 text-sm">Contact preference</Label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactType"
                value="email"
                checked={contactType === "email"}
                onChange={() => {
                  setContactType("email");
                  setContactValue("");
                  setErrors({});
                }}
                className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300 text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contactType"
                value="phone"
                checked={contactType === "phone"}
                onChange={() => {
                  setContactType("phone");
                  setContactValue("");
                  setErrors({});
                }}
                className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 focus:ring-emerald-500"
              />
              <span className="text-slate-300 text-sm">Phone</span>
            </label>
          </div>
        </div>

        {/* Contact input */}
        <div>
          <Label htmlFor="contact" className="text-slate-300 text-sm">
            {contactType === "email" ? "Email address" : "Phone number"}
          </Label>
          <Input
            id="contact"
            type={contactType === "email" ? "email" : "tel"}
            value={contactValue}
            onChange={(e) => setContactValue(e.target.value)}
            placeholder={contactType === "email" ? "you@company.com" : "+353 12 345 6789"}
            className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
            maxLength={contactType === "email" ? 255 : 20}
          />
          {errors.contact && (
            <p className="text-red-400 text-xs mt-1">{errors.contact}</p>
          )}
        </div>

        {/* Checkbox for info */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="wantsInfo"
            checked={wantsInfo}
            onCheckedChange={(checked) => setWantsInfo(checked === true)}
            className="border-slate-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
          />
          <Label htmlFor="wantsInfo" className="text-slate-300 text-sm cursor-pointer">
            Send me info about Piper
          </Label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold px-6 py-4 rounded-xl shadow-xl transition-all hover:scale-105"
          >
            SUBMIT & PLAY AGAIN
          </button>
          <button
            onClick={onSkip}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium px-6 py-3 rounded-xl transition-all"
          >
            SKIP — PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
