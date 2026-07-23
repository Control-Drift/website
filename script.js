const canvas = document.getElementById('blackhole-canvas');
const ctx = canvas.getContext('2d');
let width, height, cx, cy;
let EVENT_HORIZON_RADIUS = 70;

function resize() {
  // Use clientWidth instead of innerWidth to exclude scrollbar width for perfect centering
  width = canvas.width = document.documentElement.clientWidth;
  height = canvas.height = window.innerHeight;
  
  // Center the black hole perfectly
  cx = width / 2;
  cy = height / 2;
  
  // Make the emblem slightly smaller on mobile
  EVENT_HORIZON_RADIUS = width < 768 ? 45 : 70;
}
window.addEventListener('resize', resize);
resize();

const particles = [];
// Increased particle count for a very pristine, dense accretion disk
const numParticles = 3000; 

for(let i = 0; i < numParticles; i++) {
  particles.push({
    angle: Math.random() * Math.PI * 2,
    radius: EVENT_HORIZON_RADIUS + 10 + Math.random() * (width > 800 ? 500 : 300), 
    speed: (Math.random() * 0.015 + 0.005),
    size: Math.random() * 1.5 + 0.5,
    // Synthwave colors: Mix of Cyan (190-210) and Purple/Pink (280-320)
    hue: Math.random() > 0.4 ? 290 + Math.random()*30 : 195 + Math.random()*20,
    brightness: Math.random() * 40 + 60 // 60-100% brightness
  });
}

function drawPristineBlackHole() {
  // 1. Draw the Photon Sphere glow (Soft intense glow around event horizon)
  const photonGlow = ctx.createRadialGradient(cx, cy, EVENT_HORIZON_RADIUS - 5, cx, cy, EVENT_HORIZON_RADIUS + 60);
  photonGlow.addColorStop(0, 'rgba(0, 0, 0, 1)');
  photonGlow.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)'); // Bright white inner ring
  photonGlow.addColorStop(0.5, 'rgba(157, 78, 221, 0.2)'); // Purple falloff
  photonGlow.addColorStop(1, 'rgba(0, 229, 255, 0)'); // Cyan fade
  
  ctx.beginPath();
  ctx.arc(cx, cy, EVENT_HORIZON_RADIUS + 60, 0, Math.PI * 2);
  ctx.fillStyle = photonGlow;
  ctx.fill();

  // 2. Draw Event Horizon (Pure Black, crisp)
  ctx.beginPath();
  ctx.arc(cx, cy, EVENT_HORIZON_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // 3. Draw a crisp inner edge to the event horizon
  ctx.beginPath();
  ctx.arc(cx, cy, EVENT_HORIZON_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function animate() {
  ctx.globalCompositeOperation = 'source-over';
  // Clear screen with deep dark color and slight opacity for motion blur trails
  ctx.fillStyle = 'rgba(3, 3, 8, 0.3)';
  ctx.fillRect(0, 0, width, height);

  ctx.globalCompositeOperation = 'lighter';
  
  // Update and draw particles (Accretion Disk)
  particles.forEach(p => {
    // Keplerian velocity approximation: closer particles orbit much faster
    const currentSpeed = p.speed * (250 / p.radius);
    p.angle += currentSpeed; 
    
    // Slight inward drift
    p.radius -= 0.15;
    
    // If particle falls into event horizon, reset it to outer edge
    if(p.radius < EVENT_HORIZON_RADIUS + 2) {
      p.radius = EVENT_HORIZON_RADIUS + 50 + Math.random() * (width > 800 ? 450 : 250);
      p.angle = Math.random() * Math.PI * 2;
    }

    // 3D Tilt Projection: Compress the Y axis to simulate a tilted disk
    const tilt = 0.35;
    const x = cx + Math.cos(p.angle) * p.radius;
    const y = cy + Math.sin(p.angle) * p.radius * tilt; 

    // Depth sorting logic (very basic): if y > cy, it's "in front", else "behind"
    // For a black hole, light bends, but for simplicity, we just draw them.
    // The event horizon will be drawn over the "behind" particles later if we layered it,
    // but drawing it after with source-over achieves a good enough look.

    // Calculate intensity based on distance to event horizon (hotter when closer)
    const distanceFactor = Math.max(0, 1 - (p.radius - EVENT_HORIZON_RADIUS) / 300);
    const alpha = distanceFactor * 0.7 + 0.1;
    const size = p.size * (distanceFactor * 1.5 + 0.5);

    ctx.beginPath();
    // Use ellipse for stretched particles simulating speed blur
    const stretch = 1 + currentSpeed * 20;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(p.angle + Math.PI/2);
    ctx.ellipse(0, 0, size, size * stretch, 0, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.brightness}%, ${alpha})`;
    ctx.fill();
    ctx.restore();
  });

  ctx.globalCompositeOperation = 'source-over';
  
  // Draw the actual Black Hole over the particles
  drawPristineBlackHole();

  requestAnimationFrame(animate);
}

// Start simulation
animate();

// Fade-in observer
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
});
