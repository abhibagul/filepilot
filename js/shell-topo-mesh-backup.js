/**
 * FilePilot Shell — High-Performance 60FPS 3D Hourglass Accretion Wormhole (Edge-to-Edge)
 * restructured background canvas drawing a swirling, breathing 3D perspective data wormhole.
 * - High Density: Strand count increased to 280 and Katakana trails lengthened to 12-23 characters to fill blank space.
 * - Spatial Dust: Background dust particle count increased to 180 and sized larger (7px-12px) to add volumetric richness.
 * - Edge-to-Edge Layout: Maximum orbit radius expanded to 1.4x screen width (dust to 1.5x) to cover margins.
 * - Balanced Hourglass Neck: Contracts to 50% in center (0.50 + 0.50 * normY^2) to maintain margin density.
 * - Conservation of Momentum: Strands orbit faster (up to 2.0x) as they contract into the center neck.
 * - Accretion Core Glow: Strands closer to the center Y-axis receive up to +18% HSL lightness core boost.
 * - 2D Color Cache Matrix: Caches HSL strings for 10x10 combinations of depth (zBin) and radius (rBin).
 * - Balanced Sizing: Base character size range adjusted to a highly readable 12px-20px range.
 * - Static Camera: Parallax camera tilts and translation offsets removed for stable rendering.
 * - End Cursors: Blinking cursors render at the tail end of command strings with backward fading trails.
 * - Semantic Commands: Replaces fragmented strings with complete, realistic shell statements.
 * - Glitch Legibility Tuning: Glitches tuned down to 0.4% with rapid 25% recovery to keep text readable.
 * - Horizon Grid Splatters: Centrifugal splatters spin outward radially along the 3D-projected vector floor.
 * - Horizon Splash Ripples: Splattered particles leave expanding horizontal ripples on the grid.
 * - Interactive Spin Acceleration: Clicking and holding (or touching) speeds up orbit by 3.8x.
 * - Projected 3D Horizon Grid: Wireframe plane projected in 3D space, tilting in perspective.
 * - Diverse Cursors: Cursors vary between null, block █, underline _, pipe |, and shade block ▒.
 * - Desynchronized Blinking: Cursors blink out-of-phase using unique offsets and speeds.
 * - Wide spawning coordinates prevent screen gaps on extreme cursor positions.
 * - Strictly restricted to FilePilot green/emerald brand color palette.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-waterfall-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let theme = document.documentElement.getAttribute('data-theme') || 'dark';

  // Listen for theme change from theme-toggle button
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        theme = document.documentElement.getAttribute('data-theme');
        // Clear canvas on theme switch to prevent ghosting trails from blending
        ctx.clearRect(0, 0, width, height);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  const mouse = { x: -1000, y: -1000, active: false, down: false };

  // Half-width Katakana, digits, and math operators (for dust/particles/glitches)
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑメモヤユヨラリルレロワヲン0123456789X+=*<>[]#$@";

  // Matrix movie dialogues adapted to FilePilot theme
  const MATRIX_MESSAGES = [
    "WAKE UP, NEO... FILEPILOT HAS YOU...",
    "FOLLOW THE WHITE RABBIT...",
    "KNOCK, KNOCK, NEO. FILEPILOT IS SECURE.",
    "THERE IS NO SERVER. THERE IS ONLY THE SHELL.",
    "FREE YOUR MIND. CHOOSE FILEPILOT.",
    "I CAN ONLY SHOW YOU THE DOOR. YOU MUST WALK THROUGH IT.",
    "WELCOME TO THE DESERT OF THE DECRYPTED.",
    "I KNOW KUNG FU.",
    "YOU TAKE THE GREEN PILL, YOU STAY IN WONDERLAND...",
    "DODGE THIS.",
    "THERE IS A DIFFERENCE BETWEEN KNOWING THE PATH AND WALKING THE PATH.",
    "WHAT ARE YOU TRYING TO TELL ME? THAT I CAN RUN BASH AT LIGHTSPEED?",
    "NO, NEO. WHEN YOU'RE READY, YOU WON'T HAVE TO.",
    "NEVER SEND A HUMAN TO DO A MACHINE'S JOB.",
    "THE CHOICE IS AN ILLUSION.",
    "IGNORANCE IS BLISS...",
    "WHAT IS THE MATRIX? CONTROL.",
    "GOODBYE, MR. ANDERSON...",
    "IT IS INEVITABLE.",
    "TEMET NOSCE. KNOW THYSELF.",
    "EVERYTHING THAT HAS A BEGINNING HAS AN END.",
    "YOU HAVE TO LET IT ALL GO, NEO. FEAR, DOUBT, AND DISBELIEF.",
    "BECAUSE I CHOOSE TO.",
    "WERE YOU LISTENING TO ME, NEO? OR WERE YOU LOOKING AT THE WOMAN IN THE RED DRESS?",
    "THE SYSTEM IS AN ILLUSION."
  ];

  // Developer command streams and programmer humor phrases (complete, semantic shell commands)
  const FUNNY_COMMANDS = [
    "git clone https://github.com/abhibagul/filepilot-shell.git",
    "npm run build && npm run dev",
    "ssh -i ~/.ssh/id_rsa admin@10.0.0.5",
    "docker run -d -p 8080:80 nginx:alpine",
    "kubectl get pods -n production",
    "python3 -m pip install -r requirements.txt",
    "grep -rnw './src' -e 'security'",
    "tar -czf release-v1.tgz ./dist",
    "curl -X POST -H \"Content-Type: json\" https://api",
    "openssl req -x509 -newkey rsa:4096",
    "rsync -avz --exclude '.git' ./dist/ prod:/var/www",
    "find . -name \"*.log\" -type f -delete",
    "gpg --decrypt keys.gpg",
    "npx eslint --fix ./src",
    "systemctl restart nginx.service",
    "cat ~/.config/filepilot/config.json",
    "ping -c 4 127.0.0.1",
    "cargo build --release",
    "vault login secure-token"
  ];

  // Neon theme colors - Strictly emerald greens matching FilePilot branding
  const colors = {
    emerald: '#00FF88',
    matrixGreen: '#00E676',
    darkGreen: '#004D20',
    dimGreen: '#002E13',
    bgParticle: '#005C29' // Dark emerald green for ambient dissolving background dust
  };

  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;

  // 3D rotation angles (remains 0 for stable layout)
  const rx = 0;
  const ry = 0;

  // Pre-calculated trigonometric camera rotation values (constants)
  const cosRx = 1, sinRx = 0;
  const cosRy = 1, sinRy = 0;

  // CRT Screen Glitch / Electromagnetic Deflection state
  let glitchActive = false;
  let glitchTimer = 0;
  let glitchY = 0;
  let glitchHeight = 100;
  let glitchShift = 0;
  let flickerActive = false;
  let flickerTimer = 0;

  // Pre-allocated 2D HSL depth-and-radius color caches to eliminate slow V8 string concatenation
  const colorCache = [];
  const messageColorCache = [];

  function updateColorCache() {
    colorCache.length = 0;
    messageColorCache.length = 0;

    for (let zBin = 0; zBin < 10; zBin++) {
      const zVal = zBin * 100;
      const baseS = Math.floor(100 - (zVal / 950) * 55);
      const baseL = Math.floor(45 - (zVal / 950) * 33);
      const leadL = Math.floor(65 - (zVal / 950) * 35);
      const leadS = Math.floor(100 - (zVal / 950) * 45);
      const msgL = Math.floor(55 - (zVal / 950) * 25);

      const zRow = [];
      const zMsgRow = [];

      for (let rBin = 0; rBin < 10; rBin++) {
        // Inner orbits closer to center Y-axis receive HSL lightness boost
        const rProgress = rBin / 9; // 0 (inner core) to 1 (outer edge)
        const coreBoost = Math.floor((1.0 - rProgress) * 18);

        const s = baseS;
        const l = Math.min(95, baseL + coreBoost);
        const lL = Math.min(98, leadL + coreBoost);
        const lS = leadS;
        const mL = Math.min(96, 86 + coreBoost);

        zRow.push({
          h140: `hsl(140, ${s}%, ${l}%)`,
          h150: `hsl(150, ${s}%, ${l}%)`,
          lead140: `hsl(140, ${lS}%, ${lL}%)`,
          lead150: `hsl(150, ${lS}%, ${leadL}%)`,
          s: s,
          l: l
        });

        zMsgRow.push(`hsl(140, 45%, ${mL}%)`);
      }

      colorCache.push(zRow);
      messageColorCache.push(zMsgRow);
    }
  }

  // Pre-cached blackout mask parameters (recalculated only on resize)
  let maskRadius = 0;
  let maskRadiusSq = 0;
  let maxRadius = 0;

  // Depth parameters
  const fov = 4000;
  const numStrands = 280; // Denser active strands (up from 260) to prevent blank canvas space
  const vortexStrands = [];
  const splashParticles = []; // Horizon splatters sliding radially along ground plane (capped)
  const bgParticles = [];     // Swirling background dust particles (capped)


  class VortexStrand {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      // Cylindrical coordinates: Radius scales up to 140% of screen width to fill full width!
      this.radius = 50 + Math.random() * (maxRadius - 50);
      this.angle = Math.random() * Math.PI * 2;
      this.y = initial
        ? (Math.random() - 0.5) * height * 1.5
        : (Math.random() > 0.5 ? -height * 0.8 : height * 0.8);

      // Vertical Y drift speed
      this.driftSpeed = (Math.random() - 0.5) * 0.45;

      // Orbital speed: inversely proportional to radius to replicate accretion disk astrophysics
      this.baseSpeed = (0.005 + Math.random() * 0.012) * (220 / this.radius);
      this.baseSpeed = Math.min(0.024, Math.max(0.003, this.baseSpeed));

      this.isMessage = Math.random() < 0.14; // Maintain a good dialogue spawn rate
      this.isKatakana = !this.isMessage && Math.random() < 0.40;
      this.isCommand = !this.isMessage && !this.isKatakana;

      // Slower speed and drift for dialogues so they remain readable as they pass
      if (this.isMessage) {
        this.baseSpeed *= 0.5; // Orbit 50% slower
        this.driftSpeed *= 0.4; // Drift 60% slower
        this.baseCharSize = 16 + Math.floor(Math.random() * 6); // Larger base size (16px to 22px)
      } else {
        this.baseCharSize = 12 + Math.floor((this.radius / (maxRadius || 550)) * 8);
      }

      // Unique blink offsets and speeds (cursors blink at different times)
      this.blinkOffset = Math.floor(Math.random() * 60);
      this.blinkSpeed = 5 + Math.floor(Math.random() * 8); // 5 to 13 frames interval

      // Custom cursor indicators assigned to column ends
      if (this.isMessage) {
        this.cursorType = "█"; // Main decrypt message always uses block cursor
      } else {
        const r = Math.random();
        if (r < 0.50) {
          this.cursorType = null; // 50% of streams have no trailing block cursor
        } else if (r < 0.70) {
          this.cursorType = "█";  // Solid block
        } else if (r < 0.85) {
          this.cursorType = "_";  // Underline
        } else if (r < 0.95) {
          this.cursorType = "|";  // Pipe
        } else {
          this.cursorType = "▒";  // Shaded block
        }
      }

      // Set text (longer trails to make matrix look much fuller and eliminate empty spots)
      if (this.isMessage) {
        this.text = MATRIX_MESSAGES[Math.floor(Math.random() * MATRIX_MESSAGES.length)];
        this.length = this.text.length;
      } else if (this.isCommand) {
        this.text = FUNNY_COMMANDS[Math.floor(Math.random() * FUNNY_COMMANDS.length)];
        this.length = this.text.length;
      } else {
        // Japanese Katakana columns length (extended to 12-23 characters for lush cascading trails)
        this.length = 12 + Math.floor(Math.random() * 12);
        let s = "";
        for (let i = 0; i < this.length; i++) {
          s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        this.text = s;
      }

      // Setup cache of characters
      this.history = [];
      for (let i = 0; i < this.length; i++) {
        this.history.push({
          char: this.text[i]
        });
      }
    }

    update() {
      // Hourglass geometry: Radius contracts dynamically in middle Y-axis to 50% (gives better edge coverage)
      const normY = Math.min(1.0, Math.abs(this.y) / (height * 0.8 || 300));
      const scaleFactor = 0.50 + 0.50 * normY * normY;
      const currentRadius = this.radius * scaleFactor;

      // Accelerate orbit on contraction (Conservation of Momentum) and click/touch hold
      const speedMult = (this.radius / currentRadius) * (mouse.down ? 3.8 : 1.0);
      this.angle -= this.baseSpeed * speedMult;

      // Drift vertically
      this.y += this.driftSpeed;

      // Reset if drifts too far vertically
      if (Math.abs(this.y) > height * 0.9) {
        this.reset();
      }

      // Glitch characters temporarily (subtle 0.4% chance per frame for Command/Message)
      if (!this.isKatakana && Math.random() < 0.004) {
        const idx = Math.floor(Math.random() * this.length);
        if (this.text[idx] !== " ") {
          this.history[idx].char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      // Fast restore: glitched characters restore back to original text (25% chance per frame)
      if (!this.isKatakana && Math.random() < 0.25) {
        this.history.forEach((h, idx) => {
          h.char = this.text[idx];
        });
      }

      // Katakana shifting scrolling characters
      if (this.isKatakana && Math.random() < 0.15) {
        const idx = Math.floor(Math.random() * this.length);
        this.history[idx].char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }

      // Horizon Splatters: shed particles sliding radially outward along ground plane (at height * 0.86)
      if (this.y > cy * 0.50 && Math.random() < 0.018) {
        const charIdx = Math.floor(Math.random() * this.length);
        const charAngle = this.angle + charIdx * ((this.baseCharSize * 0.82) / currentRadius);

        const splatX = Math.cos(charAngle) * currentRadius;
        const splatY = this.y;
        const splatZ = 450 + Math.sin(charAngle) * currentRadius;

        if (splashParticles.length > 200) {
          splashParticles.shift();
        }

        // Outward centrifugal radial velocities along the horizontal plane
        const radialVx = Math.cos(charAngle) * (1.8 + Math.random() * 2.2);
        const radialVz = Math.sin(charAngle) * (1.8 + Math.random() * 2.2);

        splashParticles.push({
          x: splatX,
          y: splatY,
          z: splatZ,
          vx: radialVx,
          vy: 0.25, // Settles slightly downward
          vz: radialVz,
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          life: 25 + Math.floor(Math.random() * 20),
          maxLife: 45,
          color: this.isMessage ? colors.emerald : `hsl(150, 90%, 45%)`
        });
      }
    }

    draw() {
      // Include 1 extra index at the end to render the trailing cursor
      const drawLength = this.length + (this.cursorType ? 1 : 0);

      // Hourglass scale factor for current Y position
      const normY = Math.min(1.0, Math.abs(this.y) / (height * 0.8 || 300));
      const scaleFactor = 0.50 + 0.50 * normY * normY;
      const currentRadius = this.radius * scaleFactor;

      // Spacing angle: physical spacing around the circle scales with contracted radius
      const spacingAngle = (this.baseCharSize * 0.82) / currentRadius;

      for (let i = 0; i < drawLength; i++) {
        const isCursor = i === this.length;
        // Offset angle for each letter in the string to spread them along the orbit
        const charAngle = this.angle + i * spacingAngle;

        // Cylindrical coordinates rotated around Y axis (px = cos, pz = sin)
        const px = Math.cos(charAngle) * currentRadius;
        const py = this.y;
        const pz = 450 + Math.sin(charAngle) * currentRadius; // Orbital depth shifts forward/back

        const screenPt = project(px, py, pz);
        const scale = screenPt.scale;

        if (scale <= 0) continue;

        const baseAlpha = 1.0 - (pz / 950);
        const charSize = Math.floor(this.baseCharSize * scale);

        // Reverse trail alpha calculation so that text fades backwards from the trailing cursor
        let trailAlpha = i / this.length;
        if (this.isCommand) {
          trailAlpha = 0.32 + 0.68 * (i / this.length);
        } else if (this.isMessage) {
          trailAlpha = 0.45 + 0.55 * (i / this.length);
        }

        // Fast masked coordinates check (squares check, avoiding Math.sqrt/Math.pow)
        const alpha = getMaskAlpha(screenPt.x, screenPt.y, baseAlpha * trailAlpha * scale);
        if (alpha < 0.02) continue;

        ctx.globalAlpha = alpha;

        // Typography
        let finalCharSize = charSize;
        if (this.isMessage && !isCursor) {
          finalCharSize = Math.floor(charSize * 1.15); // 15% larger for messages
          ctx.font = `700 ${finalCharSize}px 'Fira Code', 'JetBrains Mono', monospace`; // Bold
        } else if (isCursor) {
          ctx.font = `700 ${charSize}px 'Fira Code', 'JetBrains Mono', monospace`;
        } else {
          ctx.font = `500 ${charSize}px 'Fira Code', 'JetBrains Mono', monospace`;
        }

        // trailing cursor blinks as custom cursors out-of-sync
        const isBlinkingCursor = isCursor && (Math.floor((time + this.blinkOffset) / this.blinkSpeed) % 2 === 0);
        if (isCursor && !isBlinkingCursor) continue; // Blinks off

        const charToDraw = isCursor ? this.cursorType : this.history[i].char;

        // 2D Cached Color Matrix Lookup based on Depth (zBin) and Closeness to Core (rBin)
        const zBin = Math.min(9, Math.max(0, Math.floor(pz / 100)));
        const rBin = Math.min(9, Math.max(0, Math.floor((currentRadius / maxRadius) * 10)));
        const cachedColor = colorCache[zBin][rBin];

        const beamDist = Math.abs(screenPt.y - beamY);
        let lBoost = 0;
        if (beamDist < 80) {
          lBoost = Math.floor(((80 - beamDist) / 80) * 15);
        }

        if (isCursor) {
          // Phosphor Bleed Glow CRT simulation: Draw green halo slightly offset, then theme core
          ctx.fillStyle = colors.emerald;
          ctx.fillText(charToDraw, screenPt.x + 0.5, screenPt.y + 0.5); // Green halo

          if (glitchActive) {
            // Chromatic aberration HSL subpixel color double-rendering split
            ctx.fillStyle = `hsl(${this.hue - 15}, ${Math.floor(100 - (pz / 950) * 45)}%, ${Math.floor(65 - (pz / 950) * 35)}%)`;
            ctx.fillText(charToDraw, screenPt.x - 1.5, screenPt.y); // Shifted left
            ctx.fillStyle = `hsl(${this.hue + 15}, ${Math.floor(100 - (pz / 950) * 45)}%, ${Math.floor(65 - (pz / 950) * 35)}%)`;
            ctx.fillText(charToDraw, screenPt.x + 1.5, screenPt.y); // Shifted right
          } else {
            ctx.fillStyle = (this.hue === 140) ? cachedColor.lead140 : cachedColor.lead150;
            ctx.fillText(charToDraw, screenPt.x, screenPt.y); // Cached core
          }
        } else {
          // Trail coloring: computed dynamically using 2D pre-cached depth/radius lookup
          if (this.isMessage) {
            // Draw a subtle green drop-glow behind the text
            ctx.fillStyle = 'rgba(0, 230, 96, 0.42)';
            ctx.fillText(charToDraw, screenPt.x + 0.75, screenPt.y + 0.75);

            if (lBoost > 0) {
              const messageLightness = Math.min(98, 86 - (pz / 950) * 15 + lBoost);
              ctx.fillStyle = `hsl(140, 45%, ${messageLightness}%)`;
            } else {
              ctx.fillStyle = messageColorCache[zBin][rBin]; // Cached message string
            }
          } else {
            if (lBoost > 0) {
              ctx.fillStyle = `hsl(150, ${cachedColor.s}%, ${Math.min(95, cachedColor.l + lBoost)}%)`;
            } else {
              ctx.fillStyle = (this.hue === 140) ? cachedColor.h140 : cachedColor.h150; // Cached command/Katakana string
            }
          }
          ctx.fillText(charToDraw, screenPt.x, screenPt.y);
        }
      }
      ctx.globalAlpha = 1.0;
    }
  }

  // Handle Resize
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    cx = width / 2;
    cy = height / 2;

    // Cache mask parameters to avoid calculations inside project loop
    maskRadius = width * 0.165;
    maskRadiusSq = maskRadius * maskRadius;
    maxRadius = width * 1.4; // Expanded offscreen coordinates to cover edges

    // Re-fill cached color arrays
    updateColorCache();

    // Repopulate strands on resize
    vortexStrands.length = 0;
    for (let i = 0; i < numStrands; i++) {
      vortexStrands.push(new VortexStrand());
    }

    // Reset bg particles in full-width orbital positions
    bgParticles.length = 0;
    for (let i = 0; i < 180; i++) { // Denser background dust count (180 instead of 110)
      const pRad = 30 + Math.random() * (width * 1.5 - 30);
      bgParticles.push({
        radius: pRad,
        angle: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * height * 1.5,
        driftSpeed: (Math.random() - 0.5) * 0.3,
        baseSpeed: (0.003 + Math.random() * 0.007) * (200 / pRad),
        char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        life: 50 + Math.floor(Math.random() * 60),
        maxLife: 110,
        charSize: 7 + Math.floor(Math.random() * 6), // Sized larger for volumetric richness (7px-12px)
        color: colors.bgParticle
      });
    }


  }

  // 3D Projection Math
  function project(px, py, pz) {
    const scale = Math.min(1.15, Math.max(0.2, fov / (fov + pz)));
    let sx = cx + px * scale;
    let sy = cy + py * scale;

    // 1. CRT Electromagnetic Band Shearing (warps X horizontally in a cosine-smoothed wavy band)
    if (glitchActive && Math.abs(sy - glitchY) < glitchHeight) {
      const dist = Math.abs(sy - glitchY);
      const factor = Math.cos((dist / glitchHeight) * Math.PI / 2);
      sx += glitchShift * factor * Math.sin(time * 0.85);
    }

    // 2. Interactive Fluid Attraction/Repulsion wakes
    if (mouse.active) {
      const mdx = sx - mouse.x;
      const mdy = sy - mouse.y;
      const distSq = mdx * mdx + mdy * mdy;

      if (mouse.down && distSq < 40000) { // 200 * 200 threshold
        const dist = Math.sqrt(distSq);
        const force = Math.pow((200 - dist) / 200, 1.6);
        const angle = Math.atan2(mdy, mdx) + force * 1.6; // Spiral orbital sweep
        const targetDist = dist * (1.0 - force * 0.72);  // Radial contraction
        return {
          x: mouse.x + Math.cos(angle) * targetDist,
          y: mouse.y + Math.sin(angle) * targetDist,
          scale: scale
        };
      } else if (!mouse.down && distSq < 16900 && distSq > 1) { // 130 * 130 threshold
        const dist = Math.sqrt(distSq);
        const force = Math.pow((130 - dist) / 130, 2);
        return {
          x: sx + (mdx / dist) * force * 35, // Pushes horizontally by up to 35px
          y: sy + (mdy / dist) * force * 20, // Pushes vertically by up to 20px
          scale: scale
        };
      }
    }

    return {
      x: sx,
      y: sy,
      scale: scale
    };
  }

  // Calculate mask opacity using fast squared-distance checks (avoids Math.sqrt & Math.pow)
  function getMaskAlpha(px, py, baseAlpha) {
    const dx = px - cx;
    const dy = (py - cy) / 0.55;
    const distSq = dx * dx + dy * dy;

    if (distSq >= maskRadiusSq) return baseAlpha;
    if (distSq < maskRadiusSq * 0.04) return 0; // Blackout core

    // Fast quadratic fade interpolation
    const ratio = distSq / maskRadiusSq;
    return baseAlpha * ratio * ratio;
  }

  // Track Mouse Move Globally on the Window object
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });

  window.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || e.relatedTarget.nodeName === "HTML") {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.down = false;
    }
  });

  window.addEventListener('mousedown', () => {
    mouse.down = true;
  });

  window.addEventListener('mouseup', () => {
    mouse.down = false;
  });

  // Mobile Touch Support
  window.addEventListener('touchstart', (e) => {
    mouse.active = true;
    mouse.down = true;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  });

  window.addEventListener('touchend', () => {
    mouse.down = false;
    mouse.active = false;
  });

  window.addEventListener('touchmove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  });

  // Main Loop
  let time = 0;
  let isDark = true;
  let beamY = 0;
  function draw() {
    time++;

    isDark = theme === 'dark';

    // CRT Screen Power Flicker & Jitter Glitch triggers: Occasional unified sags
    if (!glitchActive && Math.random() < 0.0012) {
      glitchActive = true;
      glitchTimer = 3 + Math.floor(Math.random() * 6); // Jitters for 3-9 frames
      glitchY = Math.random() * height;
      glitchHeight = 80 + Math.random() * 60; // 80px to 140px band
      glitchShift = (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 14); // up to 32px shear displacement
      flickerActive = true;
      flickerTimer = glitchTimer;
    }

    if (glitchActive) {
      glitchTimer--;
      if (glitchTimer <= 0) {
        glitchActive = false;
      }
    }
    if (flickerActive) {
      flickerTimer--;
      if (flickerTimer <= 0) {
        flickerActive = false;
      }
    }

    // Draw background linear gradient of matrix shades from top to bottom at moderate opacity to create shorter phosphor decay motion trails
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    if (isDark) {
      // Dark theme: vibrant matrix green fading to dark charcoal slate with 0.50 opacity
      bgGrad.addColorStop(0, 'rgba(0, 60, 24, 0.50)');    // Top
      bgGrad.addColorStop(0.4, 'rgba(0, 24, 10, 0.50)');  // Middle
      bgGrad.addColorStop(1, 'rgba(11, 16, 20, 0.50)');   // Bottom (fades into page background)
    } else {
      // Light theme: vibrant minty green to light off-white with 0.50 opacity
      bgGrad.addColorStop(0, 'rgba(180, 230, 205, 0.50)'); // Mint green
      bgGrad.addColorStop(1, 'rgba(249, 251, 251, 0.50)');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Save context transform before applying global jitter screen shakes
    ctx.save();
    if (glitchActive) {
      // Shakes scanlines, vignette, and rain together under power deflection
      ctx.translate((Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 1.5);
    }

    // Cathode refresh beam sweep position update
    beamY = (time * 1.8) % (height + 200) - 100;

    // Draw central radial background glow
    const glowX = width / 2;
    const glowY = height * 0.46;
    const radGlow = ctx.createRadialGradient(glowX, glowY, 5, glowX, glowY, width * 0.38);
    if (isDark) {
      radGlow.addColorStop(0, 'rgba(0, 230, 96, 0.03)');
      radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      radGlow.addColorStop(0, 'rgba(0, 184, 87, 0.015)');
      radGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, width, height);

    // 3D Perspective Vector Ground Grid Plane (Wireframe horizon mesh projected in 3D space)
    const groundY = cy * 0.76;
    ctx.strokeStyle = isDark ? 'rgba(0, 255, 136, 0.023)' : 'rgba(0, 184, 87, 0.038)';
    ctx.lineWidth = 1.0;

    // Horizontal grid lines at depth increments
    for (let z = 100; z <= 900; z += 100) {
      const ptLeft = project(-width * 1.5, groundY, z);
      const ptRight = project(width * 1.5, groundY, z);
      ctx.beginPath();
      ctx.moveTo(ptLeft.x, ptLeft.y);
      ctx.lineTo(ptRight.x, ptRight.y);
      ctx.stroke();
    }

    // Longitudinal radial grid lines radiating from horizon vanishing point
    const numLines = 14;
    for (let i = 0; i <= numLines; i++) {
      const progress = i / numLines;
      const xVal = (progress - 0.5) * width * 3.0;
      const ptFar = project(xVal, groundY, 900);
      const ptNear = project(xVal, groundY, 100);
      ctx.beginPath();
      ctx.moveTo(ptFar.x, ptFar.y);
      ctx.lineTo(ptNear.x, ptNear.y);
      ctx.stroke();
    }

    // Update and draw swirling background dust particles
    for (let i = bgParticles.length - 1; i >= 0; i--) {
      const p = bgParticles[i];
      p.life--;
      if (p.life <= 0) {
        // Reset dust particle in full-width cylindrical orbit
        p.radius = 30 + Math.random() * (width * 1.5 - 30);
        p.angle = Math.random() * Math.PI * 2;
        p.y = (Math.random() - 0.5) * height * 1.5;
        p.life = 60 + Math.floor(Math.random() * 50);
        continue;
      }

      // Hourglass geometry also applied to dust particles for spatial consistency
      const pNormY = Math.min(1.0, Math.abs(p.y) / (height * 0.8 || 300));
      const pScaleFactor = 0.50 + 0.50 * pNormY * pNormY;
      const pCurrentRadius = p.radius * pScaleFactor;

      const speedMult = (p.radius / pCurrentRadius) * (mouse.down ? 3.8 : 1.0);
      p.angle -= p.baseSpeed * speedMult;
      p.y += p.driftSpeed;

      // Project orbital dust in 3D
      const px = Math.cos(p.angle) * pCurrentRadius;
      const pz = 450 + Math.sin(p.angle) * pCurrentRadius;

      const screenPt = project(px, p.y, pz);
      const scale = screenPt.scale;

      if (scale <= 0) continue;

      const baseAlpha = 1.0 - (pz / 1000);
      const alpha = getMaskAlpha(screenPt.x, screenPt.y, baseAlpha * (p.life / p.maxLife) * scale * 0.75);

      if (alpha < 0.02) continue;

      ctx.globalAlpha = alpha;
      ctx.font = `400 ${Math.floor(p.charSize * scale)}px 'Fira Code', 'JetBrains Mono', monospace`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, screenPt.x, screenPt.y);
    }



    // Update and draw vortex strands
    vortexStrands.forEach((strand) => {
      strand.update();
      strand.draw();
    });

    // Update and draw splattered slide particles (centrifugal splatters along ground plane)
    for (let i = splashParticles.length - 1; i >= 0; i--) {
      const p = splashParticles[i];
      p.life--;
      if (p.life <= 0) {
        splashParticles.splice(i, 1);
        continue;
      }

      // Slide outward horizontally and depth-wise along ground plane
      p.x += p.vx;
      p.z += p.vz;
      p.y += p.vy;

      const screenPt = project(p.x, p.y, p.z);
      const scale = screenPt.scale;

      if (scale <= 0) continue;

      const baseAlpha = 1.0 - (p.z / 950);
      const alpha = getMaskAlpha(screenPt.x, screenPt.y, baseAlpha * (p.life / p.maxLife) * scale);

      if (alpha < 0.02) continue;

      ctx.globalAlpha = alpha;

      // Draw expanding concentric green HSL ripples reflecting on the ground plane
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      const rFactor = (1.0 - p.life / p.maxLife) * 16 * scale;
      ctx.ellipse(screenPt.x, screenPt.y, rFactor, rFactor * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = `400 ${Math.floor(7 * scale)}px 'Fira Code', 'JetBrains Mono', monospace`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.char, screenPt.x, screenPt.y);
    }
    ctx.globalAlpha = 1.0;

    // Faint Horizontal CRT Scanlines Overlay
    ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.0;
    for (let y = 0; y < height; y += 3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // CRT Power Flicker Overlay: momentary dark green tint overlay for power load drop
    if (flickerActive) {
      ctx.fillStyle = 'rgba(0, 12, 6, 0.35)'; // Faint dark voltage sag overlay
      ctx.fillRect(0, 0, width, height);
    }



    // CRT Cathode Sweep Beam Highlight Glow
    if (beamY > -40 && beamY < height + 40) {
      const beamGrad = ctx.createLinearGradient(0, beamY - 40, 0, beamY + 40);
      beamGrad.addColorStop(0, 'rgba(0, 230, 96, 0)');
      beamGrad.addColorStop(0.5, isDark ? 'rgba(0, 230, 96, 0.05)' : 'rgba(0, 184, 87, 0.03)');
      beamGrad.addColorStop(1, 'rgba(0, 230, 96, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 40, width, 80);
    }

    // CRT Radial vignette screen tube glass curvature frame overlay
    const vignette = ctx.createRadialGradient(cx, cy, width * 0.45, cx, cy, width * 0.85);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 10, 5, 0.82)'); // Vignette borders
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Restore context translation
    ctx.restore();

    requestAnimationFrame(draw);
  }

  // Bind resize and start
  window.addEventListener('resize', resize);

  resize();
  draw();
});
