import HomeAbout from "@/components/home/HomeAbout";
import HomeHero from "@/components/home/HomeHero";
import HomeMpOverview from "@/components/home/HomeMpOverview";
import HomeNavigationTiles from "@/components/home/HomeNavigationTiles";

export default function HomePage() {
  // const h = useTranslations('HomePage');
  // const n = useTranslations('Navigation');
  return (
    <>
      <HomeHero/>
      <HomeAbout/>
      <HomeNavigationTiles/>
      <HomeMpOverview/>
    </>
  );
}



// 'use client';

// import { useState, useEffect } from 'react';
// import { MapPin, Search, X, ChevronRight, Home, Info } from 'lucide-react';

// export default function MPTourifyMap() {
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [mapLoaded, setMapLoaded] = useState(false);

//   const colors = {
//     saffron: '#FF9933',
//     white: '#FFFFFF',
//     green: '#138808',
//     navy: '#000080',
//     bgLight: '#FFF7EB',
//     darkGray: '#2C3E50',
//     lightGray: '#ECF0F1'
//   };

//   // MP Districts data with coordinates
//   const districts = [
//     { id: 1, name: 'Bhopal', slug: 'bhopal', lat: 23.2599, lng: 77.4126, population: '2.37M', heritage: 12 },
//     { id: 2, name: 'Indore', slug: 'indore', lat: 22.7196, lng: 75.8577, population: '3.3M', heritage: 15 },
//     { id: 3, name: 'Gwalior', slug: 'gwalior', lat: 26.2183, lng: 78.1828, population: '2.03M', heritage: 18 },
//     { id: 4, name: 'Jabalpur', slug: 'jabalpur', lat: 23.1815, lng: 79.9864, population: '2.46M', heritage: 14 },
//     { id: 5, name: 'Ujjain', slug: 'ujjain', lat: 23.1765, lng: 75.7885, population: '1.99M', heritage: 22 },
//     { id: 6, name: 'Sagar', slug: 'sagar', lat: 23.8388, lng: 78.7378, population: '2.38M', heritage: 10 },
//     { id: 7, name: 'Dewas', slug: 'dewas', lat: 22.9676, lng: 76.0534, population: '1.56M', heritage: 8 },
//     { id: 8, name: 'Satna', slug: 'satna', lat: 24.6005, lng: 80.8322, population: '2.23M', heritage: 11 },
//     { id: 9, name: 'Ratlam', slug: 'ratlam', lat: 23.3315, lng: 75.0367, population: '1.45M', heritage: 9 },
//     { id: 10, name: 'Rewa', slug: 'rewa', lat: 24.5364, lng: 81.2961, population: '2.36M', heritage: 13 },
//     { id: 11, name: 'Katni', slug: 'katni', lat: 23.8346, lng: 80.3978, population: '1.53M', heritage: 7 },
//     { id: 12, name: 'Singrauli', slug: 'singrauli', lat: 24.2005, lng: 82.6753, population: '1.18M', heritage: 6 }
//   ];

//   const filteredDistricts = districts.filter(d =>
//     d.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const handleDistrictClick = (district) => {
//     setSelectedDistrict(district);
//   };

//   const handleClose = () => {
//     setSelectedDistrict(null);
//   };

//   useEffect(() => {
//     setMapLoaded(true);
//   }, []);

