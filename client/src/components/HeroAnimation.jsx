/**
 * HeroAnimation — decorative inline SVG for the Home page hero section.
 *
 * A simple figure lifting a dumbbell, animated with plain CSS keyframes
 * (defined in the embedded <style>) rather than a JS animation library —
 * there's no interactivity needed, so CSS keeps this dependency-free.
 */
function HeroAnimation() {
  return (
    <svg
      viewBox="-20 0 240 310"
      width="240"
      height="310"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 22px rgba(224, 32, 32, 0.4))' }}
    >
      <defs>
        {/* transform-box: fill-box lets rotation/translation pivot around
            the shape's own bounding box instead of the SVG's origin —
            without it, "curl" would rotate around the wrong point. */}
        <style>{`
          @keyframes curlUp {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(-118deg); }
          }
          @keyframes nod {
            0%, 100% { transform: translateY(0); }
            50%       { transform: translateY(-2px); }
          }
          .curl-arm {
            transform-box: fill-box;
            transform-origin: 50% 0%;
            animation: curlUp 1.3s cubic-bezier(0.45,0,0.55,1) infinite alternate;
          }
          .head {
            transform-box: fill-box;
            transform-origin: 50% 100%;
            animation: nod 2.6s ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* Head */}
      <circle className="head" cx="90" cy="30" r="22" fill="#e02020" opacity="0.92"/>

      {/* Neck */}
      <rect x="83" y="51" width="14" height="13" rx="5" fill="#c41818"/>

      {/* Torso */}
      <rect x="56" y="64" width="68" height="80" rx="13" fill="#e02020" opacity="0.88"/>

      {/* Left upper arm */}
      <rect x="28" y="69" width="22" height="56" rx="10" fill="#c41818"/>
      {/* Left forearm */}
      <rect x="30" y="123" width="19" height="48" rx="9" fill="#aa1515"/>
      {/* Left dumbbell */}
      <rect x="16" y="167" width="48" height="11" rx="5" fill="#222" stroke="#555" strokeWidth="1.5"/>
      <circle cx="16"  cy="172" r="13" fill="#1a1a1a" stroke="#666" strokeWidth="2"/>
      <circle cx="64"  cy="172" r="13" fill="#1a1a1a" stroke="#666" strokeWidth="2"/>
      <circle cx="16"  cy="172" r="8"  fill="#333"/>
      <circle cx="64"  cy="172" r="8"  fill="#333"/>

      {/* Right upper arm */}
      <rect x="130" y="69" width="22" height="56" rx="10" fill="#c41818"/>

      {/* Right forearm + dumbbell — grouped so the "curl-arm" animation
          class rotates the whole arm+weight together as one unit */}
      <g className="curl-arm">
        <rect x="132" y="123" width="19" height="48" rx="9" fill="#aa1515"/>
        <rect x="118" y="167" width="48" height="11" rx="5" fill="#222" stroke="#555" strokeWidth="1.5"/>
        <circle cx="118" cy="172" r="13" fill="#1a1a1a" stroke="#666" strokeWidth="2"/>
        <circle cx="166" cy="172" r="13" fill="#1a1a1a" stroke="#666" strokeWidth="2"/>
        <circle cx="118" cy="172" r="8"  fill="#333"/>
        <circle cx="166" cy="172" r="8"  fill="#333"/>
      </g>

      {/* Left thigh */}
      <rect x="58" y="142" width="26" height="68" rx="12" fill="#c41818"/>
      {/* Left shin */}
      <rect x="60" y="207" width="22" height="58" rx="10" fill="#aa1515"/>
      {/* Left foot */}
      <rect x="46" y="259" width="38" height="13" rx="6" fill="#8a1010"/>

      {/* Right thigh */}
      <rect x="96" y="142" width="26" height="68" rx="12" fill="#c41818"/>
      {/* Right shin */}
      <rect x="98" y="207" width="22" height="58" rx="10" fill="#aa1515"/>
      {/* Right foot */}
      <rect x="96" y="259" width="38" height="13" rx="6" fill="#8a1010"/>
    </svg>
  );
}

export default HeroAnimation;
