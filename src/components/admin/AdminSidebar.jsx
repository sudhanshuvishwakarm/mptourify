'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '@/redux/slices/adminSlice.js';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Image as ImageIcon,
  Newspaper,
  MessageSquare,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentAdmin } = useSelector((state) => state.admin);

  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // LOGOUT HANDLER
  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // MENU ITEMS
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      roles: ['admin', 'rtc']
    },
    {
      title: 'Users Management',
      icon: Users,
      roles: ['admin'],
      submenu: [
        { title: 'All Users', href: '/admin/users' },
        { title: 'Create User', href: '/admin/users/create' },
      ]
    },
    {
      title: 'Districts',
      icon: MapPin,
      roles: ['admin'],
      submenu: [
        { title: 'All Districts', href: '/admin/districts' },
        { title: 'Create District', href: '/admin/districts/create' },
      ]
    },
    {
      title: 'Gram Panchayats',
      icon: Building2,
      roles: ['admin', 'rtc'],
      submenu: [
        { title: 'All Panchayats', href: '/admin/panchayats' },
        { title: 'Create Panchayat', href: '/admin/panchayats/create' },
      ]
    },
    {
      title: 'Media Gallery',
      icon: ImageIcon,
      roles: ['admin', 'rtc'],
      submenu: [
        { title: 'All Media', href: '/admin/media' },
        { title: 'Upload Media', href: '/admin/media/upload' },
      ]
    },
    {
      title: 'News & Updates',
      icon: Newspaper,
      roles: ['admin'],
      submenu: [
        { title: 'All News', href: '/admin/news' },
        { title: 'Create News', href: '/admin/news/create' },
      ]
    },
    {
      title: 'Contacts',
      icon: MessageSquare,
      href: '/admin/contacts',
      roles: ['admin']
    },
    {
      title: 'Reports & Stats',
      icon: BarChart3,
      href: '/admin/reports',
      roles: ['admin', 'rtc']
    },
  ];

  // FILTER MENU BY ROLE
  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(currentAdmin?.role)
  );

  // CHECK ACTIVE LINK
  const isActive = (href) => pathname === href;
  const isParentActive = (submenu) => submenu?.some(item => pathname === item.href);

  // TOGGLE SUBMENU
  const toggleSubmenu = (title) => {
    setExpandedMenu(expandedMenu === title ? null : title);
  };

  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-blue-50 transition-colors"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-blue-600" />
        ) : (
          <Menu className="h-6 w-6 text-blue-600" />
        )}
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-blue-100 shadow-xl z-40 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static w-64 flex flex-col`}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">MP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">MP Tourify</h1>
              <p className="text-xs text-blue-100">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* USER INFO */}
        <div 
          onClick={() => router.push('/admin/profile')} 
          className="p-4 border-b border-blue-100 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
              {currentAdmin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentAdmin?.name}
              </p>
              <p className="text-xs text-blue-600 capitalize font-medium">
                {currentAdmin?.role}
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* HOME LINK */}
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200 border border-transparent"
          >
            <Home className="h-5 w-5" />
            <span className="text-sm font-medium">View Website</span>
          </Link>

          {/* MENU ITEMS */}
          {filteredMenu.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                /* WITH SUBMENU */
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-all duration-200 border ${
                      isParentActive(item.submenu)
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'text-black hover:bg-blue-50 hover:text-blue-600 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedMenu === item.title ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* SUBMENU */}
                  {expandedMenu === item.title && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-200 pl-4">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          href={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2 text-sm rounded-lg transition-all duration-200 border ${
                            isActive(subItem.href)
                              ? 'bg-blue-100 text-blue-700 font-medium border-blue-200'
                              : 'text-black font-semibold hover:bg-blue-50 hover:text-blue-600 border-transparent'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* WITHOUT SUBMENU */
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 font-medium border-blue-200 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-transparent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-blue-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}// 'use client'
// import React, { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { logoutAdmin } from '@/redux/slices/adminSlice.js';
// import { toast } from 'react-toastify';
// import {
//   LayoutDashboard,
//   MapPin,
//   Building2,
//   Image as ImageIcon,
//   Newspaper,
//   MessageSquare,
//   Users,
//   BarChart3,
//   LogOut,
//   Menu,
//   X,
//   ChevronDown,
//   Home
// } from 'lucide-react';

// export default function AdminSidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { currentAdmin } = useSelector((state) => state.admin);

//   const [isOpen, setIsOpen] = useState(false);
//   const [expandedMenu, setExpandedMenu] = useState(null);

//   // LOGOUT HANDLER
//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutAdmin()).unwrap();
//       toast.success('Logged out successfully');
//       router.push('/admin/login');
//     } catch (error) {
//       toast.error('Logout failed');
//     }
//   };

//   // MENU ITEMS
//   const menuItems = [
//     {
//       title: 'Dashboard',
//       icon: LayoutDashboard,
//       href: '/admin/dashboard',
//       roles: ['admin', 'rtc']
//     },
//     {
//       title: 'Users Management',
//       icon: Users,
//       roles: ['admin'],
//       submenu: [
//         { title: 'All Users', href: '/admin/users' },
//         { title: 'Create User', href: '/admin/users/create' },
//       ]
//     },
//     {
//       title: 'Districts',
//       icon: MapPin,
//       roles: ['admin'],
//       submenu: [
//         { title: 'All Districts', href: '/admin/districts' },
//         { title: 'Create District', href: '/admin/districts/create' },
//       ]
//     },
//     {
//       title: 'Gram Panchayats',
//       icon: Building2,
//       roles: ['admin', 'rtc'],
//       submenu: [
//         { title: 'All Panchayats', href: '/admin/panchayats' },
//         { title: 'Create Panchayat', href: '/admin/panchayats/create' },
//       ]
//     },
//     {
//       title: 'Media Gallery',
//       icon: ImageIcon,
//       roles: ['admin', 'rtc'],
//       submenu: [
//         { title: 'All Media', href: '/admin/media' },
//         { title: 'Upload Media', href: '/admin/media/upload' },
//       ]
//     },
//     {
//       title: 'News & Updates',
//       icon: Newspaper,
//       roles: ['admin'],
//       submenu: [
//         { title: 'All News', href: '/admin/news' },
//         { title: 'Create News', href: '/admin/news/create' },
//       ]
//     },
//     {
//       title: 'Contacts',
//       icon: MessageSquare,
//       href: '/admin/contacts',
//       roles: ['admin']
//     },
//     {
//       title: 'Reports & Stats',
//       icon: BarChart3,
//       href: '/admin/reports',
//       roles: ['admin', 'rtc']
//     },
//   ];

//   // FILTER MENU BY ROLE
//   const filteredMenu = menuItems.filter(item => 
//     item.roles.includes(currentAdmin?.role)
//   );

//   // CHECK ACTIVE LINK
//   const isActive = (href) => pathname === href;
//   const isParentActive = (submenu) => submenu?.some(item => pathname === item.href);

//   // TOGGLE SUBMENU
//   const toggleSubmenu = (title) => {
//     setExpandedMenu(expandedMenu === title ? null : title);
//   };

//   return (
//     <>
//       {/* MOBILE MENU BUTTON */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
//       >
//         {isOpen ? (
//           <X className="h-6 w-6 text-gray-700" />
//         ) : (
//           <Menu className="h-6 w-6 text-gray-700" />
//         )}
//       </button>

//       {/* OVERLAY */}
//       {isOpen && (
//         <div
//           onClick={() => setIsOpen(false)}
//           className="lg:hidden fixed inset-0 bg-black/50 z-40"
//         />
//       )}

//       {/* SIDEBAR */}
//       <aside
//         className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300 ${
//           isOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 lg:static w-64 flex flex-col`}
//       >
//         {/* HEADER */}
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">MP</span>
//             </div>
//             <div>
//               <h1 className="text-lg font-bold text-gray-900">MP Tourify</h1>
//               <p className="text-xs text-gray-500">Admin Panel</p>
//             </div>
//           </div>
//         </div>

