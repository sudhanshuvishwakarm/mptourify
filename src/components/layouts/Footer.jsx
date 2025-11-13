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
    saffron: '#F3902C',
    green: '#339966',
    skyBlue: '#33CCFF',
    white: '#FFFFFF',
    bgColor: '#FFF7EB',
    darkGray: '#333333',
    lightGray: '#F5F5F5',
    footerBg: '#1a1a1a',
    footerText: '#e0e0e0'
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const footerLinks = [
    { label: 'Home', href: '/' },
    { label: 'Districts', href: '/districts' },
    { label: 'Panchayats', href: '/panchayats' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'News', href: '/news' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/mptourism', label: 'Facebook', color: '#1877F2' },
    { icon: Instagram, href: 'https://instagram.com/mptourism', label: 'Instagram', color: '#E4405F' },
    { icon: Youtube, href: 'https://youtube.com/mptourism', label: 'YouTube', color: '#FF0000' }
  ];

  return (
    <footer style={{ backgroundColor: colors.footerBg, color: colors.footerText }}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.saffron }}>
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <h3 className="text-2xl font-bold text-white">MP Tourify</h3>
            </div>
            
            <p className="mb-6 max-w-md leading-relaxed">
              A comprehensive digital initiative dedicated to Madhya Pradesh Tourism Department, celebrating every district, village, and heritage site of the state.
            </p>

            {/* Official Link */}
            <div className="mb-6">
              <a 
                href="https://www.mptourism.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg font-semibold"
                style={{ backgroundColor: colors.saffron, color: colors.white }}
              >
                <span>MP Tourism Official</span>
                <ExternalLink size={16} />
              </a>
            </div>

            {/* Project Credit */}
            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: `${colors.saffron}15` }}>
              <p className="text-sm italic" style={{ color: colors.saffron }}>
                "A dedicated initiative to Madhya Pradesh Tourism Department"
              </p>
            </div>

            {/* Newsletter */}
            <div className="rounded-lg p-6" style={{ backgroundColor: `${colors.darkGray}40` }}>
              <h4 className="font-bold mb-4 text-lg text-white">Stay Updated</h4>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    style={{ 
                      backgroundColor: `${colors.white}10`,
                      color: colors.white,
                      borderColor: colors.saffron,
                      borderWidth: '1px'
                    }}
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                    style={{ backgroundColor: colors.saffron }}
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-xs opacity-70">
                  By subscribing, you agree to our Privacy Policy
                </p>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
                <div>
                  <p className="text-xs opacity-70">Email</p>
                  <a 
                    href="mailto:info@mptourify.com" 
                    className="hover:opacity-100 transition-opacity"
                  >
                    info@mptourify.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
                <div>
                  <p className="text-xs opacity-70">Phone</p>
                  <a 
                    href="tel:+911234567890" 
                    className="hover:opacity-100 transition-opacity"
                  >
                    +91 123 456 7890
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
                <div>
                  <p className="text-xs opacity-70">Address</p>
                  <p className="text-sm">
                    Bhopal, Madhya Pradesh<br/>
                    India - 462011
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Social */}
          <div>
            <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Quick Links</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <button 
                    onClick={() => router.push(link.href)}
                    className="hover:opacity-100 opacity-80 transition-opacity text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="font-semibold mb-4" style={{ color: colors.saffron }}>Follow Us</h5>
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
        </div>
      </div>

      {/* Bottom Footer */}
      <div style={{ borderTopColor: `${colors.saffron}30`, borderTopWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex items-center gap-2 opacity-80">
              <span>© 2024 MP Tourify. All rights reserved</span>
              <Heart size={14} style={{ color: colors.saffron }} fill={colors.saffron} />
            </div>
            
            <div className="flex flex-wrap gap-6 opacity-80">
              <button className="hover:opacity-100 transition-opacity">Privacy Policy</button>
              <button className="hover:opacity-100 transition-opacity">Terms of Service</button>
              <button className="hover:opacity-100 transition-opacity">Cookies</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}// 'use client';
// import { useState } from 'react';
// import Link from 'next/link';
// import { 
//   Facebook, 
//   Instagram, 
//   Youtube, 
//   Mail,
//   MapPin,
//   Phone,
//   Heart,
//   ExternalLink
// } from 'lucide-react';

// export default function Footer() {
//   const [email, setEmail] = useState('');

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     // Handle subscription logic here
//     console.log('Subscribed with:', email);
//     setEmail('');
//     // You can add a toast notification here
//   };

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#FFF7EB',
//     darkGray: '#333333',
//     lightGray: '#F5F5F5'
//   };

//   return (
//     <footer className="bg-gray-900 text-white">
//       {/* Main Footer Content */}
//       <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
//           {/* Brand & Newsletter Section */}
//           <div className="lg:col-span-2">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.saffron }}>
//                 <span className="text-white font-bold text-lg">MP</span>
//               </div>
//               <h3 className="text-2xl font-bold" style={{ color: colors.white }}>MP Tourify</h3>
//             </div>
            
//             <p className="text-gray-300 mb-6 max-w-md">
//               Stay connected with the latest stories, travel guides, and cultural insights from the heart of Madhya Pradesh.
//             </p>

//             {/* Official Tourism Link */}
//             <div className="mb-6">
//               <a 
//                 href="https://www.mptourism.com/" 
//                 target="_blank" 
//                 rel="noopener noreferrer"
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg"
//                 style={{ backgroundColor: colors.green }}
//               >
//                 <span>Madhya Pradesh Tourism Official</span>
//                 <ExternalLink size={16} />
//               </a>
//             </div>

//             {/* Project Credit */}
//             <div className="bg-gray-800 rounded-lg p-4 mb-6">
//               <p className="text-sm text-gray-300 italic">
//                 "A dedicated initiative to Madhya Pradesh Tourism Department"
//               </p>
//             </div>

//             {/* Newsletter Subscription */}
//             <div className="bg-gray-800 rounded-lg p-6">
//               <h4 className="font-semibold mb-4 text-lg">Stay Updated</h4>
//               <form onSubmit={handleSubscribe} className="space-y-4">
//                 <div className="flex gap-2">
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="Enter your email"
//                     className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent text-white placeholder-gray-400"
//                     required
//                   />
//                   <button
//                     type="submit"
//                     className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2"
//                     style={{ backgroundColor: colors.saffron }}
//                   >
//                     <Mail size={18} />
//                     Subscribe
//                   </button>
//                 </div>
//                 <p className="text-xs text-gray-400">
//                   By subscribing, you agree to our Privacy Policy and consent to receive updates.
//                 </p>
//               </form>
//             </div>
//           </div>

//           {/* Contact Information */}
//           <div>
//             <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Contact Info</h4>
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <Mail size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-sm text-gray-400">Email</p>
//                   <a 
//                     href="mailto:info@mptourify.com" 
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     info@mptourify.com
//                   </a>
//                 </div>
//               </div>
              
//               <div className="flex items-start gap-3">
//                 <Phone size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-sm text-gray-400">Phone</p>
//                   <a 
//                     href="tel:+911234567890" 
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     +91 12345 67890
//                   </a>
//                 </div>
//               </div>
              
//               <div className="flex items-start gap-3">
//                 <MapPin size={18} className="mt-1 flex-shrink-0" style={{ color: colors.saffron }} />
//                 <div>
//                   <p className="text-sm text-gray-400">Address</p>
//                   <p className="text-gray-300">
//                     Madhya Pradesh Tourism Board,<br />
//                     Bhopal, Madhya Pradesh - 462011
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Links & Social Media */}
//           <div>
//             <h4 className="font-bold text-lg mb-6" style={{ color: colors.saffron }}>Quick Links</h4>
//             <ul className="space-y-3 mb-8">
//               {['Home', 'Districts', 'Pandragrās', 'Gallery', 'News'].map((item) => (
//                 <li key={item}>
//                   <Link 
//                     href={`/${item.toLowerCase()}`}
//                     className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block"
//                   >
//                     {item}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             {/* Social Media Links */}
//             <div>
//               <h5 className="font-semibold mb-4" style={{ color: colors.saffron }}>Follow Us</h5>
//               <div className="flex gap-4">
//                 {[
//                   { icon: Facebook, href: "https://facebook.com/mptourism", color: "#1877F2" },
//                   { icon: Instagram, href: "https://instagram.com/mptourism", color: "#E4405F" },
//                   { icon: Youtube, href: "https://youtube.com/mptourism", color: "#FF0000" }
//                 ].map((social, index) => (
//                   <a
//                     key={index}
//                     href={social.href}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
//                     style={{ backgroundColor: social.color }}
//                   >
//                     <social.icon size={20} className="text-white" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Footer */}
//       <div className="border-t border-gray-700">
//         <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="flex items-center gap-2 text-gray-400 text-sm">
//               <span>© 2024 MP Tourify. All rights reserved</span>
//               <Heart size={14} style={{ color: colors.saffron }} fill={colors.saffron} />
//             </div>
            
//             <div className="flex flex-wrap gap-6 text-sm">
//               <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
//                 Privacy Policy
//               </Link>
//               <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
//                 Terms of Service
//               </Link>
//               <Link href="/cookies-settings" className="text-gray-400 hover:text-white transition-colors">
//                 Cookies Settings
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }