'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Mail,
  MapPin,
  Phone,
  Heart,
  ExternalLink,
  Send
} from 'lucide-react';

export default function HomeFooter() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const colors = {
    primary: '#117307',      
    white: '#FFFFFF',
    textDark: '#0d4d03',    
    footerBg: '#0d5c06',   
    footerText: '#e0f0dd',   
    footerBorder: '#1a5e10' 
  };

  const footerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Districts', href: '/districts' },
    { label: 'Panchayats', href: '/panchayats' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/mptourism', label: 'Facebook', color: '#1877F2' },
    { icon: Instagram, href: 'https://instagram.com/mptourism', label: 'Instagram', color: '#E4405F' },
    { icon: Youtube, href: 'https://youtube.com/mptourism', label: 'YouTube', color: '#FF0000' }
  ];

  return (
    <footer style={{ backgroundColor: colors.footerBg, color: colors.footerText }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center border-2" 
                style={{ 
                  backgroundColor: colors.primary, 
                  borderColor: colors.white 
                }}
              >
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <h3 className="text-2xl font-bold text-white">MP Tourify</h3>
            </div>
            
            <p className="mb-6 max-w-md leading-relaxed">
              A comprehensive digital initiative dedicated to Madhya Pradesh Tourism Department, celebrating every district, village, and heritage site of the state.
            </p>

            {/* Social Media */}
            <div>
              <h5 className="font-semibold mb-4 text-white">Follow Us</h5>
              <div className="flex gap-3">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      style={{ backgroundColor: social.color }}
                      title={social.label}
                    >
                      <Icon size={18} className="text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-1 flex-shrink-0" style={{ color: colors.white }} />
                <div>
                  <p className="text-sm font-semibold ">Email :-</p>
                  <a 
                    href="mailto:info@mptourify.com" 
                    className="hover:text-white transition-colors text-white opacity-90 hover:opacity-100"
                  >
                    info@mptourify.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-1 flex-shrink-0" style={{ color: colors.white }} />
                <div>
                  <p className="text-sm font-semibold">Phone :-</p>
                  <a 
                    href="tel:+911234567890" 
                    className="hover:text-white transition-colors text-white opacity-90 hover:opacity-100"
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" style={{ color: colors.white }} />
                <div>
                  <p className="text-sm font-semibold">Address :-</p>
                 <p
                    href="tel:+911234567890" 
                    className="hover:text-white transition-colors text-white opacity-90 hover:opacity-100"
                  >
                     Bhopal, Madhya Pradesh<br/>
                    India - 462011
                  </p>
                   
                  
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => router.push(link.href)}
                    className="hover:text-white text-white opacity--90 cursor-pointer hover:opacity-100 transition-all duration-200 text-md hover:translate-x-1"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ borderTopColor: colors.footerBorder, borderTopWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <span>© 2025 MP Tourify. All rights reserved</span>
            </div>
            
            <div className="flex flex-wrap gap-6 ">
              <button className="hover:text-white hover:opacity-100 transition-colors">Privacy Policy</button>
              <button className="hover:text-white hover:opacity-100 transition-colors">Terms of Service</button>
              <button className="hover:text-white hover:opacity-100 transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   Facebook, 
//   Instagram, 
//   Youtube, 
//   Mail,
//   MapPin,
//   Phone,
//   Heart,
//   ExternalLink,
//   Send
// } from 'lucide-react';

// export default function HomeFooter() {
//   const [email, setEmail] = useState('');
//   const router = useRouter();

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#FFF7EB',
//     darkGray: '#333333',
//     lightGray: '#F5F5F5',
//     footerBg: '#1a1a1a',
//     footerText: '#e0e0e0'
//   };

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     setEmail('');
//   };

//   const footerLinks = [
//     { label: 'Home', href: '/' },
//     { label: 'Districts', href: '/districts' },
//     { label: 'Panchayats', href: '/panchayats' },
//     { label: 'Gallery', href: '/gallery' },
//     { label: 'News', href: '/news' },
//     { label: 'Contact', href: '/contact' }
//   ];

//   const socialLinks = [
//     { icon: Facebook, href: 'https://facebook.com/mptourism', label: 'Facebook', color: '#1877F2' },
//     { icon: Instagram, href: 'https://instagram.com/mptourism', label: 'Instagram', color: '#E4405F' },
//     { icon: Youtube, href: 'https://youtube.com/mptourism', label: 'YouTube', color: '#FF0000' }
//   ];

//   return (
//     <footer style={{ backgroundColor: colors.footerBg, color: colors.footerText }}>
//       {/* Main Footer Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
//           {/* Brand & Newsletter */}
//           <div className="lg:col-span-2">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.saffron }}>
//                 <span className="text-white font-bold text-lg">MP</span>
//               </div>
//               <h3 className="text-2xl font-bold text-white">MP Tourify</h3>
//             </div>
            
//             <p className="mb-6 max-w-md leading-relaxed">
//               A comprehensive digital initiative dedicated to Madhya Pradesh Tourism Department, celebrating every district, village, and heritage site of the state.
//             </p>

//             {/* Official Link */}
//             {/* <div className="mb-6">
//               <a 
//                 href="https://www.mptourism.com/" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg font-semibold"
//                 style={{ backgroundColor: colors.saffron, color: colors.white }}
//               >
//                 <span>MP Tourism Official</span>
//                 <ExternalLink size={16} />
//               </a>
//             </div> */}

//             {/* Project Credit */}
//             {/* <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: `${colors.saffron}15` }}>
//               <p className="text-sm italic" style={{ color: colors.saffron }}>
//                 "A dedicated initiative to Madhya Pradesh Tourism Department"
//               </p>
//             </div> */}

//             {/* Newsletter */}
//                  <div>
//               <h5 className="font-semibold mb-4" style={{ color: colors.saffron }}>Follow Us</h5>
//               <div className="flex gap-3">
//                 {socialLinks.map((social, idx) => {
//                   const Icon = social.icon;
//                   return (
//                     <a
//                       key={idx}
//                       href={social.href}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
//                       style={{ backgroundColor: social.color }}
//                       title={social.label}
//                     >
//                       <Icon size={18} className="text-white" />
//                     </a>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Contact Info */}
//           <div>
//             <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Contact</h4>
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <Mail size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-xs opacity-70">Email</p>
//                   <a 
//                     href="mailto:info@mptourify.com" 
//                     className="hover:opacity-100 transition-opacity"
//                   >
//                     info@mptourify.com
//                   </a>
//                 </div>
//               </div>
              
//               <div className="flex items-start gap-3">
//                 <Phone size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-xs opacity-70">Phone</p>
//                   <a 
//                     href="tel:+911234567890" 
//                     className="hover:opacity-100 transition-opacity"
//                   >
//                     +91 123 456 7890
//                   </a>
//                 </div>
//               </div>
              
//               <div className="flex items-start gap-3">
//                 <MapPin size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-xs opacity-70">Address</p>
//                   <p className="text-sm">
//                     Bhopal, Madhya Pradesh<br/>
//                     India - 462011
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Links & Social */}
//           <div>
//             <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Quick Links</h4>
//             <ul className="space-y-3 mb-8">
//               {footerLinks.map((link) => (
//                 <li key={link.label}>
//                   <button 
//                     onClick={() => router.push(link.href)}
//                     className="hover:opacity-100 opacity-80 transition-opacity text-sm"
//                   >
//                     {link.label}
//                   </button>
//                 </li>
//               ))}
//             </ul>

//             {/* Social Media */}
      
//           </div>
//         </div>
//       </div>

//       {/* Bottom Footer */}
//       <div style={{ borderTopColor: `${colors.saffron}30`, borderTopWidth: '1px' }}>
//         <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
//             <div className="flex items-center gap-2 opacity-80">
//               <span>© 2024 MP Tourify. All rights reserved</span>
//               <Heart size={14} style={{ color: colors.saffron }} fill={colors.saffron} />
//             </div>
            
//             <div className="flex flex-wrap gap-6 opacity-80">
//               <button className="hover:opacity-100 transition-opacity">Privacy Policy</button>
//               <button className="hover:opacity-100 transition-opacity">Terms of Service</button>
//               <button className="hover:opacity-100 transition-opacity">Cookies</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

