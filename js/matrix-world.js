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
  const charSize = 5; // Extreme zoomed out view

  // Procedural City Grid
  const gridSize = 14 * charSize; // 70px
  const roadW = 4 * charSize;     // 20px

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    bgCanvas.width = width;
    bgCanvas.height = height;
    
    drawCityBackground();
  }

  window.addEventListener('resize', resize);
  resize();

  function getHash(x, y, seed = 0) {
    let val = Math.sin(x * 12.9898 + y * 78.233 + seed * 13.541) * 43758.5453;
    return val - Math.floor(val);
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

  function drawCityBackground() {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme !== 'light';

    bgCtx.fillStyle = isDark ? '#080c09' : '#f0f5f2';
    bgCtx.fillRect(0, 0, width, height);

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

          if (isDark) {
            bgCtx.fillStyle = isEdge ? `rgba(0, 255, 102, ${0.3 + baseHash * 0.5})` : `rgba(0, 150, 60, ${0.05 + baseHash * 0.15})`;
          } else {
            bgCtx.fillStyle = isEdge ? `rgba(0, 180, 50, ${0.4 + baseHash * 0.5})` : `rgba(0, 100, 30, ${0.1 + baseHash * 0.2})`;
          }

          bgCtx.fillText(char, worldX + charSize / 2, worldY + charSize / 2);
        }
      }
    }
  }

  class DataPacket {
    constructor() {
      this.reset(true);
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
      const dirs = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}];
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
      this.history = [{x: this.x - this.dirX * 1000, y: this.y - this.dirY * 1000}];
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
          // Snap to intersection
          this.x = ix;
          this.y = iy;
          
          this.history.push({x: this.x, y: this.y});
          if (this.history.length > 30) this.history.shift();
          
          // Determine valid turns to avoid crashing into buildings
          const options = [];
          const forward = {dx: this.dirX, dy: this.dirY};
          const left = {dx: this.dirY, dy: -this.dirX};
          const right = {dx: -this.dirY, dy: this.dirX};
          
          if (!this.isBlocked(ix, iy, forward.dx, forward.dy)) {
              // Weight forward heavily so packets don't just infinitely zigzag in a small loop
              options.push(forward, forward, forward, forward, forward); 
          }
          if (!this.isBlocked(ix, iy, left.dx, left.dy)) options.push(left);
          if (!this.isBlocked(ix, iy, right.dx, right.dy)) options.push(right);
          
          if (options.length > 0) {
              const choice = options[Math.floor(Math.random() * options.length)];
              this.dirX = choice.dx;
              this.dirY = choice.dy;
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

    draw(ctx) {
        const theme = document.documentElement.getAttribute('data-theme');
        const isDark = theme !== 'light';
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff66';
        
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
        
        const numChars = Math.floor(this.length / charSize);
        if (numChars <= 0) return;
        
        // Construct the multi-segment bending tail path
        const path = [{x: this.x, y: this.y}];
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
            const segDist = Math.sqrt(dx*dx + dy*dy);
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
                
                const alpha = Math.pow(1 - (charDrawn / numChars), 1.5);
                ctx.fillStyle = isDark ? `rgba(0, 255, 102, ${alpha})` : `rgba(0, 180, 50, ${alpha})`;
                
                if (Math.random() > 0.15) {
                    const char = chars[Math.floor(Math.random() * chars.length)];
                    ctx.fillText(char, px, py);
                }
                
                cursor += charSize;
                charDrawn++;
            }
            
            currentSegment++;
        }
    }
  }

  const packets = [];
  for (let i = 0; i < 120; i++) {
    packets.push(new DataPacket());
  }

  function animate(time) {
    ctx.drawImage(bgCanvas, 0, 0);

    packets.forEach(packet => {
      packet.update();
      packet.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
