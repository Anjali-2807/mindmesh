import React, { useEffect, useRef } from 'react';

export default function NeuralNetwork3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 4000);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * 500 - 250,
          baseZ: Math.random() * 500 - 250,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vz: (Math.random() - 0.5) * 0.3,
          size: 2 + Math.random() * 2
        });
      }
    };

    const project3D = (x, y, z) => {
      const perspective = 400;
      const centerZ = 0;
      const scale = perspective / (perspective + z - centerZ);
      
      return {
        x: (x - canvas.width / 2) * scale + canvas.width / 2,
        y: (y - canvas.height / 2) * scale + canvas.height / 2,
        scale: scale,
        depth: z
      };
    };

    const animate = () => {
      time += 0.01;
      
      // Clear canvas completely (no trail effect)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Oscillate Z
        if (p.z < p.baseZ - 100 || p.z > p.baseZ + 100) p.vz *= -1;
        
        p.projected = project3D(p.x, p.y, p.z);
      });

      // Sort by depth for proper rendering
      particles.sort((a, b) => (a.projected?.depth || 0) - (b.projected?.depth || 0));

      // Draw connections
      particles.forEach((p1, i) => {
        if (!p1.projected) return;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          if (!p2.projected) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.7;
            const depthFade = Math.min(p1.projected.scale, p2.projected.scale);

            ctx.beginPath();
            ctx.moveTo(p1.projected.x, p1.projected.y);
            ctx.lineTo(p2.projected.x, p2.projected.y);

            const gradient = ctx.createLinearGradient(
              p1.projected.x, p1.projected.y,
              p2.projected.x, p2.projected.y
            );
            
            gradient.addColorStop(0, `rgba(129, 140, 248, ${opacity * depthFade})`);
            gradient.addColorStop(0.5, `rgba(167, 139, 250, ${opacity * depthFade})`);
            gradient.addColorStop(1, `rgba(129, 140, 248, ${opacity * depthFade})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2 * depthFade;
            ctx.stroke();
          }
        }
      });

      // Draw particles
      particles.forEach(p => {
        if (!p.projected) return;

        const { x, y, scale } = p.projected;
        const size = p.size * scale;

        // Particle glow
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = 0.6 * scale;
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        
        const coreGradient = ctx.createRadialGradient(
          x - size * 0.3, y - size * 0.3, 0,
          x, y, size
        );
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.4, '#818cf8');
        coreGradient.addColorStop(1, '#a78bfa');
        
        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = 0.9 * scale;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.7 }}
    />
  );
}

