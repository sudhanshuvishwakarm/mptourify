

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Globe } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function HomeHero() {
  const router = useRouter();
  const videoRef = useRef(null);

  const colors = {
    green: '#117307',
    lightGreen: '#f5fbf2',
    saffron: '#FF9933',
    white: '#FFFFFF',
    blue: '#000080'
  };

  const handleExplore = () => {
    router.push('/districts');
  };

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        console.log('Autoplay prevented');
      });
    }
  }, []);

  // 24 Ashoka Chakra spokes (15° apart)
  const spokes = Array.from({ length: 24 });

  return (
    <div className="w-full h-[90vh] relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        >
          <source src="/images/herovideo.mp4" type="video/mp4" />
          {/* Fallback image if video doesn't load */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
            }}
          />
        </video>
        
        {/* Video Overlay for better text readability */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 h-full flex items-center justify-center px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto text-center w-full">
          
          {/* Top Badge */}
         <div data-aos="fade-up" data-aos-delay="200" className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 backdrop-blur-md" style={{ 
  borderColor: colors.white,
  backgroundColor: `${colors.green}20`
}}>
  {/* <span style={{ color: colors.green }}>🌴</span> */}
  <span className="text-sm font-bold" style={{ color: colors.white }}>
       Dedicated to MP Tourism Department
  </span>
</div>

          {/* Main Title with Multi-colored Text */}
          <h1 data-aos="fade-up" data-aos-delay="300" className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight drop-shadow-2xl flex items-center justify-center">
            <span style={{ color: colors.saffron,  }}>MP</span>
            <span style={{ color: colors.white }}> T</span>
            
            {/* Ashok Chakra */}
            <div className="relative flex items-center justify-center w-16 h-16 mx-2">
              {/* Outer ring */}
              <div className="absolute w-12 h-12 border-2 border-[#000080] rounded-full"></div>
              
              {/* 24 Spokes */}
              {spokes.map((_, i) => (
                <div
                  key={i}
                  className="absolute w-[1.5px] h-12 bg-[#000080]"
                  style={{ transform: `rotate(${i * 15}deg)` }}
                />
              ))}
            </div>
            
            {/* <span style={{ color: colors.white }}>UR</span>
            <span style={{ color: colors.green }}>IFY</span> */}<span
  style={{
    color: colors.white,
    WebkitTextStroke: "2px white",
  }}
>
  UR
</span>

<span
  style={{
    color: colors.green,
    WebkitTextStroke: "2px white",
  }}
>
  IFY
</span>

          </h1>

          {/* Subtitle */}
          <p data-aos="fade-up" data-aos-delay="400" className="text-xl md:text-2xl mb-6 leading-relaxed max-w-4xl mx-auto font-semibold drop-shadow-2xl" style={{ color: colors.lightGreen }}>
            Discover Every <span className="font-bold" style={{ color: colors.saffron }}>Gram</span> of Madhya Pradesh
          </p>

          {/* Description */}
          <p data-aos="fade-up" data-aos-delay="500" className="text-base md:text-lg mb-8 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-2xl" style={{ color: colors.lightGreen }}>
            Experience the digital transformation of Madhya Pradesh tourism. Explore every district, village, and heritage site through an immersive journey.
          </p>

          {/* CTA Buttons */}
          <div data-aos="fade-up" data-aos-delay="600" className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
             <button
              onClick={handleExplore}
              className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg border-2 border-white backdrop-blur-md"
              style={{ 
                backgroundColor: colors.green,
                boxShadow: `0 8px 32px ${colors.green}80`,
                borderColor: colors.white
              }}
            >
              Explore Our State
              <ArrowRight size={24} />
            </button>
            <button
              className="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg backdrop-blur-md border-2"
              style={{ 
                color: colors.lightGreen,
                borderColor: colors.lightGreen,
                backgroundColor: 'rgba(245, 251, 242, 0.1)',
                boxShadow: `0 8px 32px rgba(245, 251, 242, 0.2)`
              }}
            >
              Learn More
              <Globe size={24} />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-bold drop-shadow-lg" style={{ color: colors.lightGreen }}>Scroll to explore</p>
            <svg 
              className="w-5 h-5 drop-shadow-lg" 
              style={{ color: colors.lightGreen }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}// 'use client';

