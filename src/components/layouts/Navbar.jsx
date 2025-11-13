'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Color Scheme
  const colors = {
    saffron: '#F3902C',
    green: '#138808',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333'
  };

  const navLinks = [
    { label: 'Home', href: '/', icon: null },
    { label: 'Our Districts', href: '/districts', icon: null },
    { label: 'Our Panchayats', href: '/panchayats', icon: null },
    { label: 'State Heritage', href: '/heritage', icon: null },
    { label: 'Gallery', href: '/gallery', icon: null },
    { label: 'News', href: '/news', icon: null },
    { label: 'About Us', href: '/about', icon: null },
  ];

  const handleNavigation = (href) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className="w-full shadow-lg sticky top-0 z-50"
      style={{ backgroundColor: colors.saffron }}
    >
      <div className="mx-auto px-4 md:px-8 lg:px-16">
        {/* Desktop Navbar */}
        <div className="hidden lg:flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: colors.white }}
            onClick={() => handleNavigation('/')}
          >
            <div 
              className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: colors.green }}
            >
              MP
            </div>
            <span>Tourify</span>
          </div>

          {/* Desktop Menu */}
          <div className="flex items-center gap-5">
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(link.href)}
                className="font-bold transition-all duration-300 py-2 px-1 hover:opacity-80"
                style={{ color: colors.white }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Right Icons */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button 
              className="px-6 py-2.5 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2"
              style={{ backgroundColor: colors.green }}
              onClick={() => handleNavigation('/contact')}
            >
              <Phone size={18} />
              Contact
            </button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden flex items-center justify-between h-16">
          {/* Mobile Logo */}
          <div 
            className="flex items-center gap-2 text-xl font-bold cursor-pointer"
            style={{ color: colors.white }}
            onClick={() => handleNavigation('/')}
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: colors.green }}
            >
              MP
            </div>
            <span>Tourify</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg transition-all duration-300"
              style={{ color: colors.white }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-300"
            style={{ backgroundColor: colors.white }}
          >
            {navLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => handleNavigation(link.href)}
                className="w-full text-left px-4 py-3 font-semibold transition-all duration-300"
                style={{ color: colors.green }}
              >
                {link.label}
              </button>
            ))}

            {/* Mobile Bottom Contact Button */}
            <div className="border-t mt-2 pt-2 px-4">
              <button 
                className="w-full px-4 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.green }}
                onClick={() => handleNavigation('/contact')}
              >
                <Phone size={18} />
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}// 'use client';

// import { useState } from 'react';
// import { useTranslations } from 'next-intl';
// import { useRouter } from 'next/navigation';
// import { Menu, X, Phone } from 'lucide-react';
// import LanguageSwitcher from './LanguageSwitcher';

// export default function Navbar() {
//   const t = useTranslations();
//   const router = useRouter();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Color Scheme
//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#FFF7EB',
//     darkGray: '#333333'
//   };

//   const navLinks = [
//     { label: t('Navigation.home'), href: '/', icon: null },
//     { label: t('Navigation.districts'), href: '/districts', icon: null },
//     { label: t('Navigation.panchayats'), href: '/panchayats', icon: null },
//     { label: t('Navigation.heritage'), href: '/heritage', icon: null },
//     { label: t('Navigation.gallery'), href: '/gallery', icon: null },
//     { label: t('Navigation.news'), href: '/news', icon: null },
//     { label: t('Navigation.about'), href: '/about', icon: null },
//   ];

//   const handleNavigation = (href) => {
//     router.push(href);
//     setIsMenuOpen(false);
//   };

//   return (
//     <nav 
//       className="w-full shadow-lg sticky top-0 z-50"
//       style={{ backgroundColor: colors.saffron }}
//     >
//       <div className="mx-auto px-4 md:px-8 lg:px-16">
//         {/* Desktop Navbar */}
//         <div className="hidden lg:flex items-center justify-between h-20">
//           {/* Logo */}
//           <div 
//             className="flex items-center gap-3 text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
//             style={{ color: colors.white }}
//             onClick={() => handleNavigation('/')}
//           >
//             <div 
//               className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-white text-sm"
//               style={{ backgroundColor: colors.green }}
//             >
//               MP
//             </div>
//             <span>Tourify</span>
//           </div>

//           {/* Desktop Menu */}
//           <div className="flex items-center gap-5">
//             {navLinks.map((link, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => handleNavigation(link.href)}
//                 className="font-semibold transition-all duration-300 py-2 px-1 hover:opacity-80"
//                 style={{ color: colors.white }}
//               >
//                 {link.label}
//               </button>
//             ))}
//           </div>

//           {/* Desktop Right Icons */}
//           <div className="flex items-center gap-4">
//             <LanguageSwitcher />
//             <button 
//               className="px-6 py-2.5 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2"
//               style={{ backgroundColor: colors.green }}
//               onClick={() => handleNavigation('/contact')}
//             >
//               <Phone size={18} />
//               {t('Navigation.contact')}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navbar */}
//         <div className="lg:hidden flex items-center justify-between h-16">
//           {/* Mobile Logo */}
//           <div 
//             className="flex items-center gap-2 text-xl font-bold cursor-pointer"
//             style={{ color: colors.white }}
//             onClick={() => handleNavigation('/')}
//           >
//             <div 
//               className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
//               style={{ backgroundColor: colors.green }}
//             >
//               MP
//             </div>
//             <span>Tourify</span>
//           </div>

//           <div className="flex items-center gap-3">
//             <LanguageSwitcher />
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-1.5 rounded-lg transition-all duration-300"
//               style={{ color: colors.white }}
//             >
//               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div 
//             className="lg:hidden pb-4 animate-in slide-in-from-top-2 duration-300"
//             style={{ backgroundColor: colors.white }}
//           >
//             {navLinks.map((link, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => handleNavigation(link.href)}
//                 className="w-full text-left px-4 py-3 font-semibold transition-all duration-300"
//                 style={{ color: colors.green }}
//               >
//                 {link.label}
//               </button>
//             ))}

//             {/* Mobile Bottom Contact Button */}
//             <div className="border-t mt-2 pt-2 px-4">
//               <button 
//                 className="w-full px-4 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
//                 style={{ backgroundColor: colors.green }}
//                 onClick={() => handleNavigation('/contact')}
//               >
//                 <Phone size={18} />
//                 {t('Navigation.contact')}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }




// 'use client';

// import { useState } from 'react';
// import { useTranslations } from 'next-intl';
// import { useRouter } from 'next/navigation';
// import { Menu, X, MapPin, ChevronDown } from 'lucide-react';
// import LanguageSwitcher from './LanguageSwitcher';

// export default function Navbar() {
//   const t = useTranslations();
//   const router = useRouter();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isDestinationOpen, setIsDestinationOpen] = useState(false);
//   const [activeTab, setActiveTab] = useState('states');

//   // Color Scheme
//   const colors = {
//     saffron: '#FF9933',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#F5F5F5',
//     darkGray: '#333333'
//   };

//   const navLinks = [
//     { label: t('Navigation.home'), href: '/', icon: null },
//     { label: t('Navigation.explore'), href: '/destination', icon: MapPin, hasSubmenu: true },
//     { label: t('Navigation.experiences'), href: '/experiences', icon: null },
//     { label: t('Navigation.planTrip'), href: '/plan-trip', icon: null },
//     { label: t('Navigation.blogs'), href: '/blogs', icon: null },
//   ];

