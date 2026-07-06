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
  canvas.style.opacity = '0.7'; // Subtle background effect
  
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
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme !== 'light';
    
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
          ctx.fillStyle = isDark ? `rgba(0, 230, 96, ${cell.opacity})` : `rgba(0, 184, 87, ${cell.opacity})`;
          ctx.fillText(cell.char, x * fontSize + fontSize/2, y * fontSize + fontSize/2);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
});
