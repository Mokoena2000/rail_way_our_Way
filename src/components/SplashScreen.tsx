import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<'enter' | 'reveal' | 'exit' | 'done'>('enter');

  useEffect(() => {
    // Train enters and stops at center
    const revealTimer = setTimeout(() => setStage('reveal'), 1000);
    
    // Train exits after text reveals
    const exitTimer = setTimeout(() => setStage('exit'), 2000);
    
    // Complete splash
    const completeTimer = setTimeout(() => {
      setStage('done');
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
        stage === 'exit' ? 'animate-fade-out' : ''
      }`}
      style={{ backgroundColor: '#F4F1DE' }}
    >
      {/* Train Track */}
      <div className="relative w-full max-w-md px-8 h-32">
        {/* Track base */}
        <div 
          className="absolute top-1/2 left-4 right-4 h-2 rounded-full"
          style={{ backgroundColor: '#3D405B' }}
        />
        
        {/* Track ties */}
        <div className="absolute top-1/2 left-8 right-8 flex justify-between -mt-1">
          {[...Array(16)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 h-5 rounded-sm"
              style={{ backgroundColor: '#3D405B', opacity: 0.5 }}
            />
          ))}
        </div>

        {/* Train SVG */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
            stage === 'enter' ? 'animate-train-enter' : 
            stage === 'exit' ? 'animate-train-exit' : ''
          }`}
        >
          <svg 
            width="100" 
            height="60" 
            viewBox="0 0 100 60" 
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Train body */}
            <rect x="10" y="10" width="80" height="35" rx="8" fill="#E07A5F" />
            
            {/* Windows */}
            <rect x="20" y="18" width="15" height="12" rx="2" fill="#F4F1DE" />
            <rect x="42" y="18" width="15" height="12" rx="2" fill="#F4F1DE" />
            <rect x="64" y="18" width="15" height="12" rx="2" fill="#F4F1DE" />
            
            {/* Front accent */}
            <rect x="85" y="15" width="5" height="25" rx="2" fill="#3D405B" />
            
            {/* Wheels */}
            <circle cx="30" cy="48" r="7" fill="#3D405B" />
            <circle cx="30" cy="48" r="3" fill="#F4F1DE" />
            <circle cx="70" cy="48" r="7" fill="#3D405B" />
            <circle cx="70" cy="48" r="3" fill="#F4F1DE" />
            
            {/* Roof detail */}
            <rect x="30" y="5" width="40" height="8" rx="4" fill="#C96A51" />
          </svg>
        </div>
      </div>

      {/* Text reveal */}
      <div className={`mt-8 text-center ${stage === 'reveal' || stage === 'exit' ? 'animate-text-reveal' : 'opacity-0'}`}>
        <h1 
          className="text-4xl font-extrabold mb-2"
          style={{ color: '#3D405B' }}
        >
          Railway Our Way
        </h1>
        <p 
          className="text-lg font-medium"
          style={{ color: '#81B29A' }}
        >
          Your Community. Your Commute.
        </p>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-12 flex gap-3">
        {[0, 1, 2].map(i => (
          <div 
            key={i}
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ 
              backgroundColor: '#E07A5F',
              animationDelay: `${i * 200}ms` 
            }}
          />
        ))}
      </div>
    </div>
  );
}