//   const statesData = {
//     en: {
//       north: ['Chandigarh', 'Delhi', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh', 'Punjab'],
//       northeast: ['Arunachal Pradesh', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim'],
//       east: ['Andaman and Nicobar Islands', 'Bihar', 'Jharkhand', 'Odisha', 'West Bengal'],
//       central: ['Chhattisgarh', 'Madhya Pradesh'],
//       west: ['Dadra and Nagar Haveli and Daman and Diu', 'Goa', 'Gujarat', 'Maharashtra'],
//       south: ['Andhra Pradesh', 'Karnataka', 'Kerala', 'Lakshadweep', 'Puducherry', 'Tamil Nadu', 'Telangana']
//     },
//     hi: {
//       north: ['चंडीगढ़', 'दिल्ली', 'हरियाणा', 'हिमाचल प्रदेश', 'जम्मू और कश्मीर', 'लद्दाख', 'पंजाब'],
//       northeast: ['अरुणाचल प्रदेश', 'असम', 'मणिपुर', 'मेघालय', 'मिजोरम', 'नागालैंड', 'सिक्किम'],
//       east: ['अंडमान और निकोबार द्वीप', 'बिहार', 'झारखंड', 'ओडिशा', 'पश्चिम बंगाल'],
//       central: ['छत्तीसगढ़', 'मध्य प्रदेश'],
//       west: ['दादरा और नगर हवेली और दमन और दीव', 'गोवा', 'गुजरात', 'महाराष्ट्र'],
//       south: ['आंध्र प्रदेश', 'कर्नाटक', 'केरल', 'लक्षद्वीप', 'पुडुचेरी', 'तमिलनाडु', 'तेलंगाना']
//     }
//   };

//   const locale = t('Dropdown.statesAndUTs') === 'States and UTs' ? 'en' : 'hi';

//   const regions = [
//     {
//       slug: 'north',
//       name: t('RegionNames.north'),
//       states: statesData[locale].north
//     },
//     {
//       slug: 'northeast',
//       name: t('RegionNames.northeast'),
//       states: statesData[locale].northeast
//     },
//     {
//       slug: 'east',
//       name: t('RegionNames.east'),
//       states: statesData[locale].east
//     },
//     {
//       slug: 'central',
//       name: t('RegionNames.central'),
//       states: statesData[locale].central
//     },
//     {
//       slug: 'west',
//       name: t('RegionNames.west'),
//       states: statesData[locale].west
//     },
//     {
//       slug: 'south',
//       name: t('RegionNames.south'),
//       states: statesData[locale].south
//     }
//   ];

//   const handleNavigation = (href) => {
//     router.push(href);
//     setIsMenuOpen(false);
//     setIsDestinationOpen(false);
//   };

//   const handleRegionClick = (slug) => {
//     router.push(`/destination/${slug}`);
//     setIsDestinationOpen(false);
//     setIsMenuOpen(false);
//   };

//   const toggleDestination = () => {
//     setIsDestinationOpen(!isDestinationOpen);
//   };

//   return (
//     <nav 
//       className="w-full shadow-md sticky top-0 z-50"
//       style={{ 
//         background: `linear-gradient(to right, ${colors.saffron}, ${colors.saffron}99)`
//       }}
//     >
//       <div className="mx-auto px-4 md:px-8 lg:px-16">
//         {/* Desktop Navbar */}
//         <div className="hidden lg:flex items-center justify-between h-20">
//           {/* Logo */}
//           <div 
//             className="flex items-center gap-2 text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
//             style={{ color: colors.white }}
//             onClick={() => handleNavigation('/')}
//           >
//             <div 
//               className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
//               style={{ backgroundColor: colors.green }}
//             >
//               MP
//             </div>
//             <span>Tourify</span>
//           </div>

