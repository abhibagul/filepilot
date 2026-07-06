document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hero');
  if (!container) return;
  
  // Make sure container can hold absolute canvas
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  
  const canvas = document.createElement('canvas');
  canvas.id = 'hyperspeed-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0'; // Behind hero content, but in front of background
  
  // Ensure hero content is above canvas
  const heroContent = container.querySelector('.container');
  if (heroContent) heroContent.style.position = 'relative';
  if (heroContent) heroContent.style.zIndex = '1';

  container.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height, cx, cy;
  let stars = [];
  const numStars = 600;
  const speed = 20;

  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    cx = width / 2;
    cy = height / 2;
  }
  
  window.addEventListener('resize', resize);
  resize();

  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = (Math.random() - 0.5) * width * 2;
      this.y = (Math.random() - 0.5) * height * 2;
      this.z = Math.random() * width;
      this.pz = this.z;
    }
    update() {
      this.z -= speed;
      if (this.z < 1) {
        this.reset();
        this.z = width;
        this.pz = this.z;
      }
    }
    draw(accentColor) {
      const sx = (this.x / this.z) * cx + cx;
      const sy = (this.y / this.z) * cy + cy;
      const px = (this.x / this.pz) * cx + cx;
      const py = (this.y / this.pz) * cy + cy;

      this.pz = this.z;

      // Don't draw if it's jumping from back to front
      if (Math.abs(sx - px) > width / 2) return;

      const size = Math.max(0.1, (1 - this.z / width) * 3);
      const alpha = 1 - (this.z / width);

      // Canvas Blackout Mask for Hero Text Readability
      const dx = Math.abs((sx + px)/2 - cx);
      const dy = Math.abs((sy + py)/2 - cy) / 0.5; // Flatten ellipse
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maskRadius = width * 0.25;
      
      let maskFade = 1;
      if (dist < maskRadius) {
        maskFade = Math.pow(dist / maskRadius, 4);
      }
      
      const finalAlpha = alpha * maskFade;
      if (finalAlpha < 0.02) return;

      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      
      ctx.globalAlpha = finalAlpha;
      ctx.lineWidth = size;
      ctx.strokeStyle = accentColor;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }

  function animate() {
    // Semi-transparent clear to create motion blur trails
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme !== 'light';
    
    // Fill with background color but slightly transparent for trails
    ctx.fillStyle = isDark ? 'rgba(13, 18, 22, 0.4)' : 'rgba(249, 251, 251, 0.4)';
    ctx.fillRect(0, 0, width, height);

    const computed = getComputedStyle(document.documentElement);
    const accentColor = computed.getPropertyValue('--accent').trim();

    stars.forEach(star => {
      star.update();
      star.draw(accentColor);
    });

    requestAnimationFrame(animate);
  }

  animate();
});
