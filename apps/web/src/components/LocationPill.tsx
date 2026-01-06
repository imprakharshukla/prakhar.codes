export default function LocationPill() {
  return (
    <div>
      <span
        className={
          "inline-flex items-center gap-x-1.5 rounded px-1.5 py-0.5 font-medium text-xs/5 mt-1 forced-colors:outline bg-slate-100 text-slate-700 group-data-[hover]:bg-slate-200 w-fit dark:bg-blue-500/10 dark:text-blue-400 dark:group-data-[hover]:bg-blue-500/20"
        }
      >
        <svg
          width="16"
          height="16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="flex-shrink-0"
        >
          <g clipPath="url(#IN_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#F0F0F0"
            />
            <path
              d="M12-.001A12 12 0 0 0 1.19 6.782h21.62A12 12 0 0 0 12-.001Z"
              fill="#FF9811"
            />
            <path
              d="M12 24a12 12 0 0 0 10.809-6.783H1.19A12 12 0 0 0 12 24Z"
              fill="#6DA544"
            />
            <path
              d="M12 16.173a4.174 4.174 0 1 0 0-8.348 4.174 4.174 0 0 0 0 8.348Z"
              fill="#0052B4"
            />
            <path
              d="M12 14.608a2.609 2.609 0 1 0 0-5.218 2.609 2.609 0 0 0 0 5.218Z"
              fill="#F0F0F0"
            />
            <path
              d="m12 8.78.806 1.826 1.983-.216L13.61 12l1.179 1.61-1.983-.216L12 15.219l-.805-1.825-1.983.216L10.39 12l-1.178-1.61 1.983.216L12 8.781Z"
              fill="#0052B4"
            />
          </g>
          <defs>
            <clipPath id="IN_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </svg>
        Delhi, India
      </span>
    </div>
  );
}
