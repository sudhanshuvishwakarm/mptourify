import HomeAbout from '@/components/HomeAbout';
import HomeHero from '@/components/HomeHero';
import HomeMpOverview from '@/components/HomeMpOverview';
import HomeNavigationTiles from '@/components/HomeNavigationTiles';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const h = useTranslations('HomePage');
  const n = useTranslations('Navigation');
  return (
    <>
      <HomeHero/>
      <HomeAbout/>
      <HomeMpOverview/>
      <HomeNavigationTiles/>
    </>
  );
}
// 'use client';
// import { useState } from 'react';

// export default function HomePage() {
//   const [activeTab, setActiveTab] = useState('all');

//   // Dummy data
//   const stats = {
//     districts: 55,
//     panchayats: 23043,
//     media: 15420,
//     heritage: 342
//   };

//   const featuredDistricts = [
//     {
//       id: 1,
//       name: 'Bhopal',
//       image: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=600&q=80',
//       description: 'City of Lakes and Capital of MP',
//       panchayats: 145
//     },
//     {
//       id: 2,
//       name: 'Indore',
//       image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80',
//       description: 'Commercial Capital and Cleanest City',
//       panchayats: 234
//     },
//     {
//       id: 3,
//       name: 'Khajuraho',
//       image: 'https://images.unsplash.com/photo-1598197748967-b4dfa48c99e3?w=600&q=80',
//       description: 'UNESCO World Heritage Site',
//       panchayats: 89
//     },
//     {
//       id: 4,
//       name: 'Gwalior',
//       image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&q=80',
//       description: 'Historic Fort City',
//       panchayats: 178
//     }
//   ];

//   const latestNews = [
//     {
//       id: 1,
//       title: 'MP Tourify Launched on Madhya Pradesh Sthapna Diwas',
//       date: '1st November 2024',
//       category: 'Announcement',
//       image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80'
//     },
//     {
//       id: 2,
//       title: 'RTC Teams Begin Comprehensive Panchayat Survey',
//       date: '28th October 2024',
//       category: 'Updates',
//       image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80'
//     },
//     {
//       id: 3,
//       title: '500+ Panchayats Documented in First Phase',
//       date: '25th October 2024',
//       category: 'Progress',
//       image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80'
//     }
//   ];

//   const categories = [
//     { id: 1, name: 'All', key: 'all' },
//     { id: 2, name: 'Heritage', key: 'heritage' },
//     { id: 3, name: 'Nature', key: 'nature' },
//     { id: 4, name: 'Culture', key: 'culture' }
//   ];

//   const gallery = [
//     { id: 1, image: 'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=400&q=80', title: 'Sanchi Stupa', category: 'heritage' },
//     { id: 2, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&q=80', title: 'Gwalior Fort', category: 'heritage' },
//     { id: 3, image: 'https://images.unsplash.com/photo-1598197748967-b4dfa48c99e3?w=400&q=80', title: 'Khajuraho Temples', category: 'heritage' },
//     { id: 4, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', title: 'Pachmarhi Hills', category: 'nature' },
//     { id: 5, image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', title: 'Marble Rocks', category: 'nature' },
//     { id: 6, image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&q=80', title: 'Traditional Dance', category: 'culture' },
//     { id: 7, image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400&q=80', title: 'Mandu Fort', category: 'heritage' },
//     { id: 8, image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', title: 'Local Handicrafts', category: 'culture' }
//   ];

//   const filteredGallery = activeTab === 'all' 
//     ? gallery 
//     : gallery.filter(item => item.category === activeTab);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50">
//       {/* Navigation Bar */}
//       <nav className="bg-white shadow-md sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center">
//                 <span className="text-white font-bold text-xl">MP</span>
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-800">MP TOURIFY</h1>
//                 <p className="text-xs text-gray-600">Discover Every Gram</p>
//               </div>
//             </div>
//             <div className="hidden md:flex space-x-8">
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">Home</a>
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">Districts</a>
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">Panchayats</a>
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">Gallery</a>
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">News</a>
//               <a href="#" className="text-gray-700 hover:text-orange-600 font-medium transition">Contact</a>
//             </div>
//             <button className="md:hidden text-gray-700">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative h-screen flex items-center justify-center overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-green-600/90 z-10"></div>
//         <div 
//           className="absolute inset-0 bg-cover bg-center"
//           style={{
//             backgroundImage: "url('https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200&q=80')"
//           }}
//         ></div>
//         <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
//           <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
//             MP TOURIFY
//           </h1>
//           <p className="text-xl md:text-3xl text-white mb-4 font-light">
//             Discover Every Gram of Madhya Pradesh
//           </p>
//           <p className="text-lg text-orange-100 mb-8">
//             Dedicated to Madhya Pradesh Tourism Department
//           </p>
//           <button className="bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-orange-50 transition transform hover:scale-105 shadow-xl">
//             Explore Our State
//           </button>
          
//           {/* Stats Bar */}
//           <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//               <div className="text-3xl md:text-4xl font-bold text-white">{stats.districts}</div>
//               <div className="text-sm text-orange-100 mt-1">Districts</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//               <div className="text-3xl md:text-4xl font-bold text-white">{stats.panchayats.toLocaleString()}</div>
//               <div className="text-sm text-orange-100 mt-1">Panchayats</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//               <div className="text-3xl md:text-4xl font-bold text-white">{stats.media.toLocaleString()}</div>
//               <div className="text-sm text-orange-100 mt-1">Photos & Videos</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
//               <div className="text-3xl md:text-4xl font-bold text-white">{stats.heritage}</div>
//               <div className="text-sm text-orange-100 mt-1">Heritage Sites</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="py-20 px-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">About MP Tourify</h2>
//             <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-600 mx-auto rounded-full"></div>
//           </div>
//           <div className="grid md:grid-cols-2 gap-12 items-center">
//             <div>
//               <p className="text-lg text-gray-700 leading-relaxed mb-6">
//                 MP Tourify is an innovative initiative dedicated to the Madhya Pradesh Tourism Department, 
//                 aiming to digitally document and promote every district and gram panchayat of our beautiful state.
//               </p>
//               <p className="text-lg text-gray-700 leading-relaxed mb-6">
//                 Launched on 1st November, Madhya Pradesh Sthapna Diwas, this platform celebrates the rich 
//                 cultural heritage, natural beauty, and diverse traditions that make Madhya Pradesh truly incredible.
//               </p>
//               <div className="grid grid-cols-2 gap-4 mt-8">
//                 <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
//                   <h3 className="font-semibold text-orange-800 mb-2">Cultural Heritage</h3>
//                   <p className="text-sm text-gray-700">Ancient monuments and UNESCO sites</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
//                   <h3 className="font-semibold text-green-800 mb-2">Natural Beauty</h3>
//                   <p className="text-sm text-gray-700">Pristine forests and waterfalls</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
//                   <h3 className="font-semibold text-blue-800 mb-2">Art & Craft</h3>
//                   <p className="text-sm text-gray-700">Traditional handicrafts and textiles</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
//                   <h3 className="font-semibold text-purple-800 mb-2">Local Cuisine</h3>
//                   <p className="text-sm text-gray-700">Authentic flavors and delicacies</p>
//                 </div>
//               </div>
//             </div>
//             <div className="relative">
//               <img 
//                 src="https://images.unsplash.com/photo-1598197748967-b4dfa48c99e3?w=600&q=80" 
//                 alt="Heritage" 
//                 className="rounded-2xl shadow-2xl"
//               />
//               <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl">
//                 <p className="text-sm text-gray-600 mb-1">Established</p>
//                 <p className="text-2xl font-bold text-orange-600">1st Nov 1956</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Quick Navigation Tiles */}
//       <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-green-600">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold text-white mb-4">Quick Navigation</h2>
//             <p className="text-orange-100">Explore different sections of MP Tourify</p>
//           </div>
//           <div className="grid md:grid-cols-4 gap-6">
//             <div className="bg-white rounded-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer">
//               <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Interactive Map</h3>
//               <p className="text-gray-600 text-center text-sm">Explore all districts on map</p>
//             </div>
            
