document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hero');
  if (!container) return;
  
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'letter-glitch-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  canvas.style.opacity = '0.5'; // Subtle background effect
  
  const heroContent = container.querySelector('.container');
  if (heroContent) heroContent.style.position = 'relative';
  if (heroContent) heroContent.style.zIndex = '1';

  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+{}|:<>?~';
  const fontSize = 16;
  let cols, rows;
  let grid = [];

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    cols = Math.floor(width / fontSize) + 1;
    rows = Math.floor(height / fontSize) + 1;
    
    grid = [];
    for (let x = 0; x < cols; x++) {
      grid[x] = [];
      for (let y = 0; y < rows; y++) {
        grid[x][y] = {
          char: chars[Math.floor(Math.random() * chars.length)],
          opacity: Math.random() * 0.15,
          targetOpacity: Math.random() * 0.15,
          speed: 0.01 + Math.random() * 0.05
        };
      }
    }
  }
  
  window.addEventListener('resize', resize);
  resize();

  function animate() {
    const computed = getComputedStyle(document.documentElement);
    const accentColor = computed.getPropertyValue('--accent').trim();
    
    ctx.clearRect(0, 0, width, height);
    ctx.font = `bold ${fontSize}px "Fira Code", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const cell = grid[x][y];
        
        // Glitch character randomly
        if (Math.random() < 0.05) {
          cell.char = chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Smooth opacity transition
        cell.opacity += (cell.targetOpacity - cell.opacity) * cell.speed;
        if (Math.abs(cell.targetOpacity - cell.opacity) < 0.05) {
          cell.targetOpacity = Math.random() * 0.9; // Higher max opacity
        }
        
        if (cell.opacity > 0.05) {
          const px = x * fontSize + fontSize/2;
          const py = y * fontSize + fontSize/2;
          
          // Canvas Blackout Mask for Hero Text Readability
          const dx = Math.abs(px - width / 2);
          const dy = Math.abs(py - height / 2) / 0.5; // Flatten ellipse
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maskRadius = width * 0.25;
          
          let maskFade = 1;
          if (dist < maskRadius) {
            maskFade = Math.pow(dist / maskRadius, 4);
          }
          
          const finalOpacity = cell.opacity * maskFade;
          
          if (finalOpacity > 0.02) {
            ctx.globalAlpha = finalOpacity;
            ctx.fillStyle = accentColor;
            ctx.fillText(cell.char, px, py);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
});
