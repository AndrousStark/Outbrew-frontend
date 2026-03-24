"use client";

/**
 * WarmupScheduleConfig.tsx
 *
 * Configuration panel for warmup schedule and settings
 * Allows users to customize ramp-up rates, timing, and automation
 *
 * @version 2.0.0
 */

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Clock,
  Calendar,
  TrendingUp,
  Zap,
  Save,
  RefreshCw,
  Info,
  AlertCircle,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import warmupAPI from "@/lib/warmup-api";

// ============================================================================
// Types
// ============================================================================

interface WarmupSchedule {
  dailyVolume: number;
  rampUpRate: number; // Percentage increase per day
  maxDailyVolume: number;
  sendWindowStart: number; // Hour (0-23)
  sendWindowEnd: number; // Hour (0-23)
  timezone: string;
  daysActive: string[]; // ['mon', 'tue', ...]
  autoRespond: boolean;
  responseDelay: { min: number; max: number }; // Minutes
  readEmulation: boolean;
  spamRescue: boolean;
}

interface WarmupScheduleConfigProps {
  selectedAccountId?: string | null;
  onSave?: () => void;
  onUpdate?: (schedule: Partial<{
    timezone: string;
    startHour: number;
    endHour: number;
    activeDays: Record<string, boolean>;
    minDelay: number;
    maxDelay: number;
  }>) => void;
  schedule?: {
    timezone: string;
    startHour: number;
    endHour: number;
    activeDays: Record<string, boolean>;
    minDelay: number;
    maxDelay: number;
  };
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_SCHEDULE: WarmupSchedule = {
  dailyVolume: 5,
  rampUpRate: 20,
  maxDailyVolume: 50,
  sendWindowStart: 9,
  sendWindowEnd: 17,
  timezone: "America/New_York",
  daysActive: ["mon", "tue", "wed", "thu", "fri"],
  autoRespond: true,
  responseDelay: { min: 30, max: 180 },
  readEmulation: true,
  spamRescue: true,
};

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "Europe/London", label: "GMT/BST" },
  { value: "Europe/Paris", label: "CET" },
  { value: "Asia/Tokyo", label: "JST" },
  { value: "Asia/Kolkata", label: "IST" },
];

const DAYS = [
  { value: "mon", label: "M" },
  { value: "tue", label: "T" },
  { value: "wed", label: "W" },
  { value: "thu", label: "T" },
  { value: "fri", label: "F" },
  { value: "sat", label: "S" },
  { value: "sun", label: "S" },
];

// ============================================================================
// Components
// ============================================================================

