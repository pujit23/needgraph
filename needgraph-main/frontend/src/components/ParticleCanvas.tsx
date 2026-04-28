import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const c = ref.current; 
    if (!c) return;
    
    const ctx = c.getContext('2d'); 
    if (!ctx) return;
    
    let id: number;
    const ps: {x:number;y:number;vx:number;vy:number;r:number;a:number}[] = [];
    
    const resize = () => { 
      c.width = c.parentElement!.clientWidth; 
      c.height = c.parentElement!.clientHeight; 
    };
    resize();
    
    for (let i = 0; i < 55; i++) {
      ps.push({ 
        x: Math.random() * c.width, 
        y: Math.random() * c.height, 
        vx: (Math.random() - .5) * .35, 
        vy: (Math.random() - .5) * .35, 
        r: Math.random() * 1.8 + .5, 
        a: Math.random() * .4 + .1 
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) { 
          const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y); 
          if(d < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(108,99,255,${.07 * (1 - d / 140)})`;
            ctx.lineWidth = .5;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          } 
        }
      }
      for (const p of ps) { 
        p.x += p.vx;
        p.y += p.vy; 
        if (p.x < 0 || p.x > c.width) p.vx *= -1; 
        if (p.y < 0 || p.y > c.height) p.vy *= -1; 
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108,99,255,${p.a})`;
        ctx.fill(); 
      }
      id = requestAnimationFrame(draw);
    };
    
    draw();
    window.addEventListener('resize', resize);
    
    return () => { 
      cancelAnimationFrame(id); 
      window.removeEventListener('resize', resize); 
    };
  }, []);
  
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }} />;
}
