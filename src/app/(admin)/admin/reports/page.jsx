'use client'

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAdmins, deleteAdmin, updateAdminStatus, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  IconButton,
  Avatar,
  Divider
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function RTCListPage() {
  const dispatch = useDispatch();
  const { admins, loading, error, success, stats } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    role: 'rtc',
    status: '',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);

  useEffect(() => {
    const params = { role: 'rtc', limit: 100 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    dispatch(fetchAllAdmins(params));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      handleSearch();
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error]);

  const handleSearch = useCallback(() => {
    const params = { role: 'rtc', limit: 100 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    dispatch(fetchAllAdmins(params));
  }, [filters, dispatch]);

  const handleReset = useCallback(() => {
    setFilters({ role: 'rtc', status: '', search: '' });
    dispatch(fetchAllAdmins({ role: 'rtc', limit: 100 }));
  }, [dispatch]);

  const handleDelete = useCallback(async (id) => {
    try {
      await dispatch(deleteAdmin(id)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const handleStatusChange = useCallback(async (id, status) => {
    try {
      await dispatch(updateAdminStatus({ id, status })).unwrap();
      setStatusConfirm(null);
    } catch (err) {
      console.error(err);
    }
  }, [dispatch]);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ], []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'inactive':
        return { backgroundColor: '#6b7280', color: 'white' };
      case 'suspended':
        return { backgroundColor: '#ef4444', color: 'white' };
      default:
        return { backgroundColor: '#f59e0b', color: 'white' };
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} />;
      case 'inactive':
        return <Clock size={14} />;
      case 'suspended':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  }, []);

  const rtcList = useMemo(() => 
    admins.filter(admin => admin.role === 'rtc'),
    [admins]
  );

  if (loading && !rtcList.length) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {/* HEADER */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2, 
        mb: { xs: 3, sm: 4 } 
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Users size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              RTC Management ({rtcList.length})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Manage Rural Tourism Coordinators
          </Typography>
        </Box>
        <Link href="/admin/rtc/create" style={{ textDecoration: 'none', width: { xs: '100%', sm: 'auto' } }}>
          <Button
            startIcon={<Plus size={18} />}
            fullWidth
            sx={{
              backgroundColor: '#144ae9',
              color: 'white',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Add RTC
          </Button>
        </Link>
      </Box>

      {/* FILTERS */}
      <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1.5, sm: 2 }, 
          alignItems: 'stretch',
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap'
        }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
            <TextField
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or email..."
              startIcon={<Search size={18} color="#144ae9" />}
              fullWidth
              sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
            />
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
            <SelectField
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={statusOptions}
              fullWidth
              sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              onClick={handleSearch}
              disabled={loading}
              startIcon={<Filter size={16} />}
              sx={{
                backgroundColor: '#144ae9',
                color: 'white',
                height: { xs: '44px', sm: '56px' },
                minWidth: { xs: '0', sm: '100px' },
                flex: { xs: 1, sm: 'unset' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': { backgroundColor: '#0d3ec7' },
                '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{
                borderColor: '#144ae9',
                color: '#144ae9',
                height: { xs: '44px', sm: '56px' },
                minWidth: { xs: '0', sm: '100px' },
                flex: { xs: 1, sm: 'unset' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': { borderColor: '#0d3ec7', backgroundColor: '#144ae910' }
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Card>

      {/* RTC GRID */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {rtcList.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: { xs: 4, sm: 8 }, textAlign: 'center', border: '1px solid #144ae920' }}>
              <Users size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                No RTCs found
              </Typography>
            </Card>
          </Grid>
        ) : (
          rtcList.map((rtc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={rtc._id}>
              <Card 
                sx={{ 
                  border: '1px solid #144ae920',
                  transition: 'all 0.2s',
                  height: '100%',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: '#144ae9'
                  }
                }}
              >
                {/* HEADER */}
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  backgroundColor: '#144ae905',
                  borderBottom: '1px solid #144ae920'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar 
                      src={rtc.avatar} 
                      sx={{ 
                        width: { xs: 48, sm: 56 }, 
                        height: { xs: 48, sm: 56 }, 
                        backgroundColor: '#144ae9',
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                      }}
                    >
                      {rtc.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Chip
                      icon={getStatusIcon(rtc.status)}
                      label={rtc.status}
                      size="small"
                      sx={{
                        ...getStatusColor(rtc.status),
                        fontWeight: 600,
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        textTransform: 'capitalize'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }} noWrap>
                    {rtc.name}
                  </Typography>
                  <Typography variant="caption" color="#144ae9" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 500 }}>
                    Rural Tourism Coordinator
                  </Typography>
                </Box>

                {/* CONTENT */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Mail size={14} color="#144ae9" className="sm:w-4 sm:h-4" style={{ flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} noWrap>
                        {rtc.email}
                      </Typography>
                    </Box>
                    {rtc.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Phone size={14} color="#144ae9" className="sm:w-4 sm:h-4" style={{ flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {rtc.phone}
                        </Typography>
                      </Box>
                    )}
                    {rtc.district && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <MapPin size={14} color="#144ae9" className="sm:w-4 sm:h-4" style={{ flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} noWrap>
                          {rtc.district?.name || 'Not assigned'}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* ACTIONS */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Link href={`/admin/reports/rtc/${rtc._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '70px' }}>
                      <Button
                        fullWidth
                        startIcon={<Eye size={14} />}
                        sx={{
                          backgroundColor: '#144ae910',
                          color: '#144ae9',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          py: { xs: 0.75, sm: 1 },
                          '&:hover': { backgroundColor: '#144ae920' }
                        }}
                      >
                        View
                      </Button>
                    </Link>
                    <Link href={`/admin/rtc/${rtc._id}/edit`} style={{ textDecoration: 'none', flex: 1, minWidth: '70px' }}>
                      <Button
                        fullWidth
                        startIcon={<Edit size={14} />}
                        sx={{
                          backgroundColor: '#144ae910',
                          color: '#144ae9',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          py: { xs: 0.75, sm: 1 },
                          '&:hover': { backgroundColor: '#144ae920' }
                        }}
                      >
                        Edit
                      </Button>
                    </Link>
                    <IconButton
                      onClick={() => setDeleteConfirm(rtc._id)}
                      sx={{
                        color: '#d32f2f',
                        backgroundColor: '#d32f2f10',
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        '&:hover': { backgroundColor: '#d32f2f20' }
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete RTC"
        message="Are you sure you want to delete this RTC? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
      />

      {/* STATUS CHANGE CONFIRMATION */}
      <ConfirmDialog
        open={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={() => handleStatusChange(statusConfirm.id, statusConfirm.status)}
        title="Change Status"
        message={`Are you sure you want to ${statusConfirm?.status} this RTC?`}
        confirmText="Confirm"
        cancelText="Cancel"
        icon={<Users size={24} color="#144ae9" />}
      />
    </Box>
  );
}// 'use client'

// import { useEffect, useState, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchOverviewStats } from '@/redux/slices/statsSlice';
// import { fetchDistrictStats } from '@/redux/slices/districtSlice';
// import { fetchMediaStats } from '@/redux/slices/mediaSlice';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   Divider
// } from '@mui/material';
// import {
//   FileText,
//   TrendingUp,
//   MapPin,
//   Building2,
//   Image as ImageIcon,
//   Video,
//   Newspaper,
//   Users,
//   Download,
//   Calendar,
//   BarChart3,
//   PieChart,
//   Activity
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function ReportsPage() {
//   const dispatch = useDispatch();
//   const { overview, recentActivity, loading: statsLoading } = useSelector((state) => state.stats);
//   const { stats: districtStats } = useSelector((state) => state.district);
//   const { stats: mediaStats } = useSelector((state) => state.media);
//   const { currentAdmin } = useSelector((state) => state.admin);

//   const [dateRange, setDateRange] = useState('month');

//   useEffect(() => {
//     dispatch(fetchOverviewStats());
//     dispatch(fetchDistrictStats());
//     dispatch(fetchMediaStats());
//   }, [dispatch]);

//   const summaryStats = useMemo(() => [
//     {
//       title: 'Total Districts',
//       value: overview?.districts?.total || 0,
//       change: '+2 this month',
//       icon: MapPin,
//       color: '#144ae9',
//       bgColor: '#144ae910'
//     },
//     {
//       title: 'Gram Panchayats',
//       value: overview?.panchayats?.total || 0,
//       change: `${overview?.panchayats?.verified || 0} verified`,
//       icon: Building2,
//       color: '#10b981',
//       bgColor: '#10b98110'
//     },
//     {
//       title: 'Total Media',
//       value: overview?.media?.total || 0,
//       change: `${overview?.media?.pending || 0} pending approval`,
//       icon: ImageIcon,
//       color: '#f59e0b',
//       bgColor: '#f59e0b10'
//     },
//     {
//       title: 'News Articles',
//       value: overview?.news?.total || 0,
//       change: `${overview?.news?.published || 0} published`,
//       icon: Newspaper,
//       color: '#8b5cf6',
//       bgColor: '#8b5cf610'
//     },
//   ], [overview]);

//   const mediaBreakdown = useMemo(() => [
//     {
//       label: 'Images',
//       value: mediaStats?.images || 0,
//       icon: ImageIcon,
//       color: '#3b82f6'
//     },
//     {
//       label: 'Videos',
//       value: mediaStats?.videos || 0,
//       icon: Video,
//       color: '#ef4444'
//     }
//   ], [mediaStats]);

//   const districtBreakdown = useMemo(() => [
//     {
//       label: 'Active Districts',
//       value: districtStats?.active || 0,
//       percentage: districtStats?.total ? ((districtStats.active / districtStats.total) * 100).toFixed(1) : 0
//     },
//     {
//       label: 'Draft Districts',
//       value: districtStats?.draft || 0,
//       percentage: districtStats?.total ? ((districtStats.draft / districtStats.total) * 100).toFixed(1) : 0
//     }
//   ], [districtStats]);

//   const handleExportPDF = useCallback(() => {
//     // Implement PDF export
//     console.log('Exporting to PDF...');
//   }, []);

//   const handleExportExcel = useCallback(() => {
//     // Implement Excel export
//     console.log('Exporting to Excel...');
//   }, []);

//   if (statsLoading && !overview) {
//     return <Loader />;
//   }

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         flexDirection: { xs: 'column', sm: 'row' }, 
//         justifyContent: 'space-between', 
//         alignItems: { xs: 'flex-start', sm: 'center' }, 
//         gap: 2, 
//         mb: { xs: 3, sm: 4 } 
//       }}>
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//             <FileText size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//             <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//               Reports & Analytics
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Comprehensive overview of system statistics and performance
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Button
//             startIcon={<Download size={18} />}
//             onClick={handleExportPDF}
//             variant="outlined"
//             fullWidth={false}
//             sx={{
//               borderColor: '#144ae9',
//               color: '#144ae9',
//               fontSize: { xs: '0.75rem', sm: '0.875rem' },
//               flex: { xs: 1, sm: 'unset' },
//               '&:hover': {
//                 borderColor: '#0d3ec7',
//                 backgroundColor: '#144ae910'
//               }
//             }}
//           >
//             Export PDF
//           </Button>
//           <Button
//             startIcon={<Download size={18} />}
//             onClick={handleExportExcel}
//             fullWidth={false}
//             sx={{
//               backgroundColor: '#10b981',
//               color: 'white',
//               fontSize: { xs: '0.75rem', sm: '0.875rem' },
//               flex: { xs: 1, sm: 'unset' },
//               '&:hover': {
//                 backgroundColor: '#059669'
//               }
//             }}
//           >
//             Export Excel
//           </Button>
//         </Box>
//       </Box>

//       {/* SUMMARY STATS */}
//       <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
//         {summaryStats.map((stat, index) => (
//           <Grid item xs={12} sm={6} md={3} key={index}>
//             <Card 
//               sx={{ 
//                 p: { xs: 2, sm: 3 }, 
//                 border: '1px solid #144ae920',
//                 transition: 'all 0.2s',
//                 '&:hover': {
//                   boxShadow: 4,
//                   borderColor: stat.color
//                 }
//               }}
//             >
//               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//                 <Box 
//                   sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: stat.bgColor,
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   <stat.icon size={20} color={stat.color} className="sm:w-6 sm:h-6" />
//                 </Box>
//                 <TrendingUp size={18} color={stat.color} className="sm:w-5 sm:h-5" />
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                 {stat.title}
//               </Typography>
//               <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, my: 1 }}>
//                 {stat.value}
//               </Typography>
//               <Typography variant="caption" sx={{ color: stat.color, fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                 {stat.change}
//               </Typography>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       {/* DETAILED ANALYTICS */}
//       <Grid container spacing={{ xs: 2, sm: 3 }}>
//         {/* DISTRICT ANALYTICS */}
//         <Grid item xs={12} lg={6}>
//           <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', height: '100%' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//               <Box 
//                 sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#144ae910',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <BarChart3 size={20} color="#144ae9" className="sm:w-6 sm:h-6" />
//               </Box>
//               <Box>
//                 <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                   District Analytics
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                   Status breakdown by district
//                 </Typography>
//               </Box>
//             </Box>

//             <Divider sx={{ mb: 3 }} />

//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {districtBreakdown.map((item, index) => (
//                 <Box key={index}>
//                   <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                     <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                       {item.label}
//                     </Typography>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                         {item.value}
//                       </Typography>
//                       <Chip 
//                         label={`${item.percentage}%`} 
//                         size="small" 
//                         sx={{ 
//                           backgroundColor: '#144ae910', 
//                           color: '#144ae9',
//                           fontSize: { xs: '0.65rem', sm: '0.75rem' },
//                           fontWeight: 600
//                         }} 
//                       />
//                     </Box>
//                   </Box>
//                   <Box sx={{ 
//                     width: '100%', 
//                     height: { xs: 6, sm: 8 }, 
//                     backgroundColor: '#144ae910', 
//                     borderRadius: 1,
//                     overflow: 'hidden'
//                   }}>
//                     <Box sx={{ 
//                       width: `${item.percentage}%`, 
//                       height: '100%', 
//                       backgroundColor: '#144ae9',
//                       transition: 'width 0.3s ease'
//                     }} />
//                   </Box>
//                 </Box>
//               ))}
//             </Box>

//             <Divider sx={{ my: 3 }} />

//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                 Total Districts
//               </Typography>
//               <Typography variant="h5" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
//                 {districtStats?.total || 0}
//               </Typography>
//             </Box>
//           </Card>
//         </Grid>

//         {/* MEDIA ANALYTICS */}
//         <Grid item xs={12} lg={6}>
//           <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', height: '100%' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//               <Box 
//                 sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#f59e0b10',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <PieChart size={20} color="#f59e0b" className="sm:w-6 sm:h-6" />
//               </Box>
//               <Box>
//                 <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                   Media Analytics
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                   Media type distribution
//                 </Typography>
//               </Box>
//             </Box>

//             <Divider sx={{ mb: 3 }} />

//             <Grid container spacing={2}>
//               {mediaBreakdown.map((item, index) => (
//                 <Grid item xs={6} key={index}>
//                   <Card sx={{ 
//                     p: { xs: 2, sm: 3 }, 
//                     border: '1px solid #144ae920',
//                     backgroundColor: `${item.color}05`,
//                     textAlign: 'center'
//                   }}>
//                     <Box 
//                       sx={{ 
//                         width: { xs: 48, sm: 64 }, 
//                         height: { xs: 48, sm: 64 }, 
//                         borderRadius: '50%', 
//                         backgroundColor: `${item.color}15`,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         margin: '0 auto',
//                         mb: 2
//                       }}
//                     >
//                       <item.icon size={24} color={item.color} className="sm:w-8 sm:h-8" />
//                     </Box>
//                     <Typography variant="h4" fontWeight={700} sx={{ color: item.color, fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 1 }}>
//                       {item.value}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       {item.label}
//                     </Typography>
//                   </Card>
//                 </Grid>
//               ))}
//             </Grid>

//             <Divider sx={{ my: 3 }} />

//             <Box>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                 <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                   Media Status
//                 </Typography>
//               </Box>
//               <Grid container spacing={1.5}>
//                 <Grid item xs={4}>
//                   <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, backgroundColor: '#10b98110', borderRadius: 2 }}>
//                     <Typography variant="h6" fontWeight={600} color="#10b981" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                       {overview?.media?.approved || 0}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
//                       Approved
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={4}>
//                   <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, backgroundColor: '#f59e0b10', borderRadius: 2 }}>
//                     <Typography variant="h6" fontWeight={600} color="#f59e0b" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                       {overview?.media?.pending || 0}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
//                       Pending
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={4}>
//                   <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 1.5 }, backgroundColor: '#ef444410', borderRadius: 2 }}>
//                     <Typography variant="h6" fontWeight={600} color="#ef4444" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                       {overview?.media?.rejected || 0}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
//                       Rejected
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Card>
//         </Grid>

//         {/* RECENT ACTIVITY */}
//         <Grid item xs={12}>
//           <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//               <Box 
//                 sx={{ 
//                   width: { xs: 40, sm: 48 }, 
//                   height: { xs: 40, sm: 48 }, 
//                   borderRadius: 2, 
//                   backgroundColor: '#8b5cf610',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <Activity size={20} color="#8b5cf6" className="sm:w-6 sm:h-6" />
//               </Box>
//               <Box>
//                 <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                   Recent Activity
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                   Latest system updates and changes
//                 </Typography>
//               </Box>
//             </Box>

//             <Divider sx={{ mb: 3 }} />

//             <Grid container spacing={{ xs: 2, sm: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ 
//                   p: { xs: 2, sm: 3 }, 
//                   backgroundColor: '#144ae905', 
//                   borderRadius: 2,
//                   border: '1px solid #144ae920'
//                 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                     <Building2 size={18} color="#144ae9" className="sm:w-5 sm:h-5" />
//                     <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                       Recent Panchayats
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                     {recentActivity?.panchayats?.slice(0, 3).map((item, index) => (
//                       <Box 
//                         key={index}
//                         sx={{ 
//                           p: { xs: 1.5, sm: 2 }, 
//                           backgroundColor: 'white', 
//                           borderRadius: 1.5,
//                           border: '1px solid #144ae920'
//                         }}
//                       >
//                         <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           {item.name}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                           {item.district?.name} • {new Date(item.createdAt).toLocaleDateString()}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Box>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Box sx={{ 
//                   p: { xs: 2, sm: 3 }, 
//                   backgroundColor: '#f59e0b05', 
//                   borderRadius: 2,
//                   border: '1px solid #f59e0b20'
//                 }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                     <ImageIcon size={18} color="#f59e0b" className="sm:w-5 sm:h-5" />
//                     <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//                       Recent Media
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
//                     {recentActivity?.media?.slice(0, 3).map((item, index) => (
//                       <Box 
//                         key={index}
//                         sx={{ 
//                           p: { xs: 1.5, sm: 2 }, 
//                           backgroundColor: 'white', 
//                           borderRadius: 1.5,
//                           border: '1px solid #f59e0b20'
//                         }}
//                       >
//                         <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           {item.title}
//                         </Typography>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
//                           <Chip 
//                             label={item.fileType} 
//                             size="small" 
//                             sx={{ 
//                               fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
//                               height: { xs: 18, sm: 20 }
//                             }} 
//                           />
//                           <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                             {new Date(item.createdAt).toLocaleDateString()}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Box>
//               </Grid>
//             </Grid>
//           </Card>
//         </Grid>

//         {/* USER INFO (FOR ADMIN ONLY) */}
//         {currentAdmin?.role === 'admin' && (
//           <Grid item xs={12}>
//             <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
//                 <Box 
//                   sx={{ 
//                     width: { xs: 40, sm: 48 }, 
//                     height: { xs: 40, sm: 48 }, 
//                     borderRadius: 2, 
//                     backgroundColor: '#10b98110',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   <Users size={20} color="#10b981" className="sm:w-6 sm:h-6" />
//                 </Box>
//                 <Box>
//                   <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                     User Statistics
//                   </Typography>
//                   <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     System users and contacts
//                   </Typography>
//                 </Box>
//               </Box>

//               <Divider sx={{ mb: 3 }} />

//               <Grid container spacing={{ xs: 2, sm: 3 }}>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Typography variant="h4" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {overview?.admins?.total || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Admins
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Typography variant="h4" fontWeight={700} color="#10b981" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {overview?.admins?.rtcs || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       RTCs
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Typography variant="h4" fontWeight={700} color="#f59e0b" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {overview?.contacts?.total || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       Total Contacts
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={6} sm={3}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Typography variant="h4" fontWeight={700} color="#8b5cf6" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//                       {overview?.contacts?.new || 0}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
//                       New Contacts
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Card>
//           </Grid>
//         )}
//       </Grid>
//     </Box>
//   );
// }