function DaySelector({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (days: string[]) => void;
}) {
  const toggleDay = (day: string) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <div className="flex gap-1">
      {DAYS.map((day) => (
        <button
          key={day.value}
          type="button"
          onClick={() => toggleDay(day.value)}
          className={cn(
            "w-8 h-8 rounded-full text-sm font-medium transition-colors",
            selected.includes(day.value)
              ? "bg-purple-500 text-white"
              : "bg-[#111] text-neutral-400 hover:bg-[#1a1a1a]"
          )}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="w-4 h-4 text-neutral-400" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px] bg-[#111] border-orange-500/15">
        <p className="text-xs text-neutral-200">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function WarmupScheduleConfig({
  selectedAccountId,
  onSave,
  className,
}: WarmupScheduleConfigProps) {
  const [schedule, setSchedule] = useState<WarmupSchedule>(DEFAULT_SCHEDULE);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update schedule field
  const updateSchedule = useCallback((updates: Partial<WarmupSchedule>) => {
    setSchedule((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  // Save configuration
  const handleSave = useCallback(async () => {
    if (!selectedAccountId) {
      toast.error("Please select an account first");
      return;
    }

    console.log("[WarmupScheduleConfig] Saving schedule:", {
      accountId: selectedAccountId,
      schedule,
    });
    setIsSaving(true);

    try {
      // Use warmupAPI instead of direct fetch
      const result = await warmupAPI.updateSchedule({
        timezone: schedule.timezone,
        active_hours: {
          start: schedule.sendWindowStart,
          end: schedule.sendWindowEnd,
        },
        active_days: schedule.daysActive.reduce((acc, day) => {
          acc[day] = true;
          return acc;
        }, {} as Record<string, boolean>),
        delays: {
          send: {
            min: schedule.responseDelay.min * 60, // Convert to seconds
            max: schedule.responseDelay.max * 60,
          },
        },
        preferences: {
          auto_respond: schedule.autoRespond,
          read_emulation: schedule.readEmulation,
          spam_rescue: schedule.spamRescue,
        },
      });

      console.log("[WarmupScheduleConfig] Schedule saved successfully:", result);
      toast.success("Warmup schedule saved successfully");
      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error("[WarmupScheduleConfig] Error saving schedule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save schedule");
    } finally {
      setIsSaving(false);
    }
  }, [selectedAccountId, schedule, onSave]);

  // Calculate projected ramp-up
  const projectedDays = Math.ceil(
    Math.log(schedule.maxDailyVolume / schedule.dailyVolume) /
      Math.log(1 + schedule.rampUpRate / 100)
  );

  return (
    <Card className={cn("bg-[#080808]/50 border-orange-500/15", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5 text-amber-400" />
          Warmup Schedule
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Configure email warmup volume, timing, and automation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Volume Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2 text-neutral-200">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Volume & Ramp-up
          </h4>

          {/* Daily Volume Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-neutral-200">
                Starting Daily Volume
                <InfoTooltip content="Number of warmup emails to send per day initially" />
              </Label>
              <span className="text-sm font-medium text-neutral-200">{schedule.dailyVolume} emails/day</span>
            </div>
            <Slider
              value={[schedule.dailyVolume]}
              onValueChange={([value]) => updateSchedule({ dailyVolume: value })}
              min={1}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Ramp-up Rate */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-neutral-200">
                Daily Ramp-up Rate
                <InfoTooltip content="Percentage increase in volume each day" />
              </Label>
              <span className="text-sm font-medium text-neutral-200">{schedule.rampUpRate}%/day</span>
            </div>
            <Slider
              value={[schedule.rampUpRate]}
              onValueChange={([value]) => updateSchedule({ rampUpRate: value })}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          {/* Max Daily Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-neutral-200">
                Maximum Daily Volume
                <InfoTooltip content="Cap on warmup emails per day after ramp-up" />
              </Label>
              <span className="text-sm font-medium text-neutral-200">{schedule.maxDailyVolume} emails/day</span>
            </div>
            <Slider
              value={[schedule.maxDailyVolume]}
              onValueChange={([value]) => updateSchedule({ maxDailyVolume: value })}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Projection Badge */}
          <div className="p-3 bg-purple-500/10 rounded-lg flex items-center justify-between">
            <span className="text-sm text-neutral-300">Time to reach max volume:</span>
            <Badge variant="secondary" className="font-mono bg-[#111] text-neutral-200">
              ~{projectedDays} days
            </Badge>
          </div>
        </div>

        <Separator className="bg-[#1a1a1a]" />

        {/* Timing Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2 text-neutral-200">
            <Clock className="w-4 h-4 text-orange-400" />
            Timing & Schedule
          </h4>

          {/* Send Window */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-neutral-200">
                <Sun className="w-4 h-4" />
                Window Start
              </Label>
              <Select
                value={schedule.sendWindowStart.toString()}
                onValueChange={(v) => updateSchedule({ sendWindowStart: parseInt(v) })}
              >
                <SelectTrigger className="bg-white/[0.04] border-orange-500/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#080808] border-orange-500/15 text-white">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-neutral-200 focus:bg-[#111] focus:text-white">
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-neutral-200">
                <Moon className="w-4 h-4" />
                Window End
              </Label>
              <Select
                value={schedule.sendWindowEnd.toString()}
                onValueChange={(v) => updateSchedule({ sendWindowEnd: parseInt(v) })}
              >
                <SelectTrigger className="bg-white/[0.04] border-orange-500/15 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#080808] border-orange-500/15 text-white">
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()} className="text-neutral-200 focus:bg-[#111] focus:text-white">
                      {i.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="text-neutral-200">Timezone</Label>
            <Select
              value={schedule.timezone}
              onValueChange={(v) => updateSchedule({ timezone: v })}
            >
              <SelectTrigger className="bg-white/[0.04] border-orange-500/15 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#080808] border-orange-500/15 text-white">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value} className="text-neutral-200 focus:bg-[#111] focus:text-white">
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Days */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-neutral-200">
              <Calendar className="w-4 h-4" />
              Active Days
            </Label>
            <DaySelector
              selected={schedule.daysActive}
              onChange={(days) => updateSchedule({ daysActive: days })}
            />
          </div>
        </div>

        <Separator className="bg-[#1a1a1a]" />

        {/* Automation Settings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium flex items-center gap-2 text-neutral-200">
            <Zap className="w-4 h-4 text-yellow-400" />
            Automation
          </h4>

          {/* Auto Respond */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-neutral-200">
                Auto-respond to Partners
                <InfoTooltip content="Automatically generate and send AI replies to warmup emails" />
              </Label>
              <p className="text-xs text-neutral-400">
                AI generates natural conversation replies
              </p>
            </div>
            <Switch
              checked={schedule.autoRespond}
              onCheckedChange={(checked) => updateSchedule({ autoRespond: checked })}
            />
          </div>

          {/* Response Delay */}
          {schedule.autoRespond && (
            <div className="pl-4 border-l-2 border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-200">Response Delay Range</Label>
                <span className="text-sm text-neutral-400">
                  {schedule.responseDelay.min}-{schedule.responseDelay.max} min
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={schedule.responseDelay.min}
                  onChange={(e) =>
                    updateSchedule({
                      responseDelay: {
                        ...schedule.responseDelay,
                        min: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-20 bg-white/[0.04] border-orange-500/15 text-white"
                  min={5}
                  max={schedule.responseDelay.max}
                />
                <span className="text-neutral-400">to</span>
                <Input
                  type="number"
                  value={schedule.responseDelay.max}
                  onChange={(e) =>
                    updateSchedule({
                      responseDelay: {
                        ...schedule.responseDelay,
                        max: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-20 bg-white/[0.04] border-orange-500/15 text-white"
                  min={schedule.responseDelay.min}
                  max={480}
                />
                <span className="text-xs text-neutral-400">minutes</span>
              </div>
            </div>
          )}

          {/* Read Emulation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-neutral-200">
                Read Behavior Emulation
                <InfoTooltip content="Simulate human-like email reading patterns" />
              </Label>
              <p className="text-xs text-neutral-400">
                Random open times, scroll depth, mark important
              </p>
            </div>
            <Switch
              checked={schedule.readEmulation}
              onCheckedChange={(checked) => updateSchedule({ readEmulation: checked })}
            />
          </div>

          {/* Spam Rescue */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2 text-neutral-200">
                Auto Spam Rescue
                <InfoTooltip content="Automatically move emails from spam to inbox and mark as not spam" />
              </Label>
              <p className="text-xs text-neutral-400">
                Rescue emails landing in spam folder
              </p>
            </div>
            <Switch
              checked={schedule.spamRescue}
              onCheckedChange={(checked) => updateSchedule({ spamRescue: checked })}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-orange-500/15">
          <div>
            {hasChanges && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-yellow-400 flex items-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-orange-500/20 text-neutral-300 hover:text-white hover:bg-[#1a1a1a]"
              onClick={() => {
                setSchedule(DEFAULT_SCHEDULE);
                setHasChanges(false);
              }}
              disabled={!hasChanges}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !selectedAccountId}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </div>

        {/* No Account Warning */}
        {!selectedAccountId && (
          <div className="p-3 bg-yellow-500/10 rounded-lg flex items-center gap-2 text-sm text-yellow-400">
            <AlertCircle className="w-4 h-4" />
            Select an account in the Accounts tab to configure its schedule
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WarmupScheduleConfig;
