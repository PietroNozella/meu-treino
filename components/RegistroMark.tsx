export default function RegistroMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="5"
        width="38"
        height="38"
        rx="11"
        stroke="#f5f5f5"
        strokeWidth="2"
      />
      <path
        d="m13 17 2 2 4-4M24 17h10M14 25h4M24 25h10M14 33h4M24 33h7"
        stroke="#f5f5f5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
