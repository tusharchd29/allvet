// A small decorative peacock-feather mark — the app's existing teal /
// seafoam / mint palette already reads as feather colors, so this just
// adds the eye-spot shape and a saffron centre to make that connection
// explicit. Purely decorative; no text, no meaning-bearing content.
export function PeacockFeather({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 2C10 7 8 14 10 21c0.6 2 1.8 4 3.5 5.5"
        stroke="var(--teal)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="16" cy="12" rx="7.5" ry="9.5" fill="var(--seafoam)" opacity="0.18" />
      <ellipse cx="16" cy="12" rx="5.4" ry="7" fill="var(--teal)" opacity="0.35" />
      <ellipse cx="16" cy="12" rx="3.2" ry="4.2" fill="var(--ink)" opacity="0.55" />
      <ellipse cx="16" cy="12" rx="1.6" ry="2.1" fill="var(--saffron)" />
    </svg>
  );
}