//   return (
//     <div style={{ 
//       minHeight: '100vh', 
//       backgroundColor: colors.bgLight,
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//     }}>
//       {/* Header */}
//       <div style={{
//         background: `linear-gradient(135deg, ${colors.saffron} 0%, ${colors.green} 100%)`,
//         padding: '24px 16px',
//         color: colors.white,
//         boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
//       }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
//             <Home size={28} />
//             <div>
//               <h1 style={{ 
//                 fontSize: '32px', 
//                 fontWeight: '800', 
//                 margin: '0',
//                 textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
//               }}>
//                 Mera Pradesh Mera Jila
//               </h1>
//               <p style={{ margin: '4px 0 0 0', opacity: 0.95, fontSize: '14px' }}>
//                 Explore 52 Districts of Madhya Pradesh
//               </p>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div style={{ position: 'relative', maxWidth: '500px' }}>
//             <Search 
//               size={20} 
//               style={{ 
//                 position: 'absolute', 
//                 left: '16px', 
//                 top: '50%', 
//                 transform: 'translateY(-50%)',
//                 color: colors.darkGray,
//                 opacity: 0.5
//               }} 
//             />
//             <input
//               type="text"
//               placeholder="Search districts..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '14px 16px 14px 48px',
//                 borderRadius: '12px',
//                 border: 'none',
//                 fontSize: '16px',
//                 outline: 'none',
//                 backgroundColor: colors.white,
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//               }}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ 
//         maxWidth: '1400px', 
//         margin: '0 auto', 
//         padding: '32px 16px',
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//         gap: '24px'
//       }}>
//         {/* Map Placeholder */}
//         <div style={{
//           gridColumn: 'span 2',
//           backgroundColor: colors.white,
//           borderRadius: '16px',
//           padding: '32px',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//           minHeight: '600px',
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           <div style={{
//             position: 'absolute',
//             top: '24px',
//             left: '24px',
//             right: '24px',
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             zIndex: 10
//           }}>
//             <div style={{
//               backgroundColor: colors.white,
//               padding: '12px 20px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}>
//               <MapPin size={20} style={{ color: colors.saffron }} />
//               <span style={{ fontWeight: '600', color: colors.darkGray }}>
//                 Interactive Map
//               </span>
//             </div>
//             <div style={{
//               backgroundColor: colors.white,
//               padding: '8px 16px',
//               borderRadius: '12px',
//               boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//               fontSize: '14px',
//               color: colors.darkGray
//             }}>
//               Click on any district
//             </div>
//           </div>

//           {/* MP Map SVG Representation */}
//           <svg 
//             viewBox="0 0 800 600" 
//             style={{ 
//               width: '100%', 
//               height: '100%',
//               marginTop: '60px'
//             }}
//           >
//             {/* Background */}
//             <rect width="800" height="600" fill={colors.bgLight} />
            
//             {/* Simplified district representations */}
//             {districts.map((district, idx) => {
//               const x = (district.lng - 74) * 80;
//               const y = (27 - district.lat) * 80;
              
//               return (
//                 <g key={district.id}>
//                   <circle
//                     cx={x}
//                     cy={y}
//                     r="30"
//                     fill={selectedDistrict?.id === district.id ? colors.saffron : colors.green}
//                     opacity="0.7"
//                     style={{
//                       cursor: 'pointer',
//                       transition: 'all 0.3s ease',
//                       filter: selectedDistrict?.id === district.id ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none'
//                     }}
//                     onClick={() => handleDistrictClick(district)}
//                   />
//                   <text
//                     x={x}
//                     y={y + 5}
//                     textAnchor="middle"
//                     fill={colors.white}
//                     fontSize="12"
//                     fontWeight="600"
//                     style={{ 
//                       pointerEvents: 'none',
//                       userSelect: 'none'
//                     }}
//                   >
//                     {district.name}
//                   </text>
//                 </g>
//               );
//             })}
//           </svg>
//         </div>

//         {/* Districts List */}
//         <div style={{
//           backgroundColor: colors.white,
//           borderRadius: '16px',
//           padding: '24px',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
//           maxHeight: '600px',
//           overflowY: 'auto'
//         }}>
//           <h3 style={{
//             fontSize: '20px',
//             fontWeight: '700',
//             color: colors.darkGray,
//             marginBottom: '20px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px'
//           }}>
//             <div style={{
//               width: '4px',
//               height: '24px',
//               backgroundColor: colors.saffron,
//               borderRadius: '2px'
//             }} />
//             All Districts ({filteredDistricts.length})
//           </h3>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//             {filteredDistricts.map((district) => (
//               <div
//                 key={district.id}
//                 onClick={() => handleDistrictClick(district)}
//                 style={{
//                   padding: '16px',
//                   borderRadius: '12px',
//                   backgroundColor: selectedDistrict?.id === district.id ? `${colors.saffron}15` : colors.bgLight,
//                   border: `2px solid ${selectedDistrict?.id === district.id ? colors.saffron : 'transparent'}`,
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}
//               >
//                 <div>
//                   <div style={{ 
//                     fontWeight: '600', 
//                     color: colors.darkGray,
//                     marginBottom: '4px',
//                     fontSize: '16px'
//                   }}>
//                     {district.name}
//                   </div>
//                   <div style={{ 
//                     fontSize: '13px', 
//                     color: colors.darkGray,
//                     opacity: 0.7
//                   }}>
//                     {district.heritage} Heritage Sites
//                   </div>
//                 </div>
//                 <ChevronRight size={20} style={{ color: colors.saffron }} />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* District Detail Modal */}
//       {selectedDistrict && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0,0,0,0.6)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           zIndex: 1000,
//           padding: '20px'
//         }}>
//           <div style={{
//             backgroundColor: colors.white,
//             borderRadius: '20px',
//             maxWidth: '600px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflow: 'auto',
//             position: 'relative',
//             boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
//           }}>
//             {/* Header with gradient */}
//             <div style={{
//               background: `linear-gradient(135deg, ${colors.saffron} 0%, ${colors.green} 100%)`,
//               padding: '32px',
//               borderRadius: '20px 20px 0 0',
//               color: colors.white,
//               position: 'relative'
//             }}>
//               <button
//                 onClick={handleClose}
//                 style={{
//                   position: 'absolute',
//                   top: '16px',
//                   right: '16px',
//                   background: 'rgba(255,255,255,0.2)',
//                   border: 'none',
//                   borderRadius: '50%',
//                   width: '40px',
//                   height: '40px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease'
//                 }}
//               >
//                 <X size={24} color={colors.white} />
//               </button>

//               <h2 style={{ 
//                 fontSize: '32px', 
//                 fontWeight: '800', 
//                 margin: '0 0 8px 0',
//                 textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
//               }}>
//                 {selectedDistrict.name}
//               </h2>
//               <p style={{ margin: 0, opacity: 0.95 }}>
//                 District of Madhya Pradesh
//               </p>
//             </div>

//             {/* Content */}
//             <div style={{ padding: '32px' }}>
//               {/* Stats Grid */}
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(2, 1fr)',
//                 gap: '16px',
//                 marginBottom: '24px'
//               }}>
//                 <div style={{
//                   padding: '20px',
//                   borderRadius: '12px',
//                   backgroundColor: `${colors.saffron}10`,
//                   border: `2px solid ${colors.saffron}30`
//                 }}>
//                   <div style={{ 
//                     fontSize: '14px', 
//                     color: colors.darkGray,
//                     opacity: 0.7,
//                     marginBottom: '4px'
//                   }}>
//                     Population
//                   </div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: '700',
//                     color: colors.saffron
//                   }}>
//                     {selectedDistrict.population}
//                   </div>
//                 </div>

//                 <div style={{
//                   padding: '20px',
//                   borderRadius: '12px',
//                   backgroundColor: `${colors.green}10`,
//                   border: `2px solid ${colors.green}30`
//                 }}>
//                   <div style={{ 
//                     fontSize: '14px', 
//                     color: colors.darkGray,
//                     opacity: 0.7,
//                     marginBottom: '4px'
//                   }}>
//                     Heritage Sites
//                   </div>
//                   <div style={{ 
//                     fontSize: '24px', 
//                     fontWeight: '700',
//                     color: colors.green
//                   }}>
//                     {selectedDistrict.heritage}
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div style={{
//                 padding: '20px',
//                 borderRadius: '12px',
//                 backgroundColor: colors.bgLight,
//                 marginBottom: '24px'
//               }}>
//                 <div style={{ 
//                   display: 'flex', 
//                   alignItems: 'center', 
//                   gap: '8px',
//                   marginBottom: '12px'
//                 }}>
//                   <Info size={20} style={{ color: colors.saffron }} />
//                   <h3 style={{ 
//                     fontSize: '18px', 
//                     fontWeight: '700',
//                     color: colors.darkGray,
//                     margin: 0
//                   }}>
//                     About {selectedDistrict.name}
//                   </h3>
//                 </div>
//                 <p style={{ 
//                   margin: 0, 
//                   color: colors.darkGray,
//                   lineHeight: '1.6',
//                   fontSize: '15px'
//                 }}>
//                   {selectedDistrict.name} is a major district in Madhya Pradesh, known for its rich cultural heritage and historical significance. Explore the various panchayats, heritage sites, and natural beauty this district has to offer.
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div style={{
//                 display: 'flex',
//                 gap: '12px'
//               }}>
//                 <button style={{
//                   flex: 1,
//                   padding: '16px',
//                   borderRadius: '12px',
//                   border: 'none',
//                   backgroundColor: colors.saffron,
//                   color: colors.white,
//                   fontSize: '16px',
//                   fontWeight: '600',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease'
//                 }}>
//                   View Details
//                 </button>
//                 <button style={{
//                   flex: 1,
//                   padding: '16px',
//                   borderRadius: '12px',
//                   border: `2px solid ${colors.green}`,
//                   backgroundColor: 'transparent',
//                   color: colors.green,
//                   fontSize: '16px',
//                   fontWeight: '600',
//                   cursor: 'pointer',
//                   transition: 'all 0.3s ease'
//                 }}>
//                   Explore Panchayats
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }