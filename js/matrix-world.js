document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hero');
  if (!container) return;

  container.style.position = 'relative';
  container.style.overflow = 'hidden';

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-world-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';

  const heroContent = container.querySelector('.container');
  if (heroContent) heroContent.style.position = 'relative';
  if (heroContent) heroContent.style.zIndex = '1';

  container.prepend(canvas);

  const ctx = canvas.getContext('2d');

  // Create an offscreen canvas to cache the static city background
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d');

  let width, height;

  // Matrix City Configuration
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*アイウエオカキクケコサシスセソタチツテト";
  const charSize = 5.5; // Extreme zoomed out view

  // Procedural City Grid
  const gridSize = 14 * charSize; // 70px
  const roadW = 4 * charSize;     // 20px

  // Blackout Mask Configuration
  const MASK_RADIUS_PERCENT = 0.25; // 55% of screen width
  const MASK_Y_SCALE = 0.5;         // Flatten into an ellipse (70% height)

  const uplinkNodes = [];
  const bursts = [];
  const packets = [];

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;

    canvas.width = width;
    canvas.height = height;

    bgCanvas.width = width;
    bgCanvas.height = height;

    drawCityBackground();
    if (typeof spawnNodes === 'function') spawnNodes();
  }

  window.addEventListener('resize', resize);
  resize();

  function getHash(x, y, seed = 0) {
    let val = Math.sin(x * 12.9898 + y * 78.233 + seed * 13.541) * 43758.5453;
    return val - Math.floor(val);
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
    return `${parseInt(hex.substring(0,2), 16)}, ${parseInt(hex.substring(2,4), 16)}, ${parseInt(hex.substring(4,6), 16)}`;
  }

  // Determine building bounds by merging cells in 2x2 macro-blocks
  function getBuilding(gx, gy) {
    const Mx = Math.floor(gx / 2);
    const My = Math.floor(gy / 2);

    const lx = ((gx % 2) + 2) % 2;
    const ly = ((gy % 2) + 2) % 2;

    const hash = getHash(Mx, My, 1);
    const type = Math.floor(hash * 6);

    let x1 = Mx * 2;
    let y1 = My * 2;
    let x2 = x1;
    let y2 = y1;

    if (type === 0) {
      x1 = x2 = gx;
      y1 = y2 = gy;
    } else if (type === 1) {
      x2 = x1 + 1;
      y2 = y1 + 1;
    } else if (type === 2) {
      x1 = Mx * 2;
      x2 = x1 + 1;
      y1 = y2 = gy;
    } else if (type === 3) {
      x1 = x2 = gx;
      y1 = My * 2;
      y2 = y1 + 1;
    } else if (type === 4) {
      if (ly === 0) {
        x1 = Mx * 2;
        x2 = x1 + 1;
        y1 = y2 = gy;
      } else {
        x1 = x2 = gx;
        y1 = y2 = gy;
      }
    } else if (type === 5) {
      if (lx === 0) {
        x1 = x2 = gx;
        y1 = My * 2;
        y2 = y1 + 1;
      } else {
        x1 = x2 = gx;
        y1 = y2 = gy;
      }
    }

    if (x1 === x2 && y1 === y2) {
      if (getHash(gx, gy, 2) < 0.1) return null;
    }

    return {
      startX: x1 * gridSize,
      endX: (x2 + 1) * gridSize - roadW,
      startY: y1 * gridSize,
      endY: (y2 + 1) * gridSize - roadW
    };
  }

  function isPointBlocked(px, py) {
    const gx = Math.floor(px / gridSize);
    const gy = Math.floor(py / gridSize);
    const b = getBuilding(gx, gy);
    return (b && px >= b.startX && px < b.endX && py >= b.startY && py < b.endY);
  }

  function drawCityBackground() {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme !== 'light';
    const computed = getComputedStyle(document.documentElement);
    const bgHex = computed.getPropertyValue('--bg-primary').trim();
    const accentHex = computed.getPropertyValue('--accent').trim();
    const accentRgb = hexToRgb(accentHex);

    bgCtx.fillStyle = bgHex;
    bgCtx.fillRect(0, 0, width, height);

    // Draw proper roads and junctions
    bgCtx.strokeStyle = `rgba(${accentRgb}, ${isDark ? 0.25 : 0.3})`;
    bgCtx.lineWidth = 1;

    const numRows = Math.ceil(height / gridSize) + 2;
    const numCols = Math.ceil(width / gridSize) + 2;

    for (let r = -1; r < numRows; r++) {
      for (let c = -1; c < numCols; c++) {
        const ix = (c + 1) * gridSize - roadW / 2;
        const iy = (r + 1) * gridSize - roadW / 2;

        // Draw Junction Node (only if not swallowed by a macro-building)
        if (!isPointBlocked(ix, iy)) {
          bgCtx.beginPath();
          bgCtx.arc(ix, iy, 2.5, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(${accentRgb}, ${isDark ? 0.15 : 0.2})`;
          bgCtx.fill();
          bgCtx.stroke();
        }

        // Draw Horizontal Road (Right)
        if (!isPointBlocked(ix + gridSize / 2, iy)) {
          bgCtx.setLineDash([3, 5]);
          bgCtx.beginPath();
          bgCtx.moveTo(ix + 6, iy);
          bgCtx.lineTo(ix + gridSize - 6, iy);
          bgCtx.stroke();
        }

        // Draw Vertical Road (Down)
        if (!isPointBlocked(ix, iy + gridSize / 2)) {
          bgCtx.setLineDash([3, 5]);
          bgCtx.beginPath();
          bgCtx.moveTo(ix, iy + 6);
          bgCtx.lineTo(ix, iy + gridSize - 6);
          bgCtx.stroke();
        }
        bgCtx.setLineDash([]);
      }
    }

    bgCtx.font = `bold ${charSize}px monospace`;
    bgCtx.textAlign = 'center';
    bgCtx.textBaseline = 'middle';

    const rows = Math.ceil(height / charSize);
    const cols = Math.ceil(width / charSize);

    for (let r = 0; r < rows; r++) {
      const worldY = r * charSize;
      const gy = Math.floor(worldY / gridSize);

      for (let c = 0; c < cols; c++) {
        const worldX = c * charSize;
        const gx = Math.floor(worldX / gridSize);

        const building = getBuilding(gx, gy);

        if (building && worldX >= building.startX && worldX < building.endX && worldY >= building.startY && worldY < building.endY) {
          const hashTime = getHash(worldX, worldY, 0);
          const charIndex = Math.floor(hashTime * chars.length);
          const char = chars[charIndex];

          const distToEdge = Math.min(
            worldX - building.startX,
            building.endX - worldX,
            worldY - building.startY,
            building.endY - worldY
          );
          const isEdge = distToEdge <= charSize;

          const baseHash = getHash(worldX, worldY, 10);

          let alpha = 0;
          if (isDark) {
            alpha = isEdge ? 0.3 + baseHash * 0.5 : 0.05 + baseHash * 0.15;
          } else {
            alpha = isEdge ? 0.4 + baseHash * 0.5 : 0.1 + baseHash * 0.2;
          }
          bgCtx.fillStyle = `rgba(${accentRgb}, ${alpha})`;

          bgCtx.fillText(char, worldX + charSize / 2, worldY + charSize / 2);
        }
      }
    }
  }



  function spawnNodes() {
    uplinkNodes.length = 0;
    const numRows = Math.ceil(height / gridSize);
    const numCols = Math.ceil(width / gridSize);

    let attempts = 0;
    while (uplinkNodes.length < 6 && attempts < 200) {
      attempts++;
      const c = Math.floor(Math.random() * numCols);
      const r = Math.floor(Math.random() * numRows);
      const ix = (c + 1) * gridSize - roadW / 2;
      const iy = (r + 1) * gridSize - roadW / 2;

      // Keep nodes strictly outside the wider elliptical tunnel area
      const dx = Math.abs(ix - width / 2);
      const dy = Math.abs(iy - height / 2);
      const inTunnel = (dx * dx) / Math.pow(width * MASK_RADIUS_PERCENT + 50, 2) + (dy * dy) / Math.pow(width * MASK_RADIUS_PERCENT * MASK_Y_SCALE + 50, 2) <= 1;
      if (inTunnel) continue;

      if (!isPointBlocked(ix, iy)) {
        const exists = uplinkNodes.find(n => n.x === ix && n.y === iy);
        if (!exists) {
          uplinkNodes.push({ x: ix, y: iy, pulse: Math.random() * Math.PI * 2 });
        }
      }
    }

    if (typeof packets !== 'undefined') {
      packets.forEach(p => p.assignTarget());
    }
  }

  setInterval(() => {
    if (width && height) spawnNodes();
  }, 3000);

  class DataPacket {
    constructor() {
      this.reset(true);
    }

    assignTarget() {
      if (uplinkNodes.length > 0) {
        this.targetNode = uplinkNodes[Math.floor(Math.random() * uplinkNodes.length)];
      } else {
        this.targetNode = null;
      }
    }

    reset(initial = false) {
      this.length = Math.random() * 60 + 30;
      this.speed = Math.random() * 2 + 2.5;

      const numCellsX = Math.ceil(width / gridSize) + 2;
      const numCellsY = Math.ceil(height / gridSize) + 2;

      let spawnGridX, spawnGridY;

      if (initial) {
        spawnGridX = Math.floor(Math.random() * numCellsX);
        spawnGridY = Math.floor(Math.random() * numCellsY);
      } else {
        const edge = Math.floor(Math.random() * 4);
        if (edge === 0) {
          spawnGridX = Math.floor(Math.random() * numCellsX);
          spawnGridY = -2;
        } else if (edge === 1) {
          spawnGridX = Math.floor(Math.random() * numCellsX);
          spawnGridY = numCellsY + 1;
        } else if (edge === 2) {
          spawnGridX = -2;
          spawnGridY = Math.floor(Math.random() * numCellsY);
        } else {
          spawnGridX = numCellsX + 1;
          spawnGridY = Math.floor(Math.random() * numCellsY);
        }
      }

      this.x = (spawnGridX + 1) * gridSize - roadW / 2;
      this.y = (spawnGridY + 1) * gridSize - roadW / 2;

      // Force an intersection evaluation instantly on spawn so it never enters a building
      const options = [];
      const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
      for (const d of dirs) {
        if (!this.isBlocked(this.x, this.y, d.dx, d.dy)) {
          options.push(d);
        }
      }

      if (options.length > 0) {
        const choice = options[Math.floor(Math.random() * options.length)];
        this.dirX = choice.dx;
        this.dirY = choice.dy;
      } else {
        this.dirX = 1;
        this.dirY = 0;
      }

      // Seed history with an infinite tail segment so the packet can draw fully immediately
      this.history = [{ x: this.x - this.dirX * 1000, y: this.y - this.dirY * 1000 }];
      this.assignTarget();
    }

    isBlocked(ix, iy, dx, dy) {
      // Test a point half a grid unit forward to see if it lands inside a building
      const px = ix + dx * gridSize / 2;
      const py = iy + dy * gridSize / 2;

      const gx = Math.floor(px / gridSize);
      const gy = Math.floor(py / gridSize);
      const b = getBuilding(gx, gy);

      if (b && px >= b.startX && px < b.endX && py >= b.startY && py < b.endY) return true;
      return false;
    }

    update() {
      const nextX = this.x + this.dirX * this.speed;
      const nextY = this.y + this.dirY * this.speed;

      let ix = null, iy = null;
      const gridOffset = roadW / 2;
      const tX = this.x + gridOffset;
      const tNextX = nextX + gridOffset;
      const tY = this.y + gridOffset;
      const tNextY = nextY + gridOffset;

      // Mathematically determine if we crossed a road intersection exactly in this frame
      if (this.dirX > 0) {
        const cross = Math.floor(tNextX / gridSize) * gridSize;
        if (tX < cross && tNextX >= cross) { ix = cross - gridOffset; iy = this.y; }
      } else if (this.dirX < 0) {
        const cross = Math.ceil(tNextX / gridSize) * gridSize;
        if (tX > cross && tNextX <= cross) { ix = cross - gridOffset; iy = this.y; }
      } else if (this.dirY > 0) {
        const cross = Math.floor(tNextY / gridSize) * gridSize;
        if (tY < cross && tNextY >= cross) { iy = cross - gridOffset; ix = this.x; }
      } else if (this.dirY < 0) {
        const cross = Math.ceil(tNextY / gridSize) * gridSize;
        if (tY > cross && tNextY <= cross) { iy = cross - gridOffset; ix = this.x; }
      }

      if (ix !== null && iy !== null) {
        // Check if we reached the target uplink node
        if (this.targetNode && Math.abs(ix - this.targetNode.x) < 2 && Math.abs(iy - this.targetNode.y) < 2) {
          bursts.push({ x: ix, y: iy, radius: 0, alpha: 1 });
          this.reset(false);
          return; // Stop processing this frame
        }

        // Snap to intersection
        this.x = ix;
        this.y = iy;

        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > 30) this.history.shift();

        // Determine valid turns to avoid crashing into buildings
        const options = [];
        const forward = { dx: this.dirX, dy: this.dirY };
        const left = { dx: this.dirY, dy: -this.dirX };
        const right = { dx: -this.dirY, dy: this.dirX };

        if (!this.isBlocked(ix, iy, forward.dx, forward.dy)) options.push(forward);
        if (!this.isBlocked(ix, iy, left.dx, left.dy)) options.push(left);
        if (!this.isBlocked(ix, iy, right.dx, right.dy)) options.push(right);

        if (options.length > 0) {
          if (this.targetNode) {
            // Sort options by distance to target
            options.sort((a, b) => {
              const distA = Math.abs((ix + a.dx * gridSize) - this.targetNode.x) + Math.abs((iy + a.dy * gridSize) - this.targetNode.y);
              const distB = Math.abs((ix + b.dx * gridSize) - this.targetNode.x) + Math.abs((iy + b.dy * gridSize) - this.targetNode.y);
              return distA - distB;
            });

            // 80% chance to take the shortest path, 20% to take a random valid path (organic feel)
            if (Math.random() > 0.2) {
              this.dirX = options[0].dx;
              this.dirY = options[0].dy;
            } else {
              const choice = options[Math.floor(Math.random() * options.length)];
              this.dirX = choice.dx;
              this.dirY = choice.dy;
            }
          } else {
            const choice = options[Math.floor(Math.random() * options.length)];
            this.dirX = choice.dx;
            this.dirY = choice.dy;
          }
        } else {
          // Dead end! U-Turn!
          this.dirX = -this.dirX;
          this.dirY = -this.dirY;
        }

        // Move 1px out of the intersection so we don't trigger it again immediately
        this.x += this.dirX;
        this.y += this.dirY;
      } else {
        this.x = nextX;
        this.y = nextY;
      }

      // Cleanup offscreen
      if (this.x < -800 || this.x > width + 800 || this.y < -800 || this.y > height + 800) {
        this.reset(false);
      }
    }

    draw(ctx, accentRgb) {
      const theme = document.documentElement.getAttribute('data-theme');
      const isDark = theme !== 'light';

      // Calculate fade based on distance to the center (elliptical mask)
      const headDx = Math.abs(this.x - width / 2);
      const headDy = Math.abs(this.y - height / 2) / MASK_Y_SCALE;
      const headDist = Math.sqrt(headDx * headDx + headDy * headDy);
      const maskRadius = width * MASK_RADIUS_PERCENT;

      let headFade = 1;
      if (headDist < maskRadius) {
        headFade = Math.pow(headDist / maskRadius, 4);
      }

      if (headFade > 0.02) {
        ctx.fillStyle = `rgba(255, 255, 255, ${headFade})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${accentRgb}, ${headFade})`;

        ctx.beginPath();
        const headSize = 2;
        if (this.dirX !== 0) {
          ctx.moveTo(this.x + this.dirX * headSize * 2, this.y);
          ctx.lineTo(this.x, this.y + headSize);
          ctx.lineTo(this.x - this.dirX * headSize * 2, this.y);
          ctx.lineTo(this.x, this.y - headSize);
        } else {
          ctx.moveTo(this.x, this.y + this.dirY * headSize * 2);
          ctx.lineTo(this.x + headSize, this.y);
          ctx.lineTo(this.x, this.y - this.dirY * headSize * 2);
          ctx.lineTo(this.x - headSize, this.y);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      const numChars = Math.floor(this.length / charSize);
      if (numChars <= 0) return;

      // Construct the multi-segment bending tail path
      const path = [{ x: this.x, y: this.y }];
      for (let i = this.history.length - 1; i >= 0; i--) {
        path.push(this.history[i]);
      }

      ctx.font = `bold ${charSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let charDrawn = 0;
      let currentSegment = 0;

      // Trace backward along the path to draw characters perfectly wrapping around corners
      while (charDrawn < numChars && currentSegment < path.length - 1) {
        const p1 = path[currentSegment];
        const p2 = path[currentSegment + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const segDist = Math.sqrt(dx * dx + dy * dy);
        if (segDist === 0) {
          currentSegment++;
          continue;
        }

        const ux = dx / segDist;
        const uy = dy / segDist;

        let cursor = (currentSegment === 0) ? charSize : 0;

        while (cursor <= segDist && charDrawn < numChars) {
          const px = p1.x + ux * cursor;
          const py = p1.y + uy * cursor;

          const pdx = Math.abs(px - width / 2);
          const pdy = Math.abs(py - height / 2) / MASK_Y_SCALE;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

          let tunnelFade = 1;
          if (pDist < maskRadius) {
            tunnelFade = Math.pow(pDist / maskRadius, 4);
          }

          const alpha = Math.pow(1 - (charDrawn / numChars), 1.5) * tunnelFade;

          if (alpha > 0.02) {
            // Render raw chaotic matrix characters
            ctx.fillStyle = `rgba(${accentRgb}, ${alpha})`;
            if (Math.random() > 0.15) {
              const char = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(char, px, py);
            }
          }

          cursor += charSize;
          charDrawn++;
        }

        currentSegment++;
      }
    }
  }

  for (let i = 0; i < 200; i++) {
    packets.push(new DataPacket());
  }

  function animate(time) {
    ctx.drawImage(bgCanvas, 0, 0);

    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme !== 'light';
    const computed = getComputedStyle(document.documentElement);
    const accentHex = computed.getPropertyValue('--accent').trim();
    const accentRgb = hexToRgb(accentHex);
    const bgHex = computed.getPropertyValue('--bg-primary').trim();
    const bgRgb = hexToRgb(bgHex);

    // Apply a wider elliptical gradient mask BEFORE drawing packets
    // This perfectly clears the center background but allows the clean tunnel lasers to draw on top
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(1, MASK_Y_SCALE); // Wider ellipse
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, width * MASK_RADIUS_PERCENT);
    gradient.addColorStop(0, `rgba(${bgRgb}, 0.98)`);
    gradient.addColorStop(0.5, `rgba(${bgRgb}, 0.85)`);
    gradient.addColorStop(1, `rgba(${bgRgb}, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(-width, -height * 2, width * 2, height * 4);
    ctx.restore();

    // Draw Uplink Nodes
    uplinkNodes.forEach(node => {
      node.pulse += 0.05;
      const radius = 8 + Math.sin(node.pulse) * 4;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRgb}, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgb(${accentRgb})`;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Expanding rings
      const ringRad = (node.pulse * 15) % 40;
      const ringAlpha = 1 - (ringRad / 40);
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringRad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${accentRgb}, ${ringAlpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    packets.forEach(packet => {
      packet.update();
      packet.draw(ctx, accentRgb);
    });

    // Draw Data Bursts
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.radius += 5;
      b.alpha -= 0.05;

      if (b.alpha <= 0) {
        bursts.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${accentRgb}, ${b.alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.font = `bold ${charSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let j = 0; j < 6; j++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * b.radius;
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], b.x + Math.cos(angle) * r, b.y + Math.sin(angle) * r);
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
