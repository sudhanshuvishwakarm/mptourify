'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '@/redux/slices/adminSlice.js';
import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
import { Loader2 } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, currentAdmin } = useSelector((state) => state.admin);
  const [authChecked, setAuthChecked] = useState(false);

  // <CHANGE> Add initial auth check - only call once and track with authChecked flag
  useEffect(() => {
    if (pathname !== '/admin/login' && !authChecked) {
      dispatch(getProfile());
      setAuthChecked(true);
    }
  }, [dispatch, pathname, authChecked]);

  // <CHANGE> Only redirect after auth is checked and not loading
  useEffect(() => {
    if (authChecked && !loading) {
      if (!isAuthenticated && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [isAuthenticated, loading, pathname, router, authChecked]);

  // LOADING STATE
  if (loading || !authChecked) {
    if (pathname === '/admin/login') {
      return children;
    }
    return (
      <div className="fixed inset-0 z-[9999]">
          <Loader message={"Loading..."} />
        </div>
    );
  }

  // LOGIN PAGE (NO SIDEBAR)
  if (pathname === '/admin/login') {
    return children;
  }

  // ADMIN PANEL WITH SIDEBAR
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className=" p-2 lg:p-8 ">
          {children}
        </div>
      </main>
    </div>
  );
}
// 'use client'
// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';
// import { getProfile } from '@/redux/slices/adminSlice.js';
// import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
// import { Loader2 } from 'lucide-react';

// export default function AdminLayout({ children }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dispatch = useDispatch();
//   const { isAuthenticated, loading, currentAdmin } = useSelector((state) => state.admin);

//   useEffect(() => {
//     if (pathname !== '/admin/login') {
//       dispatch(getProfile());
//     }
//   }, [dispatch, pathname]);

//   useEffect(() => {
//     if (!loading && !isAuthenticated && pathname !== '/admin/login') {
//       router.push('/admin/login');
//     }

//   }, [isAuthenticated, loading, pathname, router]);

//   // LOADING STATE
//   if (loading && pathname !== '/admin/login') {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading admin panel...</p>
//         </div>
//       </div>
//     );
//   }

//   // LOGIN PAGE (NO SIDEBAR)
//   if (pathname === '/admin/login') {
//     return children;
//   }

//   // ADMIN PANEL WITH SIDEBAR
//   return (
//     <div className="flex h-screen bg-gray-50">
//       <AdminSidebar />
//       <main className="flex-1 overflow-y-auto">
//         <div className="p-6 lg:p-8">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }