import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import piperLogo from "@/assets/piper-logo.png";

interface LeadCaptureScreenProps {
  gameResults: {
    accuracy: number;
    loadTime: number;
    volumeLoaded: number;
    totalCost: number;
  };
  onSubmit: () => void;
  onSkip: () => void;
}

export function LeadCaptureScreen({
  gameResults,
  onSubmit,
  onSkip,
}: LeadCaptureScreenProps) {
  const [name, setName] = useState("");
  const [contactType, setContactType] = useState<"phone" | "email">("email");
  const [contactValue, setContactValue] = useState("");
  const [wantsInfo, setWantsInfo] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const phoneRegex = /^[\d\s\-+()]{7,20}$/;
      if (!phoneRegex.test(contactValue.trim())) {
        newErrors.contact = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("leads").insert({
        name: name.trim(),
        contact_type: contactType,
        contact_value: contactValue.trim(),
        wants_info: wantsInfo,
        accuracy: gameResults.accuracy,
        load_time: gameResults.loadTime,
        volume_loaded: gameResults.volumeLoaded,
        total_cost: gameResults.totalCost,
      });

      if (error) {
        console.error("Failed to save lead:", error);
      }

      setName("");
      setContactValue("");
      setWantsInfo(true);
      setErrors({});

      onSubmit();
    } catch (err) {
      console.error("Error submitting lead:", err);
      onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setName("");
    setContactValue("");
    setErrors({});
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-50 p-6">
      {/* Piper Logo */}
      <div className="mb-6">
        <img src={piperLogo} alt="Piper" className="h-12 md:h-16" />
      </div>

      {/* Content Card */}
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-600 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎯</div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Enter your details to see your results
          </h2>
          <p className="text-slate-400 text-sm">
            We'd love to show you how Piper can help
          </p>
        </div>

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
              className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-12 text-lg"
              maxLength={100}
              autoFocus
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
              className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-12 text-lg"
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
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-white text-xl font-bold px-6 py-5 rounded-xl shadow-xl transition-all hover:scale-105 disabled:hover:scale-100"
            >
              {isSubmitting ? "SUBMITTING..." : "SEE MY RESULTS →"}
            </button>
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-400 text-sm font-medium px-6 py-3 rounded-xl transition-all"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