//           {/* Desktop Menu */}
//           <div className="flex items-center gap-8">
//             {navLinks.map((link, idx) => (
//               <div key={idx}>
//                 <button
//                   onClick={() => {
//                     if (link.hasSubmenu) {
//                       toggleDestination();
//                     } else {
//                       handleNavigation(link.href);
//                     }
//                   }}
//                   className="font-semibold transition-all duration-300 py-2 px-2 flex items-center gap-2 hover:opacity-80 rounded-lg"
//                   style={{ 
//                     color: colors.white,
//                   }}
//                 >
//                   {link.label}
//                   {link.hasSubmenu && (
//                     <ChevronDown 
//                       size={16} 
//                       className={`transition-transform duration-300 ${isDestinationOpen ? 'rotate-180' : ''}`}
//                     />
//                   )}
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Desktop Right Icons */}
//           <div className="flex items-center gap-4">
//             <LanguageSwitcher />
//             <button 
//               className="px-6 py-2.5 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:opacity-90 shadow-md"
//               style={{ backgroundColor: colors.green }}
//               onClick={() => handleNavigation('/book')}
//             >
//               {t('Navigation.bookGramstay')}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navbar */}
//         <div className="lg:hidden flex items-center justify-between h-16">
//           {/* Mobile Logo */}
//           <div 
//             className="flex items-center gap-2 text-xl font-bold cursor-pointer"
//             style={{ color: colors.white }}
//             onClick={() => handleNavigation('/')}
//           >
//             <div 
//               className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm"
//               style={{ backgroundColor: colors.green }}
//             >
//               MP
//             </div>
//             <span>Tourify</span>
//           </div>

//           <div className="flex items-center gap-3">
//             <LanguageSwitcher />
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-1.5 rounded-lg transition-all duration-300"
//               style={{ color: colors.white }}
//             >
//               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* Full Width Dropdown */}
//         {isDestinationOpen && (
//           <div 
//             className="fixed h-full left-0 top-20 w-full shadow-2xl border-t overflow-hidden animate-in slide-in-from-top-4 duration-300"
//             style={{ 
//               backgroundColor: colors.white,
//               borderTopColor: colors.saffron,
//               borderTopWidth: '4px',
//               animation: 'slideDown 0.3s ease-out'
//             }}
//           >
//             <style>{`
//               @keyframes slideDown {
//                 from {
//                   opacity: 0;
//                   transform: translateY(-20px);
//                   max-height: 0;
//                 }
//                 to {
//                   opacity: 1;
//                   transform: translateY(0);
//                   max-height: 800px;
//                 }
//               }
//             `}</style>

//             <div className="mx-auto px-4 md:px-8 lg:px-16">
//               {/* Tabs */}
//               <div className="flex border-b pt-6 gap-8" style={{ borderBottomColor: colors.bgColor }}>
//                 <button
//                   onClick={() => setActiveTab('states')}
//                   className="pb-4 font-bold transition-all duration-300 border-b-2 whitespace-nowrap"
//                   style={{
//                     color: activeTab === 'states' ? colors.saffron : colors.darkGray,
//                     borderBottomColor: activeTab === 'states' ? colors.saffron : 'transparent'
//                   }}
//                 >
//                   {t('Dropdown.statesAndUTs')}
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('destinations')}
//                   className="pb-4 font-bold transition-all duration-300 border-b-2 whitespace-nowrap"
//                   style={{
//                     color: activeTab === 'destinations' ? colors.saffron : colors.darkGray,
//                     borderBottomColor: activeTab === 'destinations' ? colors.saffron : 'transparent'
//                   }}
//                 >
//                   {t('Dropdown.destinations')}
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('parks')}
//                   className="pb-4 font-bold transition-all duration-300 border-b-2 whitespace-nowrap"
//                   style={{
//                     color: activeTab === 'parks' ? colors.saffron : colors.darkGray,
//                     borderBottomColor: activeTab === 'parks' ? colors.saffron : 'transparent'
//                   }}
//                 >
//                   {t('Dropdown.nationalParks')}
//                 </button>

//                 {/* Close Button */}
//                 <button
//                   onClick={() => setIsDestinationOpen(false)}
//                   className="ml-auto pb-4 hover:opacity-70 transition-opacity"
//                   style={{ color: colors.saffron }}
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="py-8 pb-12 max-h-96 overflow-y-auto">
//                 {activeTab === 'states' && (
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
//                     {regions.map((region) => (
//                       <div key={region.slug}>
//                         <h3 
//                           className="font-bold text-base mb-4 cursor-pointer hover:opacity-70 transition-opacity"
//                           style={{ color: colors.saffron }}
//                           onClick={() => handleRegionClick(region.slug)}
//                         >
//                           {region.name}
//                         </h3>
//                         <ul className="space-y-2">
//                           {region.states.map((state) => (
//                             <li key={state}>
//                               <button
//                                 onClick={() => handleRegionClick(region.slug)}
//                                 className="text-sm transition-all duration-200 hover:font-bold"
//                                 style={{ color: colors.darkGray }}
//                               >
//                                 {state}
//                               </button>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {activeTab === 'destinations' && (
//                   <div className="text-center py-12" style={{ color: colors.darkGray }}>
//                     <p className="text-lg">{t('Dropdown.popularDestinationsSoon')}</p>
//                   </div>
//                 )}

//                 {activeTab === 'parks' && (
//                   <div className="text-center py-12" style={{ color: colors.darkGray }}>
//                     <p className="text-lg">{t('Dropdown.nationalParksSoon')}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div 
//             className="lg:hidden pb-4 border-t animate-in slide-in-from-top-2 duration-300"
//             style={{ 
//               backgroundColor: colors.white,
//               borderTopColor: colors.saffron,
//               borderTopWidth: '2px'
//             }}
//           >
//             {navLinks.map((link, idx) => (
//               <div key={idx}>
//                 <button
//                   onClick={() => {
//                     if (link.hasSubmenu) {
//                       setIsDestinationOpen(!isDestinationOpen);
//                     } else {
//                       handleNavigation(link.href);
//                     }
//                   }}
//                   className="w-full text-left px-4 py-3 font-semibold flex items-center justify-between transition-all duration-300 hover:bg-opacity-10"
//                   style={{ 
//                     color: colors.saffron,
//                     backgroundColor: isDestinationOpen && link.hasSubmenu ? colors.bgColor : 'transparent'
//                   }}
//                 >
//                   <span className="flex items-center gap-2">
//                     {link.label}
//                   </span>
//                   {link.hasSubmenu && (
//                     <span className={`transition-transform duration-300 ${isDestinationOpen ? 'rotate-180' : ''}`}>
//                       <ChevronDown size={18} />
//                     </span>
//                   )}
//                 </button>

//                 {link.hasSubmenu && isDestinationOpen && (
//                   <div style={{ backgroundColor: colors.bgColor }}>
//                     {regions.map((region) => (
//                       <div key={region.slug} className="px-4">
//                         <button
//                           onClick={() => handleRegionClick(region.slug)}
//                           className="w-full text-left py-3 font-bold text-sm"
//                           style={{ color: colors.saffron }}
//                         >
//                           {region.name}
//                         </button>
//                         <div className="pl-4 pb-3">
//                           {region.states.slice(0, 3).map((state) => (
//                             <button
//                               key={state}
//                               onClick={() => handleRegionClick(region.slug)}
//                               className="block text-left text-xs py-1 hover:font-bold transition-all"
//                               style={{ color: colors.darkGray }}
//                             >
//                               {state}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}

//             {/* Mobile Bottom Actions */}
//             <div className="border-t mt-2 pt-2" style={{ borderTopColor: colors.bgColor }}>
//               <button 
//                 className="w-full text-left px-4 py-3 flex items-center gap-2 font-semibold transition-all duration-300"
//                 style={{ color: colors.saffron }}
//               >
//                 {t('Navigation.signin')}
//               </button>
//               <button 
//                 className="w-full m-2 px-4 py-3 rounded-lg font-bold text-white transition-all duration-300"
//                 style={{ backgroundColor: colors.green }}
//                 onClick={() => handleNavigation('/book')}
//               >
//                 {t('Navigation.bookGramstay')}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// }
