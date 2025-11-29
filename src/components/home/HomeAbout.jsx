'use client';

import { useRouter } from 'next/navigation';

export default function HomeAbout() {
  const router = useRouter();

  const places = [
    {
      name: "Maheshwar Fort",
      image: "/images/ha1.png",
    },
    {
      name: "Kanha Tiger Reserve",
      image: "/images/ha2.webp",
    },
    {
      name: "Ujjain Temple",
      image: "/images/ha3.png",
    },
    {
      name: "Lokrang Festival",
      image: "/images/ha4.png",
    },
  ];

  const colors = {
    primary: '#117307',
    background: '#f5fbf2'
  };

  const handleExplore = () => {
    router.push('/districts');
  };

  return (
    <div className="w-full" style={{ backgroundColor: colors.background }}>
      <section className="w-full pt-16 md:pt-24 px-4 md:px-8" style={{ backgroundColor: colors.background }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* LEFT CONTENT */}
            <div>
              <div className="mb-6 inline-block">
                <span
                  className="text-sm font-bold px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                  }}
                >
                  About MP Tourify
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span style={{ color: colors.primary }}>Digital Platform </span>
                <span style={{ color: '#333333' }}>for</span>
                <br />
                <span style={{ color: colors.primary }}>Madhya Pradesh Tourism</span>
              </h2>

              <p className="text-lg leading-relaxed mb-6" style={{ color: '#333333' }}>
                MP Tourify is a comprehensive digital initiative dedicated to the Madhya Pradesh Tourism Department, designed to map, document, and celebrate every district and gram panchayat of the state.
              </p>

                   <p className="text-lg leading-relaxed mb-6" style={{ color: '#333333' }}>
                Our mission is to create an immersive platform that connects travelers with the rich cultural heritage, natural wonders, and vibrant communities across Madhya Pradesh, fostering sustainable tourism growth.
              </p>

              {/* FEATURES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {[
                'District-wise Information',
'Panchayat-level Documentation', 
'Tourism Places Details',
'Photo Gallery & Media',
'News Updates & Announcements',
'Interactive Maps & Guides'
                ].map((feature, idx) => (
<div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
  <div style={{ color: '#333333' }} className="text-sm font-medium">{feature}</div>
</div>
                ))}
              </div>

              {/* EXPLORE BUTTON */}
              {/* <button
                onClick={handleExplore}
                className="px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                style={{ backgroundColor: colors.primary }}
              >
                Explore Districts
              </button> */}
            </div>

            {/* RIGHT VISUAL GRID - UNCHANGED */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {places.map((place, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-2xl shadow-lg"
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full scale-104 h-auto object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <p className="text-white text-lg md:text-xl font-semibold">{place.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}// 'use client';

// import { useRouter } from 'next/navigation';

// export default function HomeAbout() {
//   const router = useRouter();

//   const places = [
//     {
//       name: "Maheshwar Fort",
//       image: "/images/ha1.png",
//     },
//     {
//       name: "Kanha Tiger Reserve",
//       image: "/images/ha2.webp",
//     },
//     {
//       name: "Ujjain Temple",
//       image: "/images/ha3.png",
//     },
//     {
//       name: "Lokrang Festival",
//       image: "/images/ha4.png",
//     },
//   ];

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#f5fbf2',
//     darkGray: '#333333',
//     lightGray: '#F5F5F5'
//   };

//   const handleExplore = () => {
//     router.push('/districts');
//   };

//   return (
//     <div className="w-full min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       <section className="w-full py-16 md:py-24 px-4 md:px-8" style={{ backgroundColor: colors.bgColor }}>
//         <div className="max-w-7xl mx-auto">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
//             {/* LEFT CONTENT */}
//             <div>
//               <div className="mb-6 inline-block">
//                 <span
//                   className="text-sm font-bold px-4 py-2 rounded-full"
//                   style={{
//                     backgroundColor: `${colors.saffron}20`,
//                     color: colors.saffron,
//                   }}
//                 >
//                   About Our Initiative
//                 </span>
//               </div>

//               <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
//                 <span style={{ color: colors.saffron }}>Digitally </span>
//                 <span style={{ color: '#5e89ea' }}> Transforming</span>
//                 <br />
//                 <span style={{ color: colors.green }}>Tourism</span>
//               </h2>

//               <p className="text-lg leading-relaxed mb-6" style={{ color: colors.darkGray }}>
//                 MP Tourify is a comprehensive digital initiative dedicated to the Madhya Pradesh Tourism Department, designed to map, document, and celebrate every district and gram panchayat of the state.
//               </p>

//               <p
//                 className="text-base leading-relaxed mb-8"
//                 style={{ color: colors.darkGray, opacity: 0.8 }}
//               >
//                 Our mission is to create an immersive platform that connects travelers with the rich cultural heritage, natural wonders, and vibrant communities across Madhya Pradesh, fostering sustainable tourism growth.
//               </p>

//               {/* FEATURES */}
//               <div className="space-y-4">
//                 {[
//                   'Complete District Documentation',
//                   'Gram Panchayat Information',
//                   'Heritage Site Mapping',
//                   'Community Tourism Stories',
//                 ].map((feature, idx) => (
//                   <div key={idx} className="flex items-center gap-3">
//                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.saffron }} />
//                     <div style={{ color: colors.darkGray }}>{feature}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* RIGHT VISUAL GRID */}
//             <div className="grid grid-cols-2 gap-4 md:gap-6">
//               {places.map((place, index) => (
//                 <div
//                   key={index}
//                   className="relative group overflow-hidden rounded-2xl shadow-lg"
//                 >
//                   <img
//                     src={place.image}
//                     alt={place.name}
//                     className="w-full scale-104 h-auto object-cover transform group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
//                     <p className="text-white text-lg md:text-xl font-semibold">{place.name}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }
