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
          <g clipPath="url(#DE_svg__a)">
            <path
              d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12Z"
              fill="#D80027"
            />
            <path
              d="M12-.001A12 12 0 0 0 1.19 6.782h21.62A12 12 0 0 0 12-.001Z"
              fill="#333333"
            />
            <path
              d="M12 24a12 12 0 0 0 10.809-6.783H1.19A12 12 0 0 0 12 24Z"
              fill="#FFDA44"
            />
          </g>
          <defs>
            <clipPath id="DE_svg__a">
              <path fill="#fff" d="M0 0h24v24H0z" />
            </clipPath>
          </defs>
        </svg>
        Munich, Germany
      </span>
    </div>
  );
}