// import { useRouter } from 'next/navigation';
// import { ArrowRight, Globe } from 'lucide-react';
// import { useRef, useEffect } from 'react';

// export default function HomeHero() {
//   const router = useRouter();
//   const videoRef = useRef(null);

//   const colors = {
//     green: '#117307',
//     lightGreen: '#f5fbf2',
//     saffron: '#FF9933',
//     white: '#FFFFFF',
//     blue: '#000080'
//   };

//   const handleExplore = () => {
//     router.push('/districts');
//   };

//   useEffect(() => {
//     // Auto-play video when component mounts
//     if (videoRef.current) {
//       videoRef.current.play().catch(() => {
//         console.log('Autoplay prevented');
//       });
//     }
//   }, []);

//   // 24 Ashoka Chakra spokes (15° apart)
//   const spokes = Array.from({ length: 24 });

//   return (
//     <div className="w-full h-[90vh] relative overflow-hidden">
//       {/* Background Video */}
//       <div className="absolute inset-0 w-full h-full">
//         <video
//           ref={videoRef}
//           autoPlay
//           muted
//           loop
//           playsInline
//           className="w-full h-full object-cover"
//           poster="https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
//         >
//           <source src="/images/herovideo.mp4" type="video/mp4" />
//           {/* Fallback image if video doesn't load */}
//           <div 
//             className="absolute inset-0 bg-cover bg-center"
//             style={{
//               backgroundImage: 'url(https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
//             }}
//           />
//         </video>
        
//         {/* Video Overlay for better text readability */}
//         <div 
//           className="absolute inset-0"
//           style={{
//             backgroundColor: 'rgba(0, 0, 0, 0.4)'
//           }}
//         />
//       </div>

//       {/* Hero Content */}
//       <div className="relative z-20 h-full flex items-center justify-center px-4 md:px-8 py-8">
//         <div className="max-w-6xl mx-auto text-center w-full">
          
//           {/* Top Badge */}
//           <div className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 backdrop-blur-md bg-white/10" style={{ 
//             borderColor: colors.white,
//           }}>
//             <span style={{ color: colors.white }}>🏛️</span>
//             <span className="text-sm font-bold" style={{ color: colors.white }}>
//               Dedicated to MP Tourism Department
//             </span>
//           </div>

//           {/* Main Title with Multi-colored Text */}
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight drop-shadow-2xl flex items-center justify-center">
//             <span style={{ color: colors.saffron }}>MP T</span>
            
//             {/* Ashok Chakra */}
//             <div className="relative flex items-center justify-center w-16 h-16 mx-2">
//               {/* Outer ring */}
//               <div className="absolute w-12 h-12 border-2 border-[#000080] rounded-full"></div>
              
//               {/* 24 Spokes */}
//               {spokes.map((_, i) => (
//                 <div
//                   key={i}
//                   className="absolute w-[1.5px] h-12 bg-[#000080]"
//                   style={{ transform: `rotate(${i * 15}deg)` }}
//                 />
//               ))}
//             </div>
            
//             <span style={{ color: colors.saffron }}>URIFY</span>
//           </h1>

//           {/* Subtitle */}
//           <p className="text-xl md:text-2xl mb-6 leading-relaxed max-w-4xl mx-auto font-semibold drop-shadow-2xl" style={{ color: colors.lightGreen }}>
//             Discover Every <span className="font-bold" style={{ color: colors.saffron }}>Gram</span> of Madhya Pradesh
//           </p>

