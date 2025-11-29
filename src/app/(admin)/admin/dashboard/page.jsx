'use client'
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverviewStats } from '@/redux/slices/statsSlice';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Image as ImageIcon,
  Newspaper,
  Users,
  Video
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const { currentAdmin } = useSelector((state) => state.admin);
  const { overview, recentActivity, loading } = useSelector((state) => state.stats);

  useEffect(() => {
    dispatch(fetchOverviewStats());
  }, [dispatch]);

  const stats = useMemo(() => {
    const baseStats = [
      {
        title: 'Districts',
        value: overview?.districts?.total || 0,
        icon: MapPin,
      },
      {
        title: 'Gram Panchayats',
        value: overview?.panchayats?.total || 0,
        icon: Building2,
      },
      {
        title: 'Media Files',
        value: overview?.media?.total || 0,
        icon: ImageIcon,
      },
      {
        title: 'News Articles',
        value: overview?.news?.total || 0,
        icon: Newspaper,
      },
    ];

    if (currentAdmin?.role === 'admin') {
      baseStats.push({
        title: 'Total Users',
        value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
        icon: Users,
      });
    }

    return baseStats;
  }, [overview, currentAdmin]);

  const hasActivity = useMemo(() => 
    recentActivity?.panchayats?.length > 0 || recentActivity?.media?.length > 0,
    [recentActivity]
  );

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Function to get appropriate icon based on file type
  const getMediaIcon = (fileType) => {
    return fileType === 'video' ? Video : ImageIcon;
  };

  // Function to get background color based on file type
  const getMediaBgColor = (fileType) => {
    return fileType === 'video' ? 'bg-red-500' : 'bg-[#1348e7]';
  };

  if (loading && !overview) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Dashboard..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-6 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Welcome back, <span className="font-semibold text-[#1348e7]">{currentAdmin?.name}</span> 👋
          </p>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Role</p>
          <p className="text-base font-semibold text-[#1348e7] capitalize">
            {currentAdmin?.role}
          </p>
        </div>
      </div>

      {/* SIMPLIFIED STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#1348e7] transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-[#1348e7] flex items-center justify-center flex-shrink-0">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium mb-1 truncate">
                  {stat.title}
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      {hasActivity ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* RECENT PANCHAYATS */}
          {recentActivity?.panchayats?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="h-8 w-8 text-[#1348e7]" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Panchayats</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {recentActivity.panchayats.map((panchayat, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Panchayat Thumbnail - Using headerImage */}
                      <div className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                        {panchayat.headerImage ? (
                          <img 
                            src={panchayat.headerImage} 
                            alt={panchayat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback Icon for Panchayat */}
                        <div 
                          className={`w-full h-full flex items-center justify-center bg-[#1348e7] ${panchayat.headerImage ? 'hidden' : 'flex'}`}
                        >
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">{panchayat.name}</p>
                        <p className="text-xs text-[#1348e7] truncate mt-1">{panchayat.district?.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(panchayat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT MEDIA */}
          {recentActivity?.media?.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-8 w-8 text-[#1348e7]" />
                  <h2 className="text-lg font-semibold text-gray-900">Recent Media</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {recentActivity.media.map((media, index) => {
                  const MediaIcon = getMediaIcon(media.fileType);
                  const bgColor = getMediaBgColor(media.fileType);
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Media Thumbnail */}
                        <div className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-200">
                          {media.thumbnailUrl || media.fileUrl ? (
                            <img 
                              src={media.thumbnailUrl || media.fileUrl} 
                              alt={media.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback Icon for Media */}
                          <div 
                            className={`w-full h-full flex items-center justify-center ${bgColor} ${(media.thumbnailUrl || media.fileUrl) ? 'hidden' : 'flex'}`}
                          >
                            <MediaIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{media.title}</p>
                          <p className="text-xs text-[#1348e7] capitalize mt-1">{media.fileType}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {new Date(media.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <LayoutDashboard className="h-12 w-12 text-[#1348e7] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-gray-600 text-sm">Activity will appear here as users interact with the system.</p>
        </div>
      )}
    </div>
  );
}



// 'use client'
// import { useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOverviewStats } from '@/redux/slices/statsSlice';
// import {
//   LayoutDashboard,
//   MapPin,
//   Building2,
//   Image as ImageIcon,
//   Newspaper,
//   Users
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function AdminDashboard() {
//   const dispatch = useDispatch();
//   const { currentAdmin } = useSelector((state) => state.admin);
//   const { overview, recentActivity, loading } = useSelector((state) => state.stats);

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//   }, [dispatch]);

//   const stats = useMemo(() => {
//     const baseStats = [
//       {
//         title: 'Districts',
//         value: overview?.districts?.total || 0,
//         icon: MapPin,
//       },
//       {
//         title: 'Gram Panchayats',
//         value: overview?.panchayats?.total || 0,
//         icon: Building2,
//       },
//       {
//         title: 'Media Files',
//         value: overview?.media?.total || 0,
//         icon: ImageIcon,
//       },
//       {
//         title: 'News Articles',
//         value: overview?.news?.total || 0,
//         icon: Newspaper,
//       },
//     ];

//     if (currentAdmin?.role === 'admin') {
//       baseStats.push({
//         title: 'Total Users',
//         value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
//         icon: Users,
//       });
//     }

//     return baseStats;
//   }, [overview, currentAdmin]);

//   const hasActivity = useMemo(() => 
//     recentActivity?.panchayats?.length > 0 || recentActivity?.media?.length > 0,
//     [recentActivity]
//   );

//   const formatNumber = (num) => {
//     if (num >= 1000000) {
//       return (num / 1000000).toFixed(1) + 'M';
//     }
//     if (num >= 1000) {
//       return (num / 1000).toFixed(1) + 'K';
//     }
//     return num.toString();
//   };

//   if (loading && !overview) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Dashboard..."} />
//         </div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 space-y-6 p-4 sm:p-6">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="space-y-2">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//             Dashboard
//           </h1>
//           <p className="text-gray-600 text-sm sm:text-base">
//             Welcome back, <span className="font-semibold text-[#1348e7]">{currentAdmin?.name}</span> 👋
//           </p>
//         </div>
//         <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
//           <p className="text-xs text-gray-500 font-medium">Role</p>
//           <p className="text-base font-semibold text-[#1348e7] capitalize">
//             {currentAdmin?.role}
//           </p>
//         </div>
//       </div>

//       {/* SIMPLIFIED STATS GRID */}
//       <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
//         {stats.map((stat, index) => (
//           <div 
//             key={index} 
//             className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#1348e7] transition-colors duration-200"
//           >
//             <div className="flex items-center gap-3">
//               <div className="w-14 h-14 rounded-lg bg-[#1348e7] flex items-center justify-center flex-shrink-0">
//                 <stat.icon className="h-8 w-8 text-white" />
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs text-gray-500 font-medium mb-1 truncate">
//                   {stat.title}
//                 </p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {formatNumber(stat.value)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* RECENT ACTIVITY */}
//       {hasActivity ? (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//           {/* RECENT PANCHAYATS */}
//           {recentActivity?.panchayats?.length > 0 && (
//             <div className="bg-white rounded-lg border border-gray-200">
//               <div className="p-4 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <Building2 className="h-8 w-8 text-[#1348e7]" />
//                   <h2 className="text-lg font-semibold text-gray-900">Recent Panchayats</h2>
//                 </div>
//               </div>
//               <div className="p-4 space-y-3">
//                 {recentActivity.panchayats.map((panchayat, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//                   >
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-gray-900 text-sm truncate">{panchayat.name}</p>
//                       <p className="text-xs text-[#1348e7] truncate mt-1">{panchayat.district?.name}</p>
//                     </div>
//                     <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
//                       {new Date(panchayat.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* RECENT MEDIA */}
//           {recentActivity?.media?.length > 0 && (
//             <div className="bg-white rounded-lg border border-gray-200">
//               <div className="p-4 border-b border-gray-200">
//                 <div className="flex items-center gap-2">
//                   <ImageIcon className="h-8 w-8 text-[#1348e7]" />
//                   <h2 className="text-lg font-semibold text-gray-900">Recent Media</h2>
//                 </div>
//               </div>
//               <div className="p-4 space-y-3">
//                 {recentActivity.media.map((media, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
//                   >
//                     <div className="flex items-center gap-3 min-w-0 flex-1">
//                       <div className="w-12 h-12 bg-[#1348e7] rounded-md flex items-center justify-center flex-shrink-0">
//                         <ImageIcon className="h-8 w-8  text-white" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="font-medium text-gray-900 text-sm truncate">{media.title}</p>
//                         <p className="text-xs text-[#1348e7] capitalize mt-1">{media.fileType}</p>
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500 whitespace-nowrap ml-2">
//                       {new Date(media.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
//           <LayoutDashboard className="h-12 w-12 text-[#1348e7] mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
//           <p className="text-gray-600 text-sm">Activity will appear here as users interact with the system.</p>
//         </div>
//       )}
//     </div>
//   );
// }


// 'use client'
// import { useEffect, useMemo } from 'react';
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
// import Loader from '@/components/ui/Loader';

// export default function AdminDashboard() {
//   const dispatch = useDispatch();
//   const { currentAdmin } = useSelector((state) => state.admin);
//   const { overview, recentActivity, loading } = useSelector((state) => state.stats);

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//   }, [dispatch]);

//   const stats = useMemo(() => {
//     const baseStats = [
//       {
//         title: 'Total Districts',
//         value: overview?.districts?.total || 0,
//         icon: MapPin,
//         change: '+2 this month'
//       },
//       {
//         title: 'Gram Panchayats',
//         value: overview?.panchayats?.total || 0,
//         icon: Building2,
//         change: `${overview?.panchayats?.verified || 0} verified`
//       },
//       {
//         title: 'Media Files',
//         value: overview?.media?.total || 0,
//         icon: ImageIcon,
//         change: `${overview?.media?.pending || 0} pending`
//       },
//       {
//         title: 'News Articles',
//         value: overview?.news?.total || 0,
//         icon: Newspaper,
//         change: `${overview?.news?.published || 0} published`
//       },
//     ];

//     if (currentAdmin?.role === 'admin') {
//       baseStats.push({
//         title: 'Total Users',
//         value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
//         icon: Users,
//         change: `${overview?.contacts?.new || 0} new contacts`
//       });
//     }

//     return baseStats;
//   }, [overview, currentAdmin]);

//   const hasActivity = useMemo(() => 
//     recentActivity?.panchayats?.length > 0 || recentActivity?.media?.length > 0,
//     [recentActivity]
//   );

//   const formatNumber = (num) => {
//     if (num >= 1000000) {
//       return (num / 1000000).toFixed(1) + 'M';
//     }
//     if (num >= 1000) {
//       return (num / 1000).toFixed(1) + 'K';
//     }
//     return num.toString();
//   };

//   if (loading && !overview) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Dashboard..."} />
//         </div>;
//   }

//   return (
//     <div className="min-h-screen bg-blue-50/30 space-y-6 p-4 sm:p-6">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div className="space-y-2">
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
//             Dashboard Overview
//           </h1>
//           <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2">
//             <span>Welcome back,</span>
//             <span className="font-semibold text-blue-600">{currentAdmin?.name}</span>
//             <span>👋</span>
//           </p>
//         </div>
//         <div className="bg-white rounded-xl px-4 py-3 shadow-xs border border-blue-200 min-w-[140px]">
//           <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</p>
//           <p className="text-lg font-bold text-blue-600 capitalize mt-1">
//             {currentAdmin?.role}
//           </p>
//         </div>
//       </div>

//       {/* STATS GRID - ALL BLUE THEME */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
//         {stats.map((stat, index) => (
//           <div 
//             key={index} 
//             className="group bg-white rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden hover:scale-[1.02]"
//           >
//             <div className="p-5 sm:p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
//                   <stat.icon className="h-6 w-6 text-white" />
//                 </div>
//                 <div className="text-right">
//                   <TrendingUp className="h-5 w-5 text-blue-400 mb-1 ml-auto" />
//                   <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
//                     {stat.change}
//                   </p>
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <h3 className="text-gray-600 text-sm font-medium tracking-wide uppercase">
//                   {stat.title}
//                 </h3>
//                 <div className="flex items-baseline gap-2">
//                   <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
//                     {formatNumber(stat.value)}
//                   </p>
//                   {stat.value > 0 && (
//                     <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
//                       +{Math.min(stat.value, 99)}%
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* RECENT ACTIVITY - ALL BLUE THEME */}
//       {hasActivity ? (
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//           {/* RECENT PANCHAYATS */}
//           {recentActivity?.panchayats?.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-xs border border-blue-100 overflow-hidden">
//               <div className="p-6 border-b border-blue-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
//                     <Building2 className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-900">Recent Panchayats</h2>
//                     <p className="text-sm text-gray-600">Newly added gram panchayats</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="p-4 space-y-3">
//                 {recentActivity.panchayats.map((panchayat, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
//                   >
//                     <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
//                       {index + 1}
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">
//                         {panchayat.name}
//                       </p>
//                       <p className="text-xs text-blue-600 font-medium truncate mt-1">
//                         {panchayat.district?.name}
//                       </p>
//                     </div>
//                     <div className="flex-shrink-0 text-right">
//                       <p className="text-xs font-medium text-blue-600 whitespace-nowrap">
//                         {new Date(panchayat.createdAt).toLocaleDateString('en-US', {
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </p>
//                       <p className="text-xs text-blue-400 mt-1">
//                         {new Date(panchayat.createdAt).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* RECENT MEDIA */}
//           {recentActivity?.media?.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-xs border border-blue-100 overflow-hidden">
//               <div className="p-6 border-b border-blue-100">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200">
//                     <ImageIcon className="h-5 w-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-900">Recent Media</h2>
//                     <p className="text-sm text-gray-600">Latest uploaded files</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="p-4 space-y-3">
//                 {recentActivity.media.map((media, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center gap-4 p-4 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group"
//                   >
//                     <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border border-blue-200">
//                       <ImageIcon className="h-6 w-6 text-white" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">
//                         {media.title}
//                       </p>
//                       <div className="flex items-center gap-2 mt-1">
//                         <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full capitalize">
//                           {media.fileType}
//                         </span>
//                         <span className="text-xs text-blue-500">
//                           {media.fileSize || 'N/A'}
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex-shrink-0 text-right">
//                       <p className="text-xs font-medium text-blue-600 whitespace-nowrap">
//                         {new Date(media.createdAt).toLocaleDateString('en-US', {
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </p>
//                       <p className="text-xs text-blue-400 mt-1">
//                         {new Date(media.createdAt).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-2xl shadow-xs border border-blue-100 p-8 sm:p-12 text-center">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-200">
//             <LayoutDashboard className="h-10 w-10 text-blue-400" />
//           </div>
//           <h3 className="text-xl font-semibold text-gray-900 mb-3">No Recent Activity</h3>
//           <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
//             Activity will appear here as users interact with the system. Check back later for updates.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }


// 'use client'
// import { useEffect, useMemo } from 'react';
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
// import Loader from '@/components/ui/Loader';

// export default function AdminDashboard() {
//   const dispatch = useDispatch();
//   const { currentAdmin } = useSelector((state) => state.admin);
//   const { overview, recentActivity, loading } = useSelector((state) => state.stats);

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//   }, [dispatch]);

//   const stats = useMemo(() => {
//     const baseStats = [
//       {
//         title: 'Total Districts',
//         value: overview?.districts?.total || 0,
//         icon: MapPin,
//         change: '+2 this month'
//       },
//       {
//         title: 'Gram Panchayats',
//         value: overview?.panchayats?.total || 0,
//         icon: Building2,
//         change: `${overview?.panchayats?.verified || 0} verified`
//       },
//       {
//         title: 'Media Files',
//         value: overview?.media?.total || 0,
//         icon: ImageIcon,
//         change: `${overview?.media?.pending || 0} pending`
//       },
//       {
//         title: 'News Articles',
//         value: overview?.news?.total || 0,
//         icon: Newspaper,
//         change: `${overview?.news?.published || 0} published`
//       },
//     ];

//     if (currentAdmin?.role === 'admin') {
//       baseStats.push({
//         title: 'Total Users',
//         value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
//         icon: Users,
//         change: `${overview?.contacts?.new || 0} new contacts`
//       });
//     }

//     return baseStats;
//   }, [overview, currentAdmin]);

//   const hasActivity = useMemo(() => 
//     recentActivity?.panchayats?.length > 0 || recentActivity?.media?.length > 0,
//     [recentActivity]
//   );

//   if (loading && !overview) {
//     return <Loader  />;
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div>
//           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
//           <p className="text-gray-600 mt-1 text-sm sm:text-base">
//             Welcome back, {currentAdmin?.name}! 👋
//           </p>
//         </div>
//         <div className="text-left sm:text-right">
//           <p className="text-sm text-gray-500">Role</p>
//           <p className="text-base sm:text-lg font-semibold text-[#144ae9] capitalize">
//             {currentAdmin?.role}
//           </p>
//         </div>
//       </div>

//       {/* STATS GRID */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
//         {stats.map((stat, index) => (
//           <div 
//             key={index} 
//             className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-[#144ae9]/40"
//           >
//             <div className="flex items-center justify-between mb-3 sm:mb-4">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shadow-sm bg-[#144ae9]">
//                 <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
//               </div>
//               <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#144ae9]" />
//             </div>
//             <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
//             <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
//             <p className="text-xs text-[#144ae9] font-medium mt-2">{stat.change}</p>
//           </div>
//         ))}
//       </div>

//       {/* RECENT ACTIVITY */}
//       {hasActivity ? (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//           {/* RECENT PANCHAYATS */}
//           {recentActivity?.panchayats?.length > 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
//               <div className="flex items-center gap-2 mb-4">
//                 <Building2 className="h-5 w-5 text-[#144ae9]" />
//                 <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Panchayats</h2>
//               </div>
//               <div className="space-y-2 sm:space-y-3">
//                 {recentActivity.panchayats.map((panchayat, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center justify-between p-2 sm:p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
//                   >
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{panchayat.name}</p>
//                       <p className="text-xs sm:text-sm text-[#144ae9] truncate">{panchayat.district?.name}</p>
//                     </div>
//                     <p className="text-xs text-[#144ae9] font-medium ml-2 whitespace-nowrap">
//                       {new Date(panchayat.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* RECENT MEDIA */}
//           {recentActivity?.media?.length > 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
//               <div className="flex items-center gap-2 mb-4">
//                 <ImageIcon className="h-5 w-5 text-[#144ae9]" />
//                 <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Media</h2>
//               </div>
//               <div className="space-y-2 sm:space-y-3">
//                 {recentActivity.media.map((media, index) => (
//                   <div 
//                     key={index} 
//                     className="flex items-center justify-between p-2 sm:p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
//                   >
//                     <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                       <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#144ae9]/10 rounded-lg flex items-center justify-center border border-[#144ae9]/20 flex-shrink-0">
//                         <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#144ae9]" />
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{media.title}</p>
//                         <p className="text-xs sm:text-sm text-[#144ae9] capitalize">{media.fileType}</p>
//                       </div>
//                     </div>
//                     <p className="text-xs text-[#144ae9] font-medium ml-2 whitespace-nowrap">
//                       {new Date(media.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 sm:p-8 text-center">
//           <LayoutDashboard className="h-10 w-10 sm:h-12 sm:w-12 text-[#144ae9] mx-auto mb-4" />
//           <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
//           <p className="text-sm sm:text-base text-[#144ae9]">Activity will appear here as users interact with the system.</p>
//         </div>
//       )}
//     </div>
//   );
// }



// 'use client'
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
// import Loader from '@/components/ui/Loader';

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
//       change: '+2 this month'
//     },
//     {
//       title: 'Gram Panchayats',
//       value: overview?.panchayats?.total || 0,
//       icon: Building2,
//       change: `${overview?.panchayats?.verified || 0} verified`
//     },
//     {
//       title: 'Media Files',
//       value: overview?.media?.total || 0,
//       icon: ImageIcon,
//       change: `${overview?.media?.pending || 0} pending`
//     },
//     {
//       title: 'News Articles',
//       value: overview?.news?.total || 0,
//       icon: Newspaper,
//       change: `${overview?.news?.published || 0} published`
//     },
//   ];

//   if (currentAdmin?.role === 'admin') {
//     stats.push({
//       title: 'Total Users',
//       value: (overview?.admins?.total || 0) + (overview?.admins?.rtcs || 0),
//       icon: Users,
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
//           <p className="text-lg font-semibold text-[#144ae9] capitalize">
//             {currentAdmin?.role}
//           </p>
//         </div>
//       </div>

//       {/* STATS GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <div 
//             key={index} 
//             className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200 hover:border-[#144ae9]/40"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm bg-[#144ae9]">
//                 <stat.icon className="h-6 w-6 text-white" />
//               </div>
//               <TrendingUp className="h-5 w-5 text-[#144ae9]" />
//             </div>
//             <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
//             <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
//             <p className="text-xs text-[#144ae9] font-medium mt-2">{stat.change}</p>
//           </div>
//         ))}
//       </div>

//       {/* RECENT ACTIVITY */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* RECENT PANCHAYATS */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200">
//           <div className="flex items-center gap-2 mb-4">
//             <Building2 className="h-5 w-5 text-[#144ae9]" />
//             <h2 className="text-lg font-semibold text-gray-900">Recent Panchayats</h2>
//           </div>
//           <div className="space-y-3">
//             {recentActivity?.panchayats?.map((panchayat, index) => (
//               <div 
//                 key={index} 
//                 className="flex items-center justify-between p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
//               >
//                 <div>
//                   <p className="font-medium text-gray-900">{panchayat.name}</p>
//                   <p className="text-sm text-[#144ae9]">{panchayat.district?.name}</p>
//                 </div>
//                 <p className="text-xs text-[#144ae9] font-medium">
//                   {new Date(panchayat.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* RECENT MEDIA */}
//         <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-6 hover:shadow-md transition-all duration-200">
//           <div className="flex items-center gap-2 mb-4">
//             <ImageIcon className="h-5 w-5 text-[#144ae9]" />
//             <h2 className="text-lg font-semibold text-gray-900">Recent Media</h2>
//           </div>
//           <div className="space-y-3">
//             {recentActivity?.media?.map((media, index) => (
//               <div 
//                 key={index} 
//                 className="flex items-center justify-between p-3 bg-[#144ae9]/5 rounded-lg border border-[#144ae9]/10 hover:bg-[#144ae9]/10 transition-colors duration-200"
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-[#144ae9]/10 rounded-lg flex items-center justify-center border border-[#144ae9]/20">
//                     <ImageIcon className="h-5 w-5 text-[#144ae9]" />
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{media.title}</p>
//                     <p className="text-sm text-[#144ae9] capitalize">{media.fileType}</p>
//                   </div>
//                 </div>
//                 <p className="text-xs text-[#144ae9] font-medium">
//                   {new Date(media.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* EMPTY STATE HANDLING */}
//       {(!recentActivity?.panchayats?.length && !recentActivity?.media?.length) && (
//         <div className="bg-white rounded-xl shadow-sm border border-[#144ae9]/20 p-8 text-center">
//           <LayoutDashboard className="h-12 w-12 text-[#144ae9] mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
//           <p className="text-[#144ae9]">Activity will appear here as users interact with the system.</p>
//         </div>
//       )}
//     </div>
//   );
// }
