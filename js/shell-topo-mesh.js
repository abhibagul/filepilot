/**
 * FilePilot Shell — High-Performance 60FPS Full-Screen LED Dot-Matrix Command Grid
 * - LED Dot-Matrix: A static 2D grid of retro character cells (14px x 18px).
 * - Bounding Boxes: Every cell has a dark background box and outline border, matching the main heading style.
 * - Dynamic Flickering: Faint ambient characters morph and flicker soft green light across the panel.
 * - Shell Commands typing: cd, ls, ll, htop, and neofetch type out character-by-character on grid coordinates.
 * - Cursors: Blinking block terminal cursors (█) follow the typing edge and stay active during execution.
 * - Interactive Hover: Mouse cursor scrambles characters and illuminates cell borders dynamically.
 * - Surge Surge Surge: Clicking and holding triggers a 5x acceleration of grid character morph rates.
 * - CRT scanlines, electromagnetic shears, voltage flickers, and vignettes.
 */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('hero-waterfall-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let theme = document.documentElement.getAttribute('data-theme') || 'dark';

  // Listen for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        theme = document.documentElement.getAttribute('data-theme');
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  const mouse = { x: -1000, y: -1000, active: false, down: false };

  // Half-width Katakana, digits, and mathematical operators
  const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑメモヤユヨ0123456789X+=*<>";

  // Commands to display on the matrix grid
  const SHELL_COMMANDS = [
    "cd ..",
    "ls -la",
    "ll",
    "htop",
    "neofetch",
    "git status",
    "docker ps",
    "vim index.html",
    "ssh root@10.0.0.5",
    "grep -rn 'security'",
    "cat config.json",
    "ping 8.8.8.8",
    "mkdir src",
    "npm run dev",
    "curl -I https://api",
    "rm -rf tmp",
    "sudo systemctl restart nginx",
    "exit",
    "clear",
    "pwd",
    "whoami",
    "uname -a",
    "top"
  ];

  // Neon theme colors - Strictly emerald greens matching FilePilot branding
  const colors = {
    emerald: '#00FF88',
    matrixGreen: '#00E676',
    darkGreen: '#004D20',
    dimGreen: '#002E13',
    cellBg: 'rgba(0, 12, 6, 0.55)',
    cellBorder: 'rgba(0, 255, 136, 0.04)'
  };

  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;

  // Grid sizing parameters (14px x 18px cell)
  const cellWidth = 14;
  const cellHeight = 18;
  let cols = 0;
  let rows = 0;

  // Mask boundaries (cached to avoid recalculation)
  let maskRadius = 0;
  let maskRadiusSq = 0;

  // CRT Jitter / Flicker states
  let glitchActive = false;
  let glitchTimer = 0;
  let glitchY = 0;
  let glitchHeight = 100;
  let glitchShift = 0;
  let flickerActive = false;
  let flickerTimer = 0;

  // Pre-cached opacity strings for clean GC-free rendering
  const colorCache = [];
  function updateColorCache() {
    colorCache.length = 0;
    for (let i = 0; i <= 10; i++) {
      const opacity = i / 10;
      colorCache.push({
        emerald: `rgba(0, 255, 136, ${opacity})`,
        matrixGreen: `rgba(0, 230, 96, ${opacity})`,
        darkGreen: `rgba(0, 77, 32, ${opacity})`,
        dimGreen: `rgba(0, 46, 19, ${opacity})`,
        cellBg: `rgba(0, 12, 6, ${opacity * 0.55})`,
        cellBorder: `rgba(0, 255, 136, ${opacity * 0.04})`
      });
    }
  }

  // Active typing commands on the grid coordinates
  const horizontalCommands = [];
  // Ambient background LED grid cells
  let ambientGrid = [];

  // Handle Resize and Grid Initialization
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

    cols = Math.floor(width / cellWidth) + 1;
    rows = Math.floor(height / cellHeight) + 1;

    // Cache mask parameters (16.5% of page width)
    maskRadius = width * 0.165;
    maskRadiusSq = maskRadius * maskRadius;

    updateColorCache();

    // Populate ambient background LED grid
    ambientGrid = [];
    for (let x = 0; x < cols; x++) {
      ambientGrid[x] = [];
      for (let y = 0; y < rows; y++) {
        ambientGrid[x][y] = {
          char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          opacity: 0.02 + Math.random() * 0.06,
          targetOpacity: 0.02 + Math.random() * 0.06,
          morphTimer: Math.floor(Math.random() * 200)
        };
      }
    }
  }

  // Fast squared distance mask calculation
  function getMaskAlpha(px, py, baseAlpha) {
    const dx = px - cx;
    const dy = (py - cy) / 0.55; // Ellipse vertical scale factor
    const distSq = dx * dx + dy * dy;

    if (distSq >= maskRadiusSq) return baseAlpha;
    if (distSq < maskRadiusSq * 0.04) return 0; // Blackout core

    const ratio = distSq / maskRadiusSq;
    return baseAlpha * ratio * ratio; // Quadratic smooth fadeout
  }

  // Spawn horizontal executing terminal commands on grid coordinates
  function spawnHorizontalCommand() {
    if (horizontalCommands.length > 5) return; // Limit concurrent typing lines

    const cmdText = SHELL_COMMANDS[Math.floor(Math.random() * SHELL_COMMANDS.length)];
    const cmdLen = cmdText.length;

    // Random coordinates, keeping it off the edges and absolute center mask zone
    const targetRow = 3 + Math.floor(Math.random() * (rows - 6));
    const targetCol = Math.floor(Math.random() * (cols - cmdLen - 4)); // Leave room for typing cursor

    horizontalCommands.push({
      x: targetCol,
      y: targetRow,
      text: cmdText,
      chars: cmdText.split(''),
      typedLength: 0,
      typeSpeed: 3 + Math.floor(Math.random() * 4), // Reveal character every 3-6 frames
      typeTimer: 0,
      state: 'typing', // 'typing', 'waiting', 'fading'
      age: 0,
      maxAge: 90 + Math.floor(Math.random() * 60), // Wait time after typing finishes (90-150 frames)
      fadeTimer: 0,
      fadeDuration: 40
    });
  }

  // Track mouse coordinates globally on the window
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
  function draw() {
    time++;

    isDark = theme === 'dark';

    // CRT screen flicker triggers
    if (!glitchActive && Math.random() < 0.001) {
      glitchActive = true;
      glitchTimer = 4 + Math.floor(Math.random() * 6);
      glitchY = Math.random() * height;
      glitchHeight = 90 + Math.random() * 70;
      glitchShift = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 15);
      flickerActive = true;
      flickerTimer = glitchTimer;
    }

    if (glitchActive) {
      glitchTimer--;
      if (glitchTimer <= 0) glitchActive = false;
    }
    if (flickerActive) {
      flickerTimer--;
      if (flickerTimer <= 0) flickerActive = false;
    }

    // Spawn horizontal typing commands (2.0% chance per frame)
    if (Math.random() < 0.02) {
      spawnHorizontalCommand();
    }

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    if (glitchActive) {
      ctx.translate((Math.random() - 0.5) * 4.0, (Math.random() - 0.5) * 1.5);
    }

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

    // Update grid characters and opacities
    const morphChance = mouse.down ? 0.08 : 0.012; // 5x faster morph on data surge click
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = ambientGrid[x][y];
        
        // Randomly morph character
        if (Math.random() < morphChance) {
          cell.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }

        // Faint ambient opacity breathing
        if (Math.random() < 0.01) {
          cell.targetOpacity = 0.02 + Math.random() * 0.06;
        }
        cell.opacity += (cell.targetOpacity - cell.opacity) * 0.1;
      }
    }

    // 1. Draw Static LED Grid Cells & Ambient Characters
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = ambientGrid[x][y];
        const px = x * cellWidth;
        const py = y * cellHeight;

        // Apply electromagnetic warp offsets during CRT glitches
        let warpX = 0;
        const screenY = py + cellHeight / 2;
        if (glitchActive && Math.abs(screenY - glitchY) < glitchHeight) {
          const dist = Math.abs(screenY - glitchY);
          const factor = Math.cos((dist / glitchHeight) * Math.PI / 2);
          warpX = glitchShift * factor * Math.sin(time * 0.85);
        }

        const finalCellX = px + warpX;
        const finalCellY = py;

        // Mouse hover interaction: cells near cursor scramble and illuminate
        let hoverFactor = 0;
        if (mouse.active) {
          const dx = (finalCellX + cellWidth / 2) - mouse.x;
          const dy = (finalCellY + cellHeight / 2) - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 7225) {
            const dist = Math.sqrt(distSq);
            hoverFactor = (85 - dist) / 85;
            
            if (Math.random() < 0.25) {
              cell.char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            }
          }
        }

        // Base cell opacity combine with hover glow boost
        let baseAlpha = cell.opacity + hoverFactor * 0.12;
        baseAlpha = Math.max(0, Math.min(1.0, baseAlpha));

        const maskAlpha = getMaskAlpha(finalCellX + cellWidth / 2, finalCellY + cellHeight / 2, baseAlpha);
        if (maskAlpha < 0.005) continue;

        ctx.globalAlpha = maskAlpha;

        const cacheIndex = Math.min(10, Math.floor(maskAlpha * 10));
        const cached = colorCache[cacheIndex];

        // Draw Cell Bounding Box
        ctx.fillStyle = isDark ? cached.cellBg : 'rgba(0, 12, 6, 0.02)';
        ctx.fillRect(finalCellX + 1, finalCellY + 1, cellWidth - 2, cellHeight - 2);

        // Draw Cell Outline Border
        ctx.strokeStyle = hoverFactor > 0.05 
          ? `rgba(0, 255, 136, ${maskAlpha * (0.04 + hoverFactor * 0.12)})`
          : (isDark ? cached.cellBorder : 'rgba(0, 77, 32, 0.01)');
        ctx.lineWidth = 1.0;
        ctx.strokeRect(finalCellX + 1, finalCellY + 1, cellWidth - 2, cellHeight - 2);

        // Draw Ambient Character Inside Cell
        ctx.font = `500 10px 'Fira Code', monospace`;
        ctx.fillStyle = hoverFactor > 0.05
          ? `rgba(0, 255, 136, ${maskAlpha})`
          : (isDark ? cached.dimGreen : 'rgba(0, 77, 32, 0.15)');
        ctx.fillText(cell.char, finalCellX + cellWidth / 2, finalCellY + cellHeight / 2);
      }
    }
    ctx.globalAlpha = 1.0;

    // 2. Draw Horizontal Commands Overlay with Typing & Blinking Cursor
    for (let i = horizontalCommands.length - 1; i >= 0; i--) {
      const cmd = horizontalCommands[i];

      // Update command states
      if (cmd.state === 'typing') {
        cmd.typeTimer++;
        if (cmd.typeTimer >= cmd.typeSpeed) {
          cmd.typeTimer = 0;
          cmd.typedLength++;
          if (cmd.typedLength >= cmd.chars.length) {
            cmd.state = 'waiting';
          }
        }
      } else if (cmd.state === 'waiting') {
        cmd.age++;
        if (cmd.age >= cmd.maxAge) {
          cmd.state = 'fading';
        }
      } else if (cmd.state === 'fading') {
        cmd.fadeTimer++;
        if (cmd.fadeTimer >= cmd.fadeDuration) {
          horizontalCommands.splice(i, 1);
          continue;
        }
      }

      // Determine visibility scale factor
      let opacity = 1.0;
      if (cmd.state === 'fading') {
        opacity = (cmd.fadeDuration - cmd.fadeTimer) / cmd.fadeDuration;
      }

      const showCount = cmd.typedLength;

      // A: Draw typed characters
      for (let c = 0; c < showCount; c++) {
        const cellXIndex = cmd.x + c;
        if (cellXIndex < 0 || cellXIndex >= cols) continue;

        const cellX = cellXIndex * cellWidth;
        const cellY = cmd.y * cellHeight;

        let warpX = 0;
        const screenY = cellY + cellHeight / 2;
        if (glitchActive && Math.abs(screenY - glitchY) < glitchHeight) {
          const dist = Math.abs(screenY - glitchY);
          const factor = Math.cos((dist / glitchHeight) * Math.PI / 2);
          warpX = glitchShift * factor * Math.sin(time * 0.85);
        }

        const finalCellX = cellX + warpX;
        const finalCellY = cellY;

        const maskAlpha = getMaskAlpha(finalCellX + cellWidth / 2, finalCellY + cellHeight / 2, opacity);
        if (maskAlpha < 0.02) continue;

        ctx.globalAlpha = maskAlpha;

        // Cell background highlight
        ctx.fillStyle = isDark ? `rgba(0, 255, 136, ${maskAlpha * 0.08})` : 'rgba(0, 255, 136, 0.02)';
        ctx.fillRect(finalCellX + 1, finalCellY + 1, cellWidth - 2, cellHeight - 2);

        // Highlighted neon green cell border
        ctx.strokeStyle = `rgba(0, 255, 136, ${maskAlpha * 0.22})`;
        ctx.lineWidth = 1.0;
        ctx.strokeRect(finalCellX + 1, finalCellY + 1, cellWidth - 2, cellHeight - 2);

        // Character details: dissolve cells when fading
        let charToDraw = cmd.chars[c];
        if (cmd.state === 'fading' && Math.random() < 0.22) {
          charToDraw = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          ctx.fillStyle = colors.darkGreen;
          ctx.font = `500 10px 'Fira Code', monospace`;
        } else {
          ctx.fillStyle = isDark ? '#FFFFFF' : '#00FF88';
          ctx.font = `bold 12px 'Fira Code', monospace`;
        }

        ctx.shadowColor = colors.matrixGreen;
        ctx.shadowBlur = (cmd.state === 'fading') ? 2 : 6;
        ctx.fillText(charToDraw, finalCellX + cellWidth / 2, finalCellY + cellHeight / 2);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // B: Draw blinking terminal follower cursor
      if (cmd.state === 'typing' || cmd.state === 'waiting') {
        const cursorCol = cmd.x + showCount;
        if (cursorCol >= 0 && cursorCol < cols) {
          const cursorX = cursorCol * cellWidth;
          const cursorY = cmd.y * cellHeight;

          let warpX = 0;
          const screenY = cursorY + cellHeight / 2;
          if (glitchActive && Math.abs(screenY - glitchY) < glitchHeight) {
            const dist = Math.abs(screenY - glitchY);
            const factor = Math.cos((dist / glitchHeight) * Math.PI / 2);
            warpX = glitchShift * factor * Math.sin(time * 0.85);
          }

          const finalCursorX = cursorX + warpX;
          const finalCursorY = cursorY;

          const maskAlpha = getMaskAlpha(finalCursorX + cellWidth / 2, finalCursorY + cellHeight / 2, 1.0);
          if (maskAlpha >= 0.02) {
            const isCursorBlinkOn = Math.floor(time / 6) % 2 === 0;
            if (isCursorBlinkOn) {
              ctx.globalAlpha = maskAlpha;
              
              // Glowing cursor block background
              ctx.fillStyle = isDark ? `rgba(0, 255, 136, ${maskAlpha * 0.22})` : 'rgba(0, 255, 136, 0.1)';
              ctx.fillRect(finalCursorX + 1, finalCursorY + 1, cellWidth - 2, cellHeight - 2);

              ctx.strokeStyle = `rgba(0, 255, 136, ${maskAlpha * 0.55})`;
              ctx.lineWidth = 1.0;
              ctx.strokeRect(finalCursorX + 1, finalCursorY + 1, cellWidth - 2, cellHeight - 2);

              ctx.fillStyle = colors.emerald;
              ctx.font = `bold 12px 'Fira Code', monospace`;
              ctx.shadowColor = colors.matrixGreen;
              ctx.shadowBlur = 8;
              ctx.fillText('█', finalCursorX + cellWidth / 2, finalCursorY + cellHeight / 2);
              
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }
          }
        }
      }
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

    // CRT Power Sag Dimming Overlay
    if (flickerActive) {
      ctx.fillStyle = 'rgba(0, 12, 6, 0.35)';
      ctx.fillRect(0, 0, width, height);
    }

    // CRT Radial vignette screen tube overlay
    const vignette = ctx.createRadialGradient(cx, cy, width * 0.45, cx, cy, width * 0.85);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 10, 5, 0.82)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    requestAnimationFrame(draw);
  }

  // Bind resize and start
  window.addEventListener('resize', resize);
  
  resize();
  draw();
});