//           {/* Description */}
//           <p className="text-base md:text-lg mb-8 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-2xl" style={{ color: colors.lightGreen }}>
//             Experience the digital transformation of Madhya Pradesh tourism. Explore every district, village, and heritage site through an immersive journey.
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
//             <button
//               onClick={handleExplore}
//               className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg backdrop-blur-md"
//               style={{ 
//                 backgroundColor: colors.green,
//                 boxShadow: `0 8px 32px ${colors.green}80`
//               }}
//             >
//               Explore Our State
//               <ArrowRight size={24} />
//             </button>
//             <button
//               className="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg backdrop-blur-md border-2"
//               style={{ 
//                 color: colors.lightGreen,
//                 borderColor: colors.lightGreen,
//                 backgroundColor: 'rgba(245, 251, 242, 0.1)',
//                 boxShadow: `0 8px 32px rgba(245, 251, 242, 0.2)`
//               }}
//             >
//               Learn More
//               <Globe size={24} />
//             </button>
//           </div>
//         </div>

//         {/* Scroll Indicator */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
//           <div className="flex flex-col items-center gap-1">
//             <p className="text-xs font-bold drop-shadow-lg" style={{ color: colors.lightGreen }}>Scroll to explore</p>
//             <svg 
//               className="w-5 h-5 drop-shadow-lg" 
//               style={{ color: colors.lightGreen }} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useRouter } from 'next/navigation';
// import { ArrowRight, Globe, Play, Pause, Volume2, VolumeX } from 'lucide-react';
// import { useState, useRef, useEffect } from 'react';

// export default function HomeHero() {
//   const router = useRouter();
//   const videoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(true);

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#138808',
//     darkGray: '#333333',
//     lightGray: '#F5F5F5'
//   };

//   const handleExplore = () => {
//     router.push('/districts');
//   };

//   const togglePlay = () => {
//     if (videoRef.current) {
//       if (isPlaying) {
//         videoRef.current.pause();
//       } else {
//         videoRef.current.play();
//       }
//       setIsPlaying(!isPlaying);
//     }
//   };

//   const toggleMute = () => {
//     if (videoRef.current) {
//       videoRef.current.muted = !isMuted;
//       setIsMuted(!isMuted);
//     }
//   };

//   useEffect(() => {
//     // Auto-play video when component mounts
//     if (videoRef.current) {
//       videoRef.current.play().catch(() => {
//         // Handle autoplay restrictions
//         setIsPlaying(false);
//       });
//     }
//   }, []);

//   return (
//     <div className="w-full h-[90vh] relative overflow-hidden">
//       {/* Background Video */}
//       <div className="absolute inset-0 w-full h-full">
//         <video
//           ref={videoRef}
//           autoPlay
//           muted={isMuted}
//           loop
//           playsInline
//           className="w-full h-full object-cover"
//           poster="https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
//         >
//           <source src="/images/herovideo.mp4" type="video/mp4" />
//           {/* Fallback image if video doesn't load */}
//           <div 
//             className="absolute inset-0 bg-cover bg-center"
//             style={{
//               backgroundImage: 'url(https://images.unsplash.com/photo-1598890777037-a5cce3fad2a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)'
//             }}
//           />
//         </video>
        
//         {/* Video Overlay for better text readability */}
//         <div 
//           className="absolute inset-0"
//           style={{
//             background: `linear-gradient(135deg, ${colors.saffron}25 0%, ${colors.green}25 100%)`,
//             backgroundColor: 'rgba(0, 0, 0, 0.3)'
//           }}
//         />
        
//         {/* Additional gradient overlay for text contrast */}
//         <div 
//           className="absolute inset-0"
//           style={{
//             background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)'
//           }}
//         />
//       </div>

//       {/* Video Controls */}
//       <div className="absolute top-6 right-6 z-30 flex gap-3">
//         <button
//           onClick={toggleMute}
//           className="p-3 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
//           style={{ color: colors.white }}
//         >
//           {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
//         </button>
//         <button
//           onClick={togglePlay}
//           className="p-3 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/30 transition-all duration-300 hover:scale-110"
//           style={{ color: colors.white }}
//         >
//           {isPlaying ? <Pause size={20} /> : <Play size={20} />}
//         </button>
//       </div>

