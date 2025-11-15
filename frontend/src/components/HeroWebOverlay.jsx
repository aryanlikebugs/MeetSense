import { motion } from "framer-motion";

const HeroWebOverlay = () => {
  return (
    <motion.svg
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      animate={{
        x: [-25, 25, -10, 15, -25],
        y: [-15, 10, -20, 10, -15],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      <g stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.45">
        {/* ---------------- EXISTING CLUSTERS ---------------- */}

        {/* top-left cluster */}
        <circle cx="120" cy="80" r="2" />
        <circle cx="220" cy="140" r="2" />
        <circle cx="320" cy="60" r="2" />
        <circle cx="260" cy="220" r="2" />

        <line x1="120" y1="80" x2="220" y2="140" />
        <line x1="220" y1="140" x2="320" y2="60" />
        <line x1="220" y1="140" x2="260" y2="220" />
        <line x1="120" y1="80" x2="260" y2="220" />
        <line x1="320" y1="60" x2="260" y2="220" />

        {/* top-center cluster */}
        <circle cx="640" cy="70" r="2" />
        <circle cx="560" cy="160" r="2" />
        <circle cx="720" cy="160" r="2" />
        <circle cx="650" cy="250" r="2" />

        <line x1="640" y1="70" x2="560" y2="160" />
        <line x1="640" y1="70" x2="720" y2="160" />
        <line x1="560" y1="160" x2="650" y2="250" />
        <line x1="720" y1="160" x2="650" y2="250" />
        <line x1="560" y1="160" x2="720" y2="160" />

        {/* top-right cluster */}
        <circle cx="1180" cy="80" r="2" />
        <circle cx="1060" cy="140" r="2" />
        <circle cx="980" cy="60" r="2" />
        <circle cx="1030" cy="230" r="2" />

        <line x1="1180" y1="80" x2="1060" y2="140" />
        <line x1="1060" y1="140" x2="980" y2="60" />
        <line x1="1060" y1="140" x2="1030" y2="230" />
        <line x1="1180" y1="80" x2="1030" y2="230" />
        <line x1="980" y1="60" x2="1030" y2="230" />

        {/* lower connectors */}
        <circle cx="400" cy="540" r="2" />
        <circle cx="1040" cy="560" r="2" />

        <line x1="260" y1="320" x2="400" y2="540" />
        <line x1="650" y1="350" x2="400" y2="540" />
        <line x1="650" y1="350" x2="1040" y2="560" />
        <line x1="1030" y1="330" x2="1040" y2="560" />

        {/* ---------------- NEW SMALL FLOATING CLUSTERS ---------------- */}

        {/* middle-left small web */}
        <circle cx="200" cy="430" r="2" />
        <circle cx="260" cy="380" r="2" />
        <circle cx="320" cy="420" r="2" />

        <line x1="200" y1="430" x2="260" y2="380" />
        <line x1="260" y1="380" x2="320" y2="420" />
        <line x1="200" y1="430" x2="320" y2="420" />

        {/* right mid small web */}
        <circle cx="1150" cy="420" r="2" />
        <circle cx="1080" cy="360" r="2" />
        <circle cx="1180" cy="330" r="2" />

        <line x1="1150" y1="420" x2="1080" y2="360" />
        <line x1="1080" y1="360" x2="1180" y2="330" />
        <line x1="1150" y1="420" x2="1180" y2="330" />

        {/* bottom small web */}
        <circle cx="700" cy="720" r="2" />
        <circle cx="760" cy="670" r="2" />
        <circle cx="820" cy="710" r="2" />

        <line x1="700" y1="720" x2="760" y2="670" />
        <line x1="760" y1="670" x2="820" y2="710" />
        <line x1="700" y1="720" x2="820" y2="710" />

        {/* tiny spread dots */}
        <circle cx="200" cy="740" r="1.5" />
        <circle cx="1230" cy="700" r="1.5" />
        <circle cx="960" cy="760" r="1.5" />
        <circle cx="480" cy="780" r="1.5" />
      </g>
    </motion.svg>
  );
};

export default HeroWebOverlay;
