'use client'
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Map as MapIcon
} from 'lucide-react';
import {
  Box,
  Typography,
  Card,
  Button
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AllDistrictsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

  const [filters, setFilters] = useState({ status: '', search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const hasCachedData = districts.length > 0;
    
    if (!hasCachedData) {
      dispatch(fetchDistricts({ limit: 100 })).finally(() => {
        setIsInitialLoading(false);
      });
    } else {
      setIsInitialLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      dispatch(fetchDistricts({ limit: 100 }));
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleSearch = useCallback(() => {
    const params = { limit: 100 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    dispatch(fetchDistricts(params));
  }, [filters, dispatch]);

  const handleReset = useCallback(() => {
    setFilters({ status: '', search: '' });
    dispatch(fetchDistricts({ limit: 100 }));
  }, [dispatch]);

  const handleDelete = useCallback(async (id) => {
    try {
      setDeletingId(id);
      await dispatch(deleteDistrict(id)).unwrap();
      toast.success('District deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete district');
    } finally {
      setDeletingId(null);
    }
  }, [dispatch]);

  const handleCardClick = (id) => {
    router.push(`/admin/districts/${id}`);
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {isInitialLoading && districts.length === 0 && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Loading Districts..."} />
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-[10000]">
          <Loader message={"Deleting District..."} />
        </div>
      )}

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
            <MapPin size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
              Districts ({totalDistricts || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Manage all districts of Madhya Pradesh
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Link href="/districts" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
            <Button
              variant="outlined"
              startIcon={<MapIcon size={18} />}
              fullWidth
              sx={{
                borderColor: '#144ae9',
                color: '#144ae9',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                '&:hover': {
                  borderColor: '#0d3ec7',
                  backgroundColor: '#144ae910'
                }
              }}
            >
              View Map
            </Button>
          </Link>
          <Link href="/admin/districts/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
            <Button
              startIcon={<Plus size={18} />}
              fullWidth
              sx={{
                backgroundColor: '#144ae9',
                color: 'white',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                '&:hover': { backgroundColor: '#0d3ec7', color: 'white' }
              }}
            >
              Add District
            </Button>
          </Link>
        </Box>
      </Box>

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
              placeholder="Search districts..."
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
              disabled={loading || deletingId}
              startIcon={<Filter size={16} />}
              fullWidth={false}
              sx={{
                backgroundColor: '#144ae9',
                color: 'white',
                height: { xs: '44px', sm: '56px' },
                minWidth: { xs: '0', sm: '100px' },
                flex: { xs: 1, sm: 'unset' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': { backgroundColor: '#0d3ec7', color: 'white' },
                '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={deletingId}
              fullWidth={false}
              sx={{
                borderColor: '#144ae9',
                color: '#144ae9',
                height: { xs: '44px', sm: '56px' },
                minWidth: { xs: '0', sm: '100px' },
                flex: { xs: 1, sm: 'unset' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&:hover': {
                  borderColor: '#0d3ec7',
                  backgroundColor: '#144ae910',
                  color: '#0d3ec7'
                },
                '&.Mui-disabled': {
                  borderColor: '#144ae950',
                  color: '#144ae950'
                }
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ border: '1px solid #144ae920' }}>
        {districts.length === 0 && !isInitialLoading ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              No districts found
            </Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 justify-center">
            {districts.map((district) => (
              <div
                key={district._id}
                className={`bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-[#144ae9] hover:shadow-sm transition-all duration-200 ease-in-out overflow-hidden relative cursor-pointer ${
                  deletingId === district._id ? 'opacity-60' : 'opacity-100'
                }`}
                onClick={() => handleCardClick(district._id)}
              >
                {deletingId === district._id && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <span className="text-blue-600 font-semibold text-sm">Deleting...</span>
                  </div>
                )}

                <div className="relative h-40 sm:h-48 bg-blue-600">
                  {district.headerImage ? (
                    <img
                      src={district.headerImage}
                      alt={district.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin size={40} color="white" className="opacity-50" />
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate flex-1 mr-2">
                      {district.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-white whitespace-nowrap ${
                        district.status === 'active' ? 'bg-blue-600' : 'bg-gray-500'
                      }`}
                    >
                      {district.status}
                    </span>
                  </div>

                  <div className="flex justify-between mb-3">
                    {district.area && (
                      <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
                        Area: {district.area} sq km
                      </p>
                    )}
                    {district.formationYear && (
                      <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
                        Formed: {district.formationYear}
                      </p>
                    )}
                  </div>

                  {district.population && (
                    <p className="text-sm font-semibold text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
                      Population: {district.population.toLocaleString()}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/districts/${district._id}`}
                      className="no-underline"
                    >
                      <button
                        className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </Link>

                    <button
                      disabled={deletingId === district._id}
                      onClick={() => setDeleteConfirm(district._id)}
                      className="w-full bg-red-50 text-red-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete District"
        message="Are you sure you want to delete this district? This will also affect all associated panchayats."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
        loading={deletingId === deleteConfirm}
      />
    </Box>
  );
}

// 'use client'
// import { useEffect, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Map as MapIcon
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

// export default function AllDistrictsPage() {
//   const dispatch = useDispatch();
//   const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({ status: '', search: '' });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [deletingId, setDeletingId] = useState(null); // Track which district is being deleted

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }));
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
//       // Refresh the data after successful deletion
//       dispatch(fetchDistricts({ limit: 100 }));
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const handleSearch = useCallback(() => {
//     const params = { limit: 100 };
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchDistricts(params));
//   }, [filters, dispatch]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', search: '' });
//     dispatch(fetchDistricts({ limit: 100 }));
//   }, [dispatch]);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setDeletingId(id); // Set the deleting ID to show loader
//       await dispatch(deleteDistrict(id)).unwrap();
//       toast.success('District deleted successfully');
//       setDeleteConfirm(null);
//       // Note: The useEffect above will handle refreshing the data when success changes
//     } catch (err) {
//       toast.error(err.message || 'Failed to delete district');
//     } finally {
//       setDeletingId(null); // Clear deleting ID
//     }
//   }, [dispatch]);

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//       {/* Show global loader when deleting */}
//       {deletingId && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting District..."} />
//         </div>
//       )}

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
//             <MapPin size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//             <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//               Districts ({totalDistricts || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all districts of Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/districts" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               variant="outlined"
//               startIcon={<MapIcon size={18} />}
//               fullWidth
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               View Map
//             </Button>
//           </Link>
//           <Link href="/admin/districts/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': { backgroundColor: '#0d3ec7', color: 'white' }
//               }}
//             >
//               Add District
//             </Button>
//           </Link>
//         </Box>
//       </Box>

//       <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', mb: { xs: 3, sm: 4 } }}>
//         <Box sx={{ 
//           display: 'flex', 
//           gap: { xs: 1.5, sm: 2 }, 
//           alignItems: 'stretch',
//           flexDirection: { xs: 'column', sm: 'row' },
//           flexWrap: 'wrap'
//         }}>
//           <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search districts..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={statusOptions}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               onClick={handleSearch}
//               disabled={loading}
//               startIcon={<Filter size={16} />}
//               fullWidth={false}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': { backgroundColor: '#0d3ec7', color: 'white' },
//                 '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//               }}
//             >
//               Apply
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               fullWidth={false}
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910',
//                   color: '#0d3ec7'
//                 }
//               }}
//             >
//               Reset
//             </Button>
//           </Box>
//         </Box>
//       </Card>

//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading && districts.length === 0 ? (
//           <div className="fixed inset-0 z-[9999]">
//             <Loader message={"Loading Districts..."} />
//           </div>
//         ) : districts.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No districts found
//             </Typography>
//           </Box>
//         ) : (
//   //         <Grid  justifyContent="center" container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//   //           {districts.map((district) => (
//   //             <Grid item xs={12} sm={6} md={4} key={district._id}>
//   //                 <Card 
//   //                   sx={{ 
//   //                     border: '1px solid #144ae920',
//   //                     transition: 'all 0.2s',
//   //                     '&:hover': { boxShadow: 4, borderColor: '#144ae9' },
//   //                     position: 'relative',
//   //                     opacity: deletingId === district._id ? 0.6 : 1
//   //                   }}
//   //                 >
//   //                   {deletingId === district._id && (
//   //                     <Box
//   //                       sx={{
//   //                         position: 'absolute',
//   //                         top: 0,
//   //                         left: 0,
//   //                         right: 0,
//   //                         bottom: 0,
//   //                         backgroundColor: 'rgba(255, 255, 255, 0.8)',
//   //                         display: 'flex',
//   //                         alignItems: 'center',
//   //                         justifyContent: 'center',
//   //                         zIndex: 10
//   //                       }}
//   //                     >
//   //                       <Typography variant="body2" color="#144ae9" fontWeight={600}>
//   //                         Deleting...
//   //                       </Typography>
//   //                     </Box>
//   //                   )}

//   //                   <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
//   //                     {district.headerImage ? (
//   //                       <img
//   //                         src={district.headerImage}
//   //                         alt={district.name}
//   //                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//   //                       />
//   //                     ) : (
//   //                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
//   //                         <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
//   //                       </Box>
//   //                     )}
                    
//   //                   </Box>

//   //               <Box sx={{ p: { xs: 2, sm: 3 } }}>

//   //   {/* NAME + STATUS IN ONE ROW */}
//   //   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
//   //     <Typography
//   //       variant="h6"
//   //       fontWeight={600}
//   //       color="text.primary"
//   //       sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
//   //     >
//   //       {district.name}
//   //     </Typography>

//   //     <Chip
//   //       label={district.status}
//   //       size="small"
//   //       sx={{
//   //         backgroundColor: district.status === 'active' ? '#144ae9' : '#6b7280',
//   //         color: 'white',
//   //         fontWeight: 600,
//   //         fontSize: '0.7rem'
//   //       }}
//   //     />
//   //   </Box>

//   //   {/* AREA + YEAR IN ONE ROW */}
//   //   <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//   //     {district.area && (
//   //       <Typography variant="body2"  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//   //         Area: {district.area} sq km
//   //       </Typography>
//   //     )}
//   //     {district.formationYear && (
//   //       <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//   //         Formed: {district.formationYear}
//   //       </Typography>
//   //     )}
//   //   </Box>

//   //   {/* POPULATION (ALONE row) */}
//   //   {district.population && (
//   //     <Typography
//   //       variant="body2"
        
//   //       sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
//   //     >
//   //       Population: {district.population.toLocaleString()}
//   //     </Typography>
//   //   )}

//   //   {/* BUTTONS – ONLY VIEW + DELETE (UNIFORM SHAPE) */}
//   //   <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
//   //     <Link
//   //       href={`/admin/districts/${district._id}`}
//   //       style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}
//   //     >
//   //       <Button
//   //         startIcon={<Eye size={14} />}
//   //         sx={{
//   //           width:'100%',
//   //           backgroundColor: '#144ae910',
//   //           color: '#144ae9',
//   //           fontSize: { xs: '0.75rem', sm: '0.875rem' },
//   //           py: { xs: 0.75, sm: 1 },
//   //           '&:hover': { backgroundColor: '#144ae920' }
//   //         }}
//   //       >
//   //         View
//   //       </Button>
//   //     </Link>

//   //     {/* DELETE BUTTON (RECTANGULAR LIKE VIEW) */}
//   //     <Button
        
//   //       startIcon={<Trash2 size={14} />}
//   //       disabled={deletingId === district._id}
//   //       onClick={() => setDeleteConfirm(district._id)}
//   //       sx={{
//   //         width:'100%',
//   //         backgroundColor: '#d32f2f10',
//   //         color: '#d32f2f',
//   //         fontSize: { xs: '0.75rem', sm: '0.875rem' },
//   //         py: { xs: 0.75, sm: 1 },
//   //         '&:hover': { backgroundColor: '#d32f2f20' },
//   //         '&.Mui-disabled': {
//   //           backgroundColor: '#d32f2f10',
//   //           color: '#d32f2f50'
//   //         }
//   //       }}
//   //     >
//   //       Delete
//   //     </Button>
//   //   </Box>
//   // </Box>

//   //                 </Card>
//   //             </Grid>
//   //           ))}
//   //         </Grid>
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 justify-center">
//   {districts.map((district) => (
//     <div
//       key={district._id}
//       className={`bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-[#144ae9] hover:shadow-sm transition-all duration-200 ease-in-out overflow-hidden relative ${
//         deletingId === district._id ? 'opacity-60' : 'opacity-100'
//       }`}
//     >
//       {/* Deleting Overlay */}
//       {deletingId === district._id && (
//         <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
//           <span className="text-blue-600 font-semibold text-sm">Deleting...</span>
//         </div>
//       )}

//       {/* Header Image Section */}
//       <div className="relative h-40 sm:h-48 bg-blue-600">
//         {district.headerImage ? (
//           <img
//             src={district.headerImage}
//             alt={district.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full">
//             <MapPin size={40} color="white" className="opacity-50" />
//           </div>
//         )}
//       </div>

//       {/* Content Section */}
//       <div className="p-4 sm:p-6">

//         {/* Name + Status Row */}
//         <div className="flex items-center justify-between mb-2">
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate flex-1 mr-2">
//             {district.name}
//           </h3>

//           <span
//             className={`px-2 py-1 text-xs font-semibold rounded-full text-white whitespace-nowrap ${
//               district.status === 'active' ? 'bg-blue-600' : 'bg-gray-500'
//             }`}
//           >
//             {district.status}
//           </span>
//         </div>

//         {/* Area + Year Row */}
//         <div className="flex justify-between mb-3">
//           {district.area && (
//             <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
//               Area: {district.area} sq km
//             </p>
//           )}
//           {district.formationYear && (
//             <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
//               Formed: {district.formationYear}
//             </p>
//           )}
//         </div>

//         {/* Population Row */}
//         {district.population && (
//           <p className="text-sm font-semibold text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">
//             Population: {district.population.toLocaleString()}
//           </p>
//         )}

//         {/* Buttons - View + Delete */}
//         <div className="grid grid-cols-2 gap-2">
//           {/* VIEW BUTTON */}
//           <a
//             href={`/admin/districts/${district._id}`}
//             className="no-underline"
//           >
//             <button
//               className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <Eye size={14} />
//               View
//             </button>
//           </a>

//           {/* DELETE BUTTON */}
//           <button
//             disabled={deletingId === district._id}
//             onClick={() => setDeleteConfirm(district._id)}
//             className="w-full bg-red-50 text-red-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Trash2 size={14} />
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   ))}
// </div>
//         )}
//       </Card>

//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete District"
//         message="Are you sure you want to delete this district? This will also affect all associated panchayats."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//         loading={deletingId === deleteConfirm} // Show loading in dialog too
//       />
//     </Box>
//   );
// }


// 'use client'
// import { useEffect, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Map as MapIcon
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

// export default function AllDistrictsPage() {
//   const dispatch = useDispatch();
//   const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({ status: '', search: '' });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     if (districts.length === 0) {
//       dispatch(fetchDistricts({ limit: 100 }));
//     }
//   }, [dispatch, districts.length]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const handleSearch = useCallback(() => {
//     const params = { limit: 100 };
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchDistricts(params));
//   }, [filters, dispatch]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', search: '' });
//     dispatch(fetchDistricts({ limit: 100 }));
//   }, [dispatch]);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       await dispatch(deleteDistrict(id)).unwrap();
//       toast.success('District deleted successfully');
//       setDeleteConfirm(null);
//     } catch (err) {
//       toast.error(err.message || 'Failed to delete district');
//     }
//   }, [dispatch]);

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
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
//             <MapPin size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//             <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//               Districts ({totalDistricts || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all districts of Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/districts" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               variant="outlined"
//               startIcon={<MapIcon size={18} />}
//               fullWidth
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               View Map
//             </Button>
//           </Link>
//           <Link href="/admin/districts/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': { backgroundColor: '#0d3ec7', color: 'white' }
//               }}
//             >
//               Add District
//             </Button>
//           </Link>
//         </Box>
//       </Box>

//       <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', mb: { xs: 3, sm: 4 } }}>
//         <Box sx={{ 
//           display: 'flex', 
//           gap: { xs: 1.5, sm: 2 }, 
//           alignItems: 'stretch',
//           flexDirection: { xs: 'column', sm: 'row' },
//           flexWrap: 'wrap'
//         }}>
//           <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search districts..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={statusOptions}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
//             <Button
//               onClick={handleSearch}
//               disabled={loading}
//               startIcon={<Filter size={16} />}
//               fullWidth={false}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': { backgroundColor: '#0d3ec7', color: 'white' },
//                 '&.Mui-disabled': { backgroundColor: '#144ae950', color: 'white' }
//               }}
//             >
//               Apply
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               fullWidth={false}
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910',
//                   color: '#0d3ec7'
//                 }
//               }}
//             >
//               Reset
//             </Button>
//           </Box>
//         </Box>
//       </Card>

//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading && districts.length === 0 ? (
//           <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading Districts..."} />
//         </div>
//         ) : districts.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No districts found
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//             {districts.map((district) => (
//               <Grid item xs={12} sm={6} md={4} key={district._id}>
//                 <Card 
//                   sx={{ 
//                     border: '1px solid #144ae920',
//                     transition: 'all 0.2s',
//                     '&:hover': { boxShadow: 4, borderColor: '#144ae9' }
//                   }}
//                 >
//                   <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
//                     {district.headerImage ? (
//                       <img
//                         src={district.headerImage}
//                         alt={district.name}
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
//                         <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
//                       </Box>
//                     )}
//                     <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
//                       <Chip
//                         label={district.status}
//                         size="small"
//                         sx={{
//                           backgroundColor: district.status === 'active' ? '#144ae9' : '#6b7280',
//                           color: 'white',
//                           fontWeight: 600,
//                           fontSize: '0.7rem'
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   <Box sx={{ p: { xs: 2, sm: 3 } }}>
//                     <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                       {district.name}
//                     </Typography>
                    
//                     <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       {district.area && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Area: {district.area} sq km
//                         </Typography>
//                       )}
//                       {district.population && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Population: {district.population.toLocaleString()}
//                         </Typography>
//                       )}
//                       {district.formationYear && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Formed: {district.formationYear}
//                         </Typography>
//                       )}
//                     </Box>

//                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Eye size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': { backgroundColor: '#144ae920' }
//                           }}
//                         >
//                           View
//                         </Button>
//                       </Link>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Edit size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': { backgroundColor: '#144ae920' }
//                           }}
//                         >
//                           Edit
//                         </Button>
//                       </Link>
//                       <IconButton
//                         onClick={() => setDeleteConfirm(district._id)}
//                         sx={{
//                           color: '#d32f2f',
//                           backgroundColor: '#d32f2f10',
//                           width: { xs: 36, sm: 40 },
//                           height: { xs: 36, sm: 40 },
//                           '&:hover': { backgroundColor: '#d32f2f20' }
//                         }}
//                       >
//                         <Trash2 size={14} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Card>

//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete District"
//         message="Are you sure you want to delete this district? This will also affect all associated panchayats."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   );
// }

// 'use client'
// import { useEffect, useState, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Map as MapIcon
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

// export default function AllDistrictsPage() {
//   const dispatch = useDispatch();
//   const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({
//     status: '',
//     search: ''
//   });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }));
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
//       handleSearch();
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   const handleSearch = useCallback(() => {
//     const params = { limit: 100 };
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchDistricts(params));
//   }, [filters, dispatch]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', search: '' });
//     dispatch(fetchDistricts({ limit: 100 }));
//   }, [dispatch]);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       await dispatch(deleteDistrict(id)).unwrap();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error(err);
//     }
//   }, [dispatch]);

//   const statusOptions = useMemo(() => [
//     { value: '', label: 'All Status' },
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ], []);

//   if (loading && !districts.length) {
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
//             <MapPin size={28} color="#144ae9" className="sm:w-8 sm:h-8" />
//             <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//               Districts ({totalDistricts || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all districts of Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/districts" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               variant="outlined"
//               startIcon={<MapIcon size={18} />}
//               fullWidth
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               View Map
//             </Button>
//           </Link>
//           <Link href="/admin/districts/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
//             <Button
//               startIcon={<Plus size={18} />}
//               fullWidth
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 px: { xs: 2, sm: 3 },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7',
//                   color: 'white'
//                 }
//               }}
//             >
//               Add District
//             </Button>
//           </Link>
//         </Box>
//       </Box>

//       {/* FILTERS */}
//       <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', mb: { xs: 3, sm: 4 } }}>
//         <Box sx={{ 
//           display: 'flex', 
//           gap: { xs: 1.5, sm: 2 }, 
//           alignItems: 'stretch',
//           flexDirection: { xs: 'column', sm: 'row' },
//           flexWrap: 'wrap'
//         }}>
//           <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search districts..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={statusOptions}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ 
//             display: 'flex', 
//             gap: 1, 
//             width: { xs: '100%', sm: 'auto' }
//           }}>
//             <Button
//               onClick={handleSearch}
//               disabled={loading}
//               startIcon={<Filter size={16} />}
//               fullWidth={false}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7',
//                   color: 'white'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: '#144ae950',
//                   color: 'white'
//                 }
//               }}
//             >
//               Apply
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               fullWidth={false}
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 height: { xs: '44px', sm: '56px' },
//                 minWidth: { xs: '0', sm: '100px' },
//                 flex: { xs: 1, sm: 'unset' },
//                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910',
//                   color: '#0d3ec7'
//                 }
//               }}
//             >
//               Reset
//             </Button>
//           </Box>
//         </Box>
//       </Card>

//       {/* DISTRICTS GRID */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {districts.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No districts found
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//             {districts.map((district) => (
//               <Grid item xs={12} sm={6} md={4} key={district._id}>
//                 <Card 
//                   sx={{ 
//                     border: '1px solid #144ae920',
//                     transition: 'all 0.2s',
//                     '&:hover': {
//                       boxShadow: 4,
//                       borderColor: '#144ae9'
//                     }
//                   }}
//                 >
//                   <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
//                     {district.headerImage ? (
//                       <img
//                         src={district.headerImage}
//                         alt={district.name}
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
//                         <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
//                       </Box>
//                     )}
//                     <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
//                       <Chip
//                         label={district.status}
//                         size="small"
//                         sx={{
//                           backgroundColor: district.status === 'active' ? '#144ae9' : '#6b7280',
//                           color: 'white',
//                           fontWeight: 600,
//                           fontSize: '0.7rem'
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   <Box sx={{ p: { xs: 2, sm: 3 } }}>
//                     <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
//                       {district.name}
//                     </Typography>
                    
//                     <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                       {district.area && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Area: {district.area} sq km
//                         </Typography>
//                       )}
//                       {district.population && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Population: {district.population.toLocaleString()}
//                         </Typography>
//                       )}
//                       {district.formationYear && (
//                         <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                           Formed: {district.formationYear}
//                         </Typography>
//                       )}
//                     </Box>

//                     <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Eye size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           View
//                         </Button>
//                       </Link>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Edit size={14} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                             py: { xs: 0.75, sm: 1 },
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           Edit
//                         </Button>
//                       </Link>
//                       <IconButton
//                         onClick={() => setDeleteConfirm(district._id)}
//                         sx={{
//                           color: '#d32f2f',
//                           backgroundColor: '#d32f2f10',
//                           width: { xs: 36, sm: 40 },
//                           height: { xs: 36, sm: 40 },
//                           '&:hover': {
//                             backgroundColor: '#d32f2f20'
//                           }
//                         }}
//                       >
//                         <Trash2 size={14} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete District"
//         message="Are you sure you want to delete this district? This will also affect all associated panchayats."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   );
// }

// 'use client'
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Map as MapIcon
// } from 'lucide-react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

// export default function AllDistrictsPage() {
//   const dispatch = useDispatch();
//   const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({
//     status: '',
//     search: ''
//   });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   // FIXED: Fetch all districts initially (no status filter)
//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 })); // Remove status filter to get all districts
//   }, []);

//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
//       handleSearch();
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   const handleSearch = () => {
//     const params = { limit: 100 };
//     // FIXED: Only add status to params if it has a value
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchDistricts(params));
//   };

//   // FIXED: Reset to show all districts (no status filter)
//   const handleReset = () => {
//     setFilters({ status: '', search: '' });
//     dispatch(fetchDistricts({ limit: 100 })); // Remove status filter to get all districts
//   };

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deleteDistrict(id)).unwrap();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'active', label: 'Active' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//             <MapPin size={32} color="#144ae9" />
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               Districts Management ({totalDistricts || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Manage all districts of Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Link href="/districts" target="_blank" style={{ textDecoration: 'none' }}>
//             <Button
//               variant="outlined"
//               startIcon={<MapIcon size={20} />}
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               View Map
//             </Button>
//           </Link>
//           <Link href="/admin/districts/create" style={{ textDecoration: 'none' }}>
//             <Button
//               startIcon={<Plus size={20} />}
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7',
//                   color: 'white'
//                 }
//               }}
//             >
//               Add District
//             </Button>
//           </Link>
//         </Box>
//       </Box>

//       {/* STATS & FILTERS IN ONE ROW */}
//     <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
//   {/* FILTERS CARD */}
//   <Box sx={{ width: '100%' }}>
//     <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', height: '100%' }}>
//       <Box sx={{ 
//         display: 'flex', 
//         gap: { xs: 2, sm: 2, md: 2 }, 
//         alignItems: 'center', 
//         flexDirection: { xs: 'column', sm: 'row' },
//         flexWrap: 'wrap'
//       }}>
//         {/* SEARCH FIELD */}
//         <Box sx={{ 
//           flex: 1,
//           minWidth: { xs: '100%', sm: '200px' },
//           display: 'flex', 
//           alignItems: 'center' 
//         }}>
//           <TextField
//             label="Search"
//             value={filters.search}
//             onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//             placeholder="Search by district name..."
//             startIcon={<Search size={20} color="#144ae9" />}
//             fullWidth
//             sx={{ 
//               '& .MuiInputBase-root': { 
//                 height: { xs: '48px', sm: '56px' } 
//               } 
//             }}
//           />
//         </Box>

//         {/* STATUS FILTER */}
//         <Box sx={{ 
//           width: { xs: '100%', sm: '180px', md: '180px' },
//           display: 'flex', 
//           alignItems: 'center' 
//         }}>
//           <SelectField
//             label="Status"
//             value={filters.status}
//             onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//             options={statusOptions}
//             fullWidth
//             sx={{ 
//               '& .MuiInputBase-root': { 
//                 height: { xs: '48px', sm: '56px' } 
//               } 
//             }}
//           />
//         </Box>

//         {/* BUTTONS */}
//         <Box sx={{ 
//           display: 'flex', 
//           alignItems: 'center',
//           width: { xs: '100%', sm: 'auto' },
//           mt: { xs: 1, sm: 0 }
//         }}>
//           <Box sx={{ 
//             display: 'flex', 
//             gap: 1, 
//             flexDirection: 'row',
//             width: { xs: '100%', sm: 'auto' }
//           }}>
//             <Button
//               onClick={handleSearch}
//               disabled={loading}
//               startIcon={<Filter size={18} />}
//               size="large"
//               sx={{
//                 backgroundColor: '#144ae9',
//                 color: 'white',
//                 height: { xs: '48px', sm: '56px' },
//                 minWidth: '100px',
//                 '&:hover': {
//                   backgroundColor: '#0d3ec7',
//                   color: 'white'
//                 },
//                 '&.Mui-disabled': {
//                   backgroundColor: '#144ae950',
//                   color: 'white'
//                 },
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 whiteSpace: 'nowrap'
//               }}
//             >
//               Apply
//             </Button>
//             <Button
//               variant="outlined"
//               onClick={handleReset}
//               size="large"
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 height: { xs: '48px', sm: '56px' },
//                 minWidth: '100px',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910',
//                   color: '#0d3ec7'
//                 },
//                 fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                 whiteSpace: 'nowrap'
//               }}
//             >
//               Reset
//             </Button>
//           </Box>
//         </Box>
//       </Box>
//     </Card>
//   </Box>
// </Box>

//       {/* DISTRICTS GRID */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading ? (
//           <Loader />
//         ) : districts.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 8 }}>
//             <MapPin size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
//             <Typography variant="body1" color="text.secondary">
//               No districts found
//             </Typography>
//           </Box>
//         ) : (
//           <Grid container spacing={3} sx={{ p: 3 }}>
//             {districts.map((district) => (
//               <Grid item xs={12} sm={6} md={4} key={district._id}>
//                 <Card 
//                   sx={{ 
//                     border: '1px solid #144ae920',
//                     transition: 'all 0.2s',
//                     '&:hover': {
//                       boxShadow: 4,
//                       borderColor: '#144ae9'
//                     }
//                   }}
//                 >
//                   {/* DISTRICT IMAGE */}
//                   <Box sx={{ position: 'relative', height: 200, bgcolor: '#144ae9' }}>
//                     {district.headerImage ? (
//                       <img
//                         src={district.headerImage}
//                         alt={district.name}
//                         style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//                       />
//                     ) : (
//                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
//                         <MapPin size={48} color="white" style={{ opacity: 0.5 }} />
//                       </Box>
//                     )}
//                     <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
//                       <Chip
//                         label={district.status}
//                         size="small"
//                         sx={{
//                           backgroundColor: district.status === 'active' ? '#144ae9' : '#6b7280',
//                           color: 'white',
//                           fontWeight: 600,
//                           fontSize: '0.75rem'
//                         }}
//                       />
//                     </Box>
//                   </Box>

//                   {/* DISTRICT INFO */}
//                   <Box sx={{ p: 3 }}>
//                     <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
//                       {district.name}
//                     </Typography>
                    
//                     <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
//                       {district.area && (
//                         <Typography variant="body2" color="#144ae9">
//                           Area: {district.area} sq km
//                         </Typography>
//                       )}
//                       {district.population && (
//                         <Typography variant="body2" color="#144ae9">
//                           Population: {district.population.toLocaleString()}
//                         </Typography>
//                       )}
//                       {district.formationYear && (
//                         <Typography variant="body2" color="#144ae9">
//                           Formed: {district.formationYear}
//                         </Typography>
//                       )}
//                     </Box>

//                     {/* ACTIONS */}
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1 }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Eye size={16} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           View
//                         </Button>
//                       </Link>
//                       <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1 }}>
//                         <Button
//                           fullWidth
//                           startIcon={<Edit size={16} />}
//                           sx={{
//                             backgroundColor: '#144ae910',
//                             color: '#144ae9',
//                             '&:hover': {
//                               backgroundColor: '#144ae920'
//                             }
//                           }}
//                         >
//                           Edit
//                         </Button>
//                       </Link>
//                       <IconButton
//                         onClick={() => setDeleteConfirm(district._id)}
//                         sx={{
//                           color: '#d32f2f',
//                           backgroundColor: '#d32f2f10',
//                           '&:hover': {
//                             backgroundColor: '#d32f2f20'
//                           }
//                         }}
//                       >
//                         <Trash2 size={16} />
//                       </IconButton>
//                     </Box>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete District"
//         message="Are you sure you want to delete this district? This will also affect all associated panchayats."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   );
// }