//             <div className="bg-white rounded-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer">
//               <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 mx-auto">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Our Panchayats</h3>
//               <p className="text-gray-600 text-center text-sm">Discover gram panchayats</p>
//             </div>
            
//             <div className="bg-white rounded-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Photo Gallery</h3>
//               <p className="text-gray-600 text-center text-sm">Browse stunning images</p>
//             </div>
            
//             <div className="bg-white rounded-xl p-6 hover:shadow-2xl transition transform hover:-translate-y-2 cursor-pointer">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
//                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-bold text-gray-800 text-center mb-2">News & Updates</h3>
//               <p className="text-gray-600 text-center text-sm">Latest announcements</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Featured Districts */}
//       <section className="py-20 px-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">Featured Districts</h2>
//             <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-600 mx-auto rounded-full"></div>
//           </div>
//           <div className="grid md:grid-cols-4 gap-6">
//             {featuredDistricts.map(district => (
//               <div key={district.id} className="group cursor-pointer">
//                 <div className="relative overflow-hidden rounded-xl shadow-lg">
//                   <img 
//                     src={district.image} 
//                     alt={district.name}
//                     className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-500"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
//                   <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
//                     <h3 className="text-xl font-bold mb-1">{district.name}</h3>
//                     <p className="text-sm text-gray-200 mb-2">{district.description}</p>
//                     <div className="flex items-center text-xs text-orange-300">
//                       <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                       {district.panchayats} Panchayats
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-8">
//             <button className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105">
//               View All Districts
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Gallery Preview */}
//       <section className="py-20 px-4 bg-gray-50">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">Gallery</h2>
//             <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-600 mx-auto rounded-full mb-6"></div>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Explore the visual journey through Madhya Pradesh's rich heritage, natural beauty, and vibrant culture
//             </p>
//           </div>
          
//           {/* Category Tabs */}
//           <div className="flex justify-center mb-8 space-x-2 flex-wrap">
//             {categories.map(category => (
//               <button
//                 key={category.id}
//                 onClick={() => setActiveTab(category.key)}
//                 className={`px-6 py-2 rounded-full font-medium transition ${
//                   activeTab === category.key
//                     ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg'
//                     : 'bg-white text-gray-700 hover:bg-gray-100'
//                 }`}
//               >
//                 {category.name}
//               </button>
//             ))}
//           </div>

//           {/* Gallery Grid */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {filteredGallery.map(item => (
//               <div key={item.id} className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer">
//                 <img 
//                   src={item.image} 
//                   alt={item.title}
//                   className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-500"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
//                   <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
//                     <p className="font-semibold">{item.title}</p>
//                     <p className="text-xs text-orange-300 capitalize">{item.category}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           <div className="text-center mt-8">
//             <button className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105">
//               View Full Gallery
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Latest News */}
//       <section className="py-20 px-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-12">
//             <h2 className="text-4xl font-bold text-gray-800 mb-4">Latest News & Updates</h2>
//             <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-green-600 mx-auto rounded-full"></div>
//           </div>
//           <div className="grid md:grid-cols-3 gap-8">
//             {latestNews.map(news => (
//               <div key={news.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer group">
//                 <div className="relative overflow-hidden">
//                   <img 
//                     src={news.image} 
//                     alt={news.title}
//                     className="w-full h-48 object-cover transform group-hover:scale-110 transition duration-500"
//                   />
//                   <div className="absolute top-4 left-4">
//                     <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
//                       {news.category}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="p-6">
//                   <div className="flex items-center text-sm text-gray-500 mb-3">
//                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                     {news.date}
//                   </div>
//                   <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition">
//                     {news.title}
//                   </h3>
//                   <button className="text-orange-600 font-semibold text-sm flex items-center group-hover:translate-x-2 transition">
//                     Read More 
//                     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }