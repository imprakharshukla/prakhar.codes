import { fromZonedTime } from "date-fns-tz";
import { format } from "date-fns";
import { useState, useEffect } from "react";

export default function LocalTimePill() {
  const [timeIST, setTimeIST] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Update time immediately
    const updateTime = () => {
      const currentTime = format(fromZonedTime(new Date(), "Asia/Kolkata"), "h:mm a");
      setTimeIST(currentTime);
    };

    updateTime();

    // Update time every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div>
        <span
          className={
            "inline-flex items-center gap-x-1.5 rounded px-1.5 py-0.5  font-medium text-xs/5 forced-colors:outline bg-amber-500/15 text-amber-700 group-data-[hover]:bg-amber-500/25 w-fit dark:bg-amber-500/10 dark:text-amber-400 dark:group-data-[hover]:bg-amber-500/20"
          }
        >
          --:-- --
        </span>{" "}
      </div>
    );
  }

  return (
    <div>
      <span
        className={
          "inline-flex items-center gap-x-1.5 rounded px-1.5 py-0.5  font-medium text-xs/5 forced-colors:outline bg-amber-500/15 text-amber-700 group-data-[hover]:bg-amber-500/25 w-fit dark:bg-amber-500/10 dark:text-amber-400 dark:group-data-[hover]:bg-amber-500/20"
        }
      >
        {timeIST}
      </span>{" "}
    </div>
  );
}