//         {/* USER INFO */}
//         <div onClick={()=>router.push('/admin/profile')} className="p-4 border-b border-gray-200 bg-green-50 cursor-pointer">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
//               {currentAdmin?.name?.charAt(0).toUpperCase()}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-gray-900 truncate">
//                 {currentAdmin?.name}
//               </p>
//               <p className="text-xs text-gray-600 capitalize">
//                 {currentAdmin?.role}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* NAVIGATION */}
//         <nav className="flex-1 overflow-y-auto p-4 space-y-1">
//           {/* HOME LINK */}
//           <Link
//             href="/"
//             className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <Home className="h-5 w-5" />
//             <span className="text-sm font-medium">View Website</span>
//           </Link>

//           {/* MENU ITEMS */}
//           {filteredMenu.map((item, index) => (
//             <div key={index}>
//               {item.submenu ? (
//                 /* WITH SUBMENU */
//                 <div>
//                   <button
//                     onClick={() => toggleSubmenu(item.title)}
//                     className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
//                       isParentActive(item.submenu)
//                         ? 'bg-green-50 text-green-700'
//                         : 'text-gray-700 hover:bg-gray-100'
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <item.icon className="h-5 w-5" />
//                       <span className="text-sm font-medium">{item.title}</span>
//                     </div>
//                     <ChevronDown
//                       className={`h-4 w-4 transition-transform ${
//                         expandedMenu === item.title ? 'rotate-180' : ''
//                       }`}
//                     />
//                   </button>

//                   {/* SUBMENU */}
//                   {expandedMenu === item.title && (
//                     <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
//                       {item.submenu.map((subItem, subIndex) => (
//                         <Link
//                           key={subIndex}
//                           href={subItem.href}
//                           onClick={() => setIsOpen(false)}
//                           className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
//                             isActive(subItem.href)
//                               ? 'bg-green-100 text-green-700 font-medium'
//                               : 'text-gray-600 hover:bg-gray-100'
//                           }`}
//                         >
//                           {subItem.title}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 /* WITHOUT SUBMENU */
//                 <Link
//                   href={item.href}
//                   onClick={() => setIsOpen(false)}
//                   className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
//                     isActive(item.href)
//                       ? 'bg-green-50 text-green-700 font-medium'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <item.icon className="h-5 w-5" />
//                   <span className="text-sm font-medium">{item.title}</span>
//                 </Link>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* LOGOUT BUTTON */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//           >
//             <LogOut className="h-5 w-5" />
//             <span className="text-sm font-medium">Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }