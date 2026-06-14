import { useEffect, useState } from 'react';

export default function Confetti() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    const newParticles = [];
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 5,
        velocityY: Math.random() * 3 + 2,
        size: Math.random() * 8 + 4
      });
    }
    setParticles(newParticles);

    const animate = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.velocityX,
            y: p.y + p.velocityY
          }))
          .filter(p => p.y < window.innerHeight)
      );
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(animate);
      setParticles([]);
    }, 5000);

    return () => {
      clearInterval(animate);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: 'rotate(45deg)',
            transition: 'all 0.05s linear'
          }}
        />
      ))}
    </div>
  );
}