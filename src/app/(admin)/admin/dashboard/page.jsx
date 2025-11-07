'use client'
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverviewStats } from '@/redux/slices/statsSlice';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Image as ImageIcon,
  Newspaper,
  Users,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { currentAdmin } = useSelector((state) => state.admin);
  const { overview, recentActivity, loading } = useSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchOverviewStats());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Districts',
      value: overview?.districts?.total || 0,
      icon: MapPin,
      change: '+2 this month'
    },
    {
      title: 'Gram Panchayats',
      value: overview?.panchayats?.total || 0,
      icon: Building2,
      change: `${overview?.panchayats?.verified || 0} verified`
    },
    {
      title: 'Media Files',
      value: overview?.media?.total || 0,
      icon: ImageIcon,
      change: `${overview?.media?.pending || 0} pending`
    },
    {
      title: 'News Articles',
      value: overview?.news?.total || 0,
      icon: Newspaper,
      change: `${overview?.news?.published || 0} published`
    },
  ];

  if (currentAdmin?.role === 'admin') {
    stats.push({
      title: 'Total Users',
      value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
      icon: Users,
      change: `${overview?.contacts?.new || 0} new contacts`
    });
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {currentAdmin?.name}! 👋
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Role</p>
          <p className="text-lg font-semibold text-[#144ae9] capitalize">
            {currentAdmin?.role}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200 hover:border-[#144ae9]/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm bg-[#144ae9]">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-[#144ae9]" />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-[#144ae9] font-medium mt-2">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT PANCHAYATS */}
        <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-[#144ae9]" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Panchayats</h2>
          </div>
          <div className="space-y-3">
            {recentActivity?.panchayats?.map((panchayat, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-gray-900">{panchayat.name}</p>
                  <p className="text-sm text-[#144ae9]">{panchayat.district?.name}</p>
                </div>
                <p className="text-xs text-[#144ae9] font-medium">
                  {new Date(panchayat.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT MEDIA */}
        <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-[#144ae9]" />
            <h2 className="text-lg font-semibold text-gray-900">Recent Media</h2>
          </div>
          <div className="space-y-3">
            {recentActivity?.media?.map((media, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#144ae9]/10 rounded-lg flex items-center justify-center border border-[#144ae9]/20">
                    <ImageIcon className="h-5 w-5 text-[#144ae9]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{media.title}</p>
                    <p className="text-sm text-[#144ae9] capitalize">{media.fileType}</p>
                  </div>
                </div>
                <p className="text-xs text-[#144ae9] font-medium">
                  {new Date(media.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMPTY STATE HANDLING */}
      {(!recentActivity?.panchayats?.length && !recentActivity?.media?.length) && (
        <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-8 text-center">
          <LayoutDashboard className="h-12 w-12 text-[#144ae9] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-[#144ae9]">Activity will appear here as users interact with the system.</p>
        </div>
      )}
    </div>
  );
}// 'use client'
// import { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOverviewStats } from '@/redux/slices/statsSlice';
// import {
//   LayoutDashboard,
//   MapPin,
//   Building2,
//   Image as ImageIcon,
//   Newspaper,
//   Users,
//   TrendingUp
// } from 'lucide-react';

// export default function AdminDashboard() {
//   const dispatch = useDispatch();
//   const { currentAdmin } = useSelector((state) => state.admin);
//   const { overview, recentActivity, loading } = useSelector((state) => state.stats);

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//   }, [dispatch]);

//   const stats = [
//     {
//       title: 'Total Districts',
//       value: overview?.districts?.total || 0,
//       icon: MapPin,
//       color: 'bg-blue-500',
//       change: '+2 this month'
//     },
//     {
//       title: 'Gram Panchayats',
//       value: overview?.panchayats?.total || 0,
//       icon: Building2,
//       color: 'bg-green-500',
//       change: `${overview?.panchayats?.verified || 0} verified`
//     },
//     {
//       title: 'Media Files',
//       value: overview?.media?.total || 0,
//       icon: ImageIcon,
//       color: 'bg-purple-500',
//       change: `${overview?.media?.pending || 0} pending`
//     },
//     {
//       title: 'News Articles',
//       value: overview?.news?.total || 0,
//       icon: Newspaper,
//       color: 'bg-orange-500',
//       change: `${overview?.news?.published || 0} published`
//     },
//   ];

//   if (currentAdmin?.role === 'admin') {
//     stats.push({
//       title: 'Total Users',
//       value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
//       icon: Users,
//       color: 'bg-pink-500',
//       change: `${overview?.contacts?.new || 0} new contacts`
//     });
//   }

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600 mt-1">
//             Welcome back, {currentAdmin?.name}! 👋
//           </p>
//         </div>
//         <div className="text-right">
//           <p className="text-sm text-gray-500">Role</p>
//           <p className="text-lg font-semibold text-green-600 capitalize">
//             {currentAdmin?.role}
//           </p>
//         </div>
//       </div>

//       {/* STATS GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center justify-between mb-4">
//               <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
//                 <stat.icon className="h-6 w-6 text-white" />
//               </div>
//               <TrendingUp className="h-5 w-5 text-green-500" />
//             </div>
//             <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
//             <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
//             <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
//           </div>
//         ))}
//       </div>

//       {/* RECENT ACTIVITY */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* RECENT PANCHAYATS */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Panchayats</h2>
//           <div className="space-y-3">
//             {recentActivity?.panchayats?.map((panchayat, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div>
//                   <p className="font-medium text-gray-900">{panchayat.name}</p>
//                   <p className="text-sm text-gray-500">{panchayat.district?.name}</p>
//                 </div>
//                 <p className="text-xs text-gray-400">
//                   {new Date(panchayat.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* RECENT MEDIA */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Media</h2>
//           <div className="space-y-3">
//             {recentActivity?.media?.map((media, index) => (
//               <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <ImageIcon className="h-5 w-5 text-purple-600" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{media.title}</p>
//                     <p className="text-sm text-gray-500 capitalize">{media.fileType}</p>
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-400">
//                   {new Date(media.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }