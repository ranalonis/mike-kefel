/** Original red-panda illustration (from the prototype). */
export function pandaSvg(mood: "happy" | "worried", label: string): string {
  const dk = "#3B2318", rust = "#C1502A", wh = "#FFF8EE";
  const face =
    mood === "happy"
      ? `<path d="M58 102 q12 -13 24 0" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M118 102 q12 -13 24 0" stroke="${dk}" stroke-width="5" fill="none" stroke-linecap="round"/>
         <ellipse cx="56" cy="128" rx="9" ry="5" fill="#F29A8A"/><ellipse cx="144" cy="128" rx="9" ry="5" fill="#F29A8A"/>
         <path d="M84 130 q16 20 32 0" stroke="${dk}" stroke-width="4.5" fill="#E86A5A" stroke-linecap="round"/>`
      : `<path d="M58 84 L82 76" stroke="${dk}" stroke-width="4.5" stroke-linecap="round"/>
         <path d="M142 84 L118 76" stroke="${dk}" stroke-width="4.5" stroke-linecap="round"/>
         <circle cx="70" cy="100" r="8" fill="${dk}"/><circle cx="130" cy="100" r="8" fill="${dk}"/>
         <circle cx="72.5" cy="97.5" r="2.5" fill="#fff"/><circle cx="132.5" cy="97.5" r="2.5" fill="#fff"/>
         <path d="M86 146 q14 -11 28 0" stroke="${dk}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
         <path d="M170 64 q8 12 0 18 q-8 -6 0 -18z" fill="#6FB6F0"/>`;
  return `<svg viewBox="0 0 200 175" role="img" aria-label="${label}">
    <circle cx="42" cy="46" r="28" fill="${wh}"/><circle cx="42" cy="46" r="23" fill="${rust}"/><circle cx="42" cy="48" r="12" fill="${dk}"/>
    <circle cx="158" cy="46" r="28" fill="${wh}"/><circle cx="158" cy="46" r="23" fill="${rust}"/><circle cx="158" cy="48" r="12" fill="${dk}"/>
    <ellipse cx="100" cy="102" rx="80" ry="66" fill="${rust}"/>
    <ellipse cx="70" cy="76" rx="15" ry="9" fill="${wh}"/><ellipse cx="130" cy="76" rx="15" ry="9" fill="${wh}"/>
    <ellipse cx="50" cy="124" rx="18" ry="16" fill="${wh}"/><ellipse cx="150" cy="124" rx="18" ry="16" fill="${wh}"/>
    <ellipse cx="100" cy="134" rx="40" ry="28" fill="${wh}"/>
    ${face}
    <ellipse cx="100" cy="120" rx="10" ry="7" fill="${dk}"/>
  </svg>`;
}
