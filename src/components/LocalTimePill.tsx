import { fromZonedTime, getTimezoneOffset } from "date-fns-tz";
import { format } from "date-fns";
export default function LocalTimePill() {
  const timeIST = format(fromZonedTime(new Date(), "Asia/Kolkata"), "h:mm a");
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
