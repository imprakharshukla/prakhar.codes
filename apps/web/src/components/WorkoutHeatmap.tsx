import { useEffect, useState } from "react";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@prakhar/ui";

interface WorkoutDay {
  date: string;
  totalMinutes: number;
}

interface DayData {
  date: Date;
  totalMinutes: number;
}

export function WorkoutHeatmap() {
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await fetch("/api/workouts?days=8");
        const workouts: WorkoutDay[] = await res.json();

        const last7Days = eachDayOfInterval({
          start: subDays(new Date(), 7),
          end: subDays(new Date(), 1),
        });

        const dayData = last7Days.map((day) => {
          const dayStart = startOfDay(day);
          const match = workouts.find(
            (w) => startOfDay(new Date(w.date)).getTime() === dayStart.getTime()
          );
          return {
            date: day,
            totalMinutes: match?.totalMinutes ?? 0,
          };
        });

        setDays(dayData);
      } catch {
        const last7Days = eachDayOfInterval({
          start: subDays(new Date(), 7),
          end: subDays(new Date(), 1),
        });
        setDays(last7Days.map((date) => ({ date, totalMinutes: 0 })));
      }
      setLoading(false);
    }
    fetchWorkouts();
  }, []);

  const getIntensityClass = (minutes: number) => {
    if (minutes === 0) return "bg-muted";
    if (minutes < 30) return "bg-primary/20";
    if (minutes < 60) return "bg-primary/40";
    if (minutes < 90) return "bg-primary/70";
    return "bg-primary";
  };

  if (loading) {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-8 h-8 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TooltipProvider>
        <div className="flex gap-1">
          {days.map((day) => (
            <Tooltip key={day.date.toISOString()} delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`w-8 h-8 rounded ${getIntensityClass(day.totalMinutes)} flex items-center justify-center text-xs transition-all cursor-default text-white`}
                >
                  {format(day.date, "d")}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <span className="font-medium">{format(day.date, "EEE, MMM d")}</span>
                  {" - "}
                  <span className="text-muted-foreground">
                    {day.totalMinutes > 0 ? `${day.totalMinutes} min` : "Rest day"}
                  </span>
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded bg-muted" />
          <div className="w-3 h-3 rounded bg-primary/20" />
          <div className="w-3 h-3 rounded bg-primary/40" />
          <div className="w-3 h-3 rounded bg-primary/70" />
          <div className="w-3 h-3 rounded bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