//       {/* Pattern Overlay */}
//       <div className="absolute inset-0 opacity-10" style={{
//         backgroundImage: `linear-gradient(45deg, ${colors.saffron} 1px, transparent 1px)`,
//         backgroundSize: '40px 40px'
//       }} />

//       {/* Hero Content - Compact Layout */}
//       <div className="relative z-20 h-full flex items-center justify-center px-4 md:px-8 py-8">
//         <div className="max-w-6xl mx-auto text-center w-full">
          
//           {/* Top Badge - Reduced margin */}
//           <div className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 backdrop-blur-md bg-white/10" style={{ 
//             borderColor: colors.white,
//           }}>
//             <span style={{ color: colors.white }}>🏛️</span>
//             <span className="text-sm font-bold" style={{ color: colors.white }}>
//               Dedicated to MP Tourism Department
//             </span>
//           </div>

//           {/* Main Title - Reduced margins */}
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 leading-tight drop-shadow-2xl">
//             <span 
//               className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-orange-400"
//               style={{ 
//                 backgroundImage: `linear-gradient(135deg, ${colors.saffron} 0%, #FFD700 100%)`
//               }}
//             >
//               MP
//             </span>
//             <span 
//               className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500"
//               style={{ 
//                 backgroundImage: `linear-gradient(135deg, ${colors.green} 0%, #22C55E 100%)`
//               }}
//             >
//               {' TOURIFY'}
//             </span>
//           </h1>

//           {/* Subtitle - Reduced margin */}
//           <p className="text-xl md:text-2xl mb-6 leading-relaxed max-w-4xl mx-auto font-semibold drop-shadow-2xl" style={{ color: colors.white }}>
//             Discover Every <span className="font-bold" style={{ color: colors.saffron }}>Gram</span> of Madhya Pradesh
//           </p>

//           {/* Description - Reduced margin and text size */}
//           <p className="text-base md:text-lg mb-8 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-2xl" style={{ color: colors.white }}>
//             Experience the digital transformation of Madhya Pradesh tourism. Explore every district, village, and heritage site through an immersive journey.
//           </p>

//           {/* CTA Buttons - Reduced margin */}
//           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
//             <button
//               onClick={handleExplore}
//               className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg backdrop-blur-md"
//               style={{ 
//                 backgroundColor: colors.saffron,
//                 boxShadow: `0 8px 32px ${colors.saffron}40`
//               }}
//             >
//               Explore Our State
//               <ArrowRight size={24} />
//             </button>
//             <button
//               className="px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg backdrop-blur-md border-2"
//               style={{ 
//                 color: colors.white,
//                 borderColor: colors.white,
//                 backgroundColor: 'rgba(255, 255, 255, 0.1)',
//                 boxShadow: `0 8px 32px rgba(255, 255, 255, 0.1)`
//               }}
//             >
//               Learn More
//               <Globe size={24} />
//             </button>
//           </div>

//           {/* Stats Grid - Compact version */}
//           {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
//             {[
//               { number: '52', label: 'Districts' },
//               { number: '23K+', label: 'Panchayats' },
//               { number: '100+', label: 'Heritage Sites' },
//               { number: '∞', label: 'Stories' }
//             ].map((stat, idx) => (
//               <div 
//                 key={idx} 
//                 className="p-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
//                 style={{ color: colors.white }}
//               >
//                 <p className="text-xl md:text-2xl font-black mb-1 drop-shadow-lg">
//                   {stat.number}
//                 </p>
//                 <p className="text-xs font-bold opacity-90">
//                   {stat.label}
//                 </p>
//               </div>
//             ))}
//           </div> */}
//         </div>

//         {/* Scroll Indicator - Positioned properly */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
//           <div className="flex flex-col items-center gap-1">
//             <p className="text-xs font-bold drop-shadow-lg" style={{ color: colors.white }}>Scroll to explore</p>
//             <svg 
//               className="w-5 h-5 drop-shadow-lg" 
//               style={{ color: colors.white }} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//             </svg>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }