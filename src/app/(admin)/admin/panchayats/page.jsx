'use client'
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPanchayats, deletePanchayat, clearError, clearSuccess, clearCache } from '@/redux/slices/panchayatSlice.js';
import { fetchDistricts } from '@/redux/slices/districtSlice.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  MapPin, Plus, Search, Filter, Eye, Trash2, Map as MapIcon
} from 'lucide-react';
import {
  Box, Typography, Button
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Card from '@/components/ui/Card';

export default function AllPanchayatsPage() {
  const dispatch = useDispatch();
  const { panchayats, loading, error, success } = useSelector((state) => state.panchayat);
  const { districts } = useSelector((state) => state.district);

  const [filters, setFilters] = useState({ status: '', district: '', search: '' });
  const [appliedFilters, setAppliedFilters] = useState({ status: '', district: '', search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(clearCache());
    dispatch(fetchPanchayats({ limit: 100 }));
    
    if (districts.length === 0) {
      dispatch(fetchDistricts({ limit: 100 }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      dispatch(clearCache());
      dispatch(fetchPanchayats({ limit: 100 }));
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  // CLIENT-SIDE FILTERING using appliedFilters
  const filteredPanchayats = useMemo(() => {
    let filtered = [...panchayats];

    // Filter by search
    if (appliedFilters.search.trim()) {
      const searchLower = appliedFilters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.slug?.toLowerCase().includes(searchLower) ||
        p.block?.toLowerCase().includes(searchLower) ||
        p.district?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by district
    if (appliedFilters.district) {
      filtered = filtered.filter(p => 
        p.district?._id === appliedFilters.district || p.district === appliedFilters.district
      );
    }

    // Filter by status
    if (appliedFilters.status) {
      filtered = filtered.filter(p => p.status === appliedFilters.status);
    }

    return filtered;
  }, [panchayats, appliedFilters]);

  const handleApply = useCallback(() => {
    setAppliedFilters({ ...filters });
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters({ status: '', district: '', search: '' });
    setAppliedFilters({ status: '', district: '', search: '' });
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      setDeletingId(id);
      await dispatch(deletePanchayat(id)).unwrap();
      toast.success('Panchayat deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete panchayat');
    } finally {
      setDeletingId(null);
    }
  }, [dispatch]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Verified', label: 'Verified' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Draft', label: 'Draft' }
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    ...districts.map((d) => ({ value: d._id, label: d.name }))
  ];

  // Calculate status counts from ALL panchayats
  const statusCounts = useMemo(() => {
    return panchayats.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [panchayats]);

  const verifiedCount = statusCounts['Verified'] || 0;
  const pendingCount = statusCounts['Pending'] || 0;
  const draftCount = statusCounts['Draft'] || 0;

  // Check if filters are active
  const hasActiveFilters = appliedFilters.status || appliedFilters.district || appliedFilters.search.trim();

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
      {deletingId && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Deleting Panchayat..."} />
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
              Gram Panchayats ({hasActiveFilters ? filteredPanchayats.length : panchayats.length})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Manage all gram panchayats across Madhya Pradesh
          </Typography>

          {/* Status Summary in Cards */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ 
              bgcolor: '#144ae910', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              border: '1px solid #144ae920'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#144ae9' }}>
                Verified: {verifiedCount}
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: '#f59e0b10', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              border: '1px solid #f59e0b20'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>
                Pending: {pendingCount}
              </Typography>
            </Box>
            <Box sx={{ 
              bgcolor: '#6b728010', 
              px: 2, 
              py: 1, 
              borderRadius: 1,
              border: '1px solid #6b728020'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>
                Draft: {draftCount}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Link href="/panchayats" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
          <Link href="/admin/panchayats/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
              Add Panchayat
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
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="Search panchayats..."
              startIcon={<Search size={18} color="#144ae9" />}
              fullWidth
              sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
            />
          </Box>

          <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
            <SelectField
              label="District"
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              options={districtOptions}
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
              onClick={handleApply}
              disabled={loading}
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
                }
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Card>

      <Card sx={{ border: '1px solid #144ae920' }}>
        {loading && panchayats.length === 0 ? (
          <div className="fixed inset-0 z-[9999]">
            <Loader message={"Loading Panchayats..."} />
          </div>
        ) : filteredPanchayats.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 2 }}>
              {hasActiveFilters ? 'No panchayats match your filters' : 'No panchayats found'}
            </Typography>
            {hasActiveFilters && (
              <Button
                onClick={handleReset}
                sx={{
                  backgroundColor: '#144ae9',
                  color: 'white',
                  '&:hover': { backgroundColor: '#0d3ec7' }
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            {filteredPanchayats.map((panchayat) => (
              <div
                key={panchayat._id}
                className={`bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 ease-in-out overflow-hidden relative ${
                  deletingId === panchayat._id ? 'opacity-60' : 'opacity-100'
                }`}
              >
                {deletingId === panchayat._id && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <span className="text-blue-600 font-semibold text-sm">Deleting...</span>
                  </div>
                )}

                {/* Header Image Section */}
                <div className="relative h-40 sm:h-48 bg-blue-600">
                  {panchayat.headerImage ? (
                    <img
                      src={panchayat.headerImage}
                      alt={panchayat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <MapPin size={40} color="white" className="opacity-50" />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6">

                  {/* Name + Status Row */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate flex-1 mr-2">
                      {panchayat.name}
                    </h3>

                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-white whitespace-nowrap ${
                        panchayat.status === 'Verified'
                          ? 'bg-blue-600'
                          : panchayat.status === 'Pending'
                          ? 'bg-amber-500'
                          : 'bg-gray-500'
                      }`}
                    >
                      {panchayat.status}
                    </span>
                  </div>

                  {/* District + Block Row */}
                  <div className="flex justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm truncate flex-1 mr-2">
                      District: {panchayat?.district?.name || '-'}
                    </p>
                    <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm truncate flex-1">
                      Block: {panchayat.block || '-'}
                    </p>
                  </div>

                  {/* Area + Population Row */}
                  <div className="flex justify-between mb-4 sm:mb-6">
                    {panchayat.basicInfo?.area && (
                      <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
                        Area: {panchayat.basicInfo.area} km²
                      </p>
                    )}
                    {panchayat.basicInfo?.population && (
                      <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
                        Pop: {panchayat.basicInfo.population.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`/admin/panchayats/${panchayat._id}`}
                      className="no-underline"
                    >
                      <button
                        className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </a>

                    <button
                      disabled={deletingId === panchayat._id}
                      onClick={() => setDeleteConfirm(panchayat._id)}
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
        title="Delete Panchayat"
        message="Are you sure you want to delete this panchayat? This will also remove all associated media references."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
        loading={deletingId === deleteConfirm}
      />
    </Box>
  );
}// 'use client'
// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchPanchayats, deletePanchayat, clearError, clearSuccess, clearCache } from '@/redux/slices/panchayatSlice.js';
// import { fetchDistricts } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin, Plus, Search, Filter, Eye, Trash2, Map as MapIcon, X
// } from 'lucide-react';
// import {
//   Box, Typography, Button
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';
// import Card from '@/components/ui/Card';

// export default function AllPanchayatsPage() {
//   const dispatch = useDispatch();
//   const { panchayats, loading, error, success } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({ status: '', district: '', search: '' });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);

//   // Fetch data on mount
//   useEffect(() => {
//     dispatch(clearCache()); // Clear cache to ensure fresh data
//     dispatch(fetchPanchayats({ limit: 100 }));
    
//     if (districts.length === 0) {
//       dispatch(fetchDistricts({ limit: 100 }));
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
//       dispatch(clearCache());
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   // CLIENT-SIDE FILTERING
//   const filteredPanchayats = useMemo(() => {
//     let filtered = [...panchayats];

//     // Filter by search
//     if (filters.search.trim()) {
//       const searchLower = filters.search.toLowerCase();
//       filtered = filtered.filter(p => 
//         p.name?.toLowerCase().includes(searchLower) ||
//         p.slug?.toLowerCase().includes(searchLower) ||
//         p.block?.toLowerCase().includes(searchLower) ||
//         p.district?.name?.toLowerCase().includes(searchLower)
//       );
//     }

//     // Filter by district
//     if (filters.district) {
//       filtered = filtered.filter(p => 
//         p.district?._id === filters.district || p.district === filters.district
//       );
//     }

//     // Filter by status
//     if (filters.status) {
//       filtered = filtered.filter(p => p.status === filters.status);
//     }

//     return filtered;
//   }, [panchayats, filters]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', district: '', search: '' });
//   }, []);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       setDeletingId(id);
//       await dispatch(deletePanchayat(id)).unwrap();
//       toast.success('Panchayat deleted successfully');
//       setDeleteConfirm(null);
//     } catch (err) {
//       toast.error(err.message || 'Failed to delete panchayat');
//     } finally {
//       setDeletingId(null);
//     }
//   }, [dispatch]);

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'Verified', label: 'Verified' },
//     { value: 'Pending', label: 'Pending' },
//     { value: 'Draft', label: 'Draft' }
//   ];

//   const districtOptions = [
//     { value: '', label: 'All Districts' },
//     ...districts.map((d) => ({ value: d._id, label: d.name }))
//   ];

//   // Calculate status counts from ALL panchayats
//   const statusCounts = useMemo(() => {
//     return panchayats.reduce((acc, p) => {
//       acc[p.status] = (acc[p.status] || 0) + 1;
//       return acc;
//     }, {});
//   }, [panchayats]);

//   const verifiedCount = statusCounts['Verified'] || 0;
//   const pendingCount = statusCounts['Pending'] || 0;
//   const draftCount = statusCounts['Draft'] || 0;

//   // Check if filters are active
//   const hasActiveFilters = filters.status || filters.district || filters.search.trim();

//   return (
//     <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
//       {deletingId && (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Deleting Panchayat..."} />
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
//               Gram Panchayats ({hasActiveFilters ? filteredPanchayats.length : panchayats.length})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all gram panchayats across Madhya Pradesh
//           </Typography>

//           {/* Status Summary */}
//           <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#144ae9' }} />
//               <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
//                 Verified: {verifiedCount}
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f59e0b' }} />
//               <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
//                 Pending: {pendingCount}
//               </Typography>
//             </Box>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6b7280' }} />
//               <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
//                 Draft: {draftCount}
//               </Typography>
//             </Box>
//           </Box>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/panchayats" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//           <Link href="/admin/panchayats/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//               Add Panchayat
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
//               placeholder="Search panchayats..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="District"
//               value={filters.district}
//               onChange={(e) => setFilters({ ...filters, district: e.target.value })}
//               options={districtOptions}
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

//           {hasActiveFilters && (
//             <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 startIcon={<X size={16} />}
//                 fullWidth={false}
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '44px', sm: '56px' },
//                   minWidth: { xs: '0', sm: '120px' },
//                   flex: { xs: 1, sm: 'unset' },
//                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//                   '&:hover': {
//                     borderColor: '#0d3ec7',
//                     backgroundColor: '#144ae910',
//                     color: '#0d3ec7'
//                   }
//                 }}
//               >
//                 Clear Filters
//               </Button>
//             </Box>
//           )}
//         </Box>
//       </Card>

//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading && panchayats.length === 0 ? (
//           <div className="fixed inset-0 z-[9999]">
//             <Loader message={"Loading Panchayats..."} />
//           </div>
//         ) : filteredPanchayats.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 2 }}>
//               {hasActiveFilters ? 'No panchayats match your filters' : 'No panchayats found'}
//             </Typography>
//             {hasActiveFilters && (
//               <Button
//                 onClick={handleReset}
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   '&:hover': { backgroundColor: '#0d3ec7' }
//                 }}
//               >
//                 Clear Filters
//               </Button>
//             )}
//           </Box>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 justify-center">
//             {filteredPanchayats.map((panchayat) => (
//               <div
//                 key={panchayat._id}
//                 className={`bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 ease-in-out overflow-hidden relative ${
//                   deletingId === panchayat._id ? 'opacity-60' : 'opacity-100'
//                 }`}
//               >
//                 {deletingId === panchayat._id && (
//                   <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
//                     <span className="text-blue-600 font-semibold text-sm">Deleting...</span>
//                   </div>
//                 )}

//                 {/* Header Image Section */}
//                 <div className="relative h-40 sm:h-48 bg-blue-600">
//                   {panchayat.headerImage ? (
//                     <img
//                       src={panchayat.headerImage}
//                       alt={panchayat.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <MapPin size={40} color="white" className="opacity-50" />
//                     </div>
//                   )}
//                 </div>

//                 {/* Content Section */}
//                 <div className="p-4 sm:p-6">

//                   {/* Name + Status Row */}
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate flex-1 mr-2">
//                       {panchayat.name}
//                     </h3>

//                     <span
//                       className={`px-2 py-1 text-xs font-semibold rounded-full text-white whitespace-nowrap ${
//                         panchayat.status === 'Verified'
//                           ? 'bg-blue-600'
//                           : panchayat.status === 'Pending'
//                           ? 'bg-amber-500'
//                           : 'bg-gray-500'
//                       }`}
//                     >
//                       {panchayat.status}
//                     </span>
//                   </div>

//                   {/* District + Block Row */}
//                   <div className="flex justify-between mb-3">
//                     <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm truncate flex-1 mr-2">
//                       District: {panchayat?.district?.name || '-'}
//                     </p>
//                     <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm truncate flex-1">
//                       Block: {panchayat.block || '-'}
//                     </p>
//                   </div>

//                   {/* Area + Population Row */}
//                   <div className="flex justify-between mb-4 sm:mb-6">
//                     {panchayat.basicInfo?.area && (
//                       <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
//                         Area: {panchayat.basicInfo.area} km²
//                       </p>
//                     )}
//                     {panchayat.basicInfo?.population && (
//                       <p className="text-sm font-semibold text-gray-600 text-xs sm:text-sm">
//                         Pop: {panchayat.basicInfo.population.toLocaleString()}
//                       </p>
//                     )}
//                   </div>

//                   {/* Buttons */}
//                   <div className="grid grid-cols-2 gap-2">
//                     <a
//                       href={`/admin/panchayats/${panchayat._id}`}
//                       className="no-underline"
//                     >
//                       <button
//                         className="w-full bg-blue-50 text-blue-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         <Eye size={14} />
//                         View
//                       </button>
//                     </a>

//                     <button
//                       disabled={deletingId === panchayat._id}
//                       onClick={() => setDeleteConfirm(panchayat._id)}
//                       className="w-full bg-red-50 text-red-600 text-xs sm:text-sm py-2 px-3 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       <Trash2 size={14} />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Panchayat"
//         message="Are you sure you want to delete this panchayat? This will also remove all associated media references."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//         loading={deletingId === deleteConfirm}
//       />
//     </Box>
//   );
// }


// 'use client'
// import { useEffect, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice.js';
// import { fetchDistricts } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin, Plus, Search, Filter, Eye, Trash2, Map as MapIcon
// } from 'lucide-react';
// import {
//   Box, Typography, Button
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';
// import Card from '@/components/ui/Card';

// export default function AllPanchayatsPage() {
//   const dispatch = useDispatch();
//   const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({ status: '', district: '', search: '' });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     if (panchayats.length === 0) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
//     if (districts.length === 0) {
//       dispatch(fetchDistricts({ limit: 100 }));
//     }
//   }, [dispatch, panchayats.length, districts.length]);

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
//     if (filters.district) params.district = filters.district;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchPanchayats(params));
//   }, [filters, dispatch]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', district: '', search: '' });
//     dispatch(fetchPanchayats({ limit: 100 }));
//   }, [dispatch]);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       await dispatch(deletePanchayat(id)).unwrap();
//       toast.success('Panchayat deleted successfully');
//       setDeleteConfirm(null);
//     } catch (err) {
//       toast.error(err.message || 'Failed to delete panchayat');
//     }
//   }, [dispatch]);

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'Verified', label: 'Verified' },
//     { value: 'Pending', label: 'Pending' },
//     { value: 'Draft', label: 'Draft' }
//   ];

//   const districtOptions = [
//     { value: '', label: 'All Districts' },
//     ...districts.map((d) => ({ value: d._id, label: d.name }))
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
//               Gram Panchayats ({totalPanchayats || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all gram panchayats across Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/panchayats" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//           <Link href="/admin/panchayats/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//               Add Panchayat
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
//               placeholder="Search panchayats..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="District"
//               value={filters.district}
//               onChange={(e) => setFilters({ ...filters, district: e.target.value })}
//               options={districtOptions}
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
//         {loading && panchayats.length === 0 ? (
//           <div className="fixed inset-0 z-[9999]">
//             <Loader message={"Loading Panchayats..."} />
//           </div>
//         ) : panchayats.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No panchayats found
//             </Typography>
//           </Box>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 justify-center">
//             {panchayats.map((panchayat) => (
//               <div
//                 key={panchayat._id}
//                 className="bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 ease-in-out overflow-hidden"
//               >
//                 {/* Header Image Section */}
//                 <div className="relative h-40 sm:h-48 bg-blue-600">
//                   {panchayat.headerImage ? (
//                     <img
//                       src={panchayat.headerImage}
//                       alt={panchayat.name}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="flex items-center justify-center h-full">
//                       <MapPin size={40} color="white" className="opacity-50" />
//                     </div>
//                   )}
//                 </div>

//                 {/* Content Section */}
//                 <div className="p-4 sm:p-6">

//                   {/* First Row - Name and Status */}
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
//                       {panchayat.name}
//                     </h3>

//                     <span
//                       className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
//                         panchayat.status === 'Verified'
//                           ? 'bg-blue-600'
//                           : panchayat.status === 'Pending'
//                           ? 'bg-amber-500'
//                           : 'bg-gray-500'
//                       }`}
//                     >
//                       {panchayat.status}
//                     </span>
//                   </div>

//                   {/* Details Section - Updated to use basicInfo */}
//                   <div className="grid grid-cols-2 gap-2 mb-2">
//                     <p className="text-sm font-semibold text-gray-600 truncate">
//                       <span className="font-medium">District:</span> {panchayat?.district?.name || '-'}
//                     </p>

//                     <p className="text-sm font-semibold text-gray-600 truncate">
//                       <span className="font-medium">Area:</span> {panchayat.basicInfo?.area ? `${panchayat.basicInfo.area} sq km` : '-'}
//                     </p>
//                   </div>

//                   <div className="grid grid-cols-2 gap-2 mb-4">
//                     <p className="text-sm font-semibold text-gray-600 truncate">
//                       <span className="font-medium">Block:</span> {panchayat.block || '-'}
//                     </p>

//                     <p className="text-sm font-semibold text-gray-600 truncate">
//                       <span className="font-medium">Population:</span> {panchayat.basicInfo?.population ? panchayat.basicInfo.population.toLocaleString() : '-'}
//                     </p>
//                   </div>

//                   {/* Buttons Section */}
//                   <div className="flex gap-2">
//                     {/* VIEW BUTTON */}
//                     <a
//                       href={`/admin/panchayats/${panchayat._id}`}
//                       className="flex-1 min-w-0 no-underline"
//                     >
//                       <button
//                         className="w-full bg-blue-50 text-blue-600 text-sm py-2 px-4 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
//                       >
//                         <Eye size={14} />
//                         View
//                       </button>
//                     </a>

//                     {/* DELETE BUTTON */}
//                     <button
//                       onClick={() => setDeleteConfirm(panchayat._id)}
//                       className="flex-1 min-w-0 bg-red-50 text-red-600 text-sm py-2 px-4 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
//                     >
//                       <Trash2 size={14} />
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Panchayat"
//         message="Are you sure you want to delete this panchayat? This will also remove all associated media references."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   );
// }

// 'use client'
// import { useEffect, useState, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice.js';
// import { fetchDistricts } from '@/redux/slices/districtSlice.js';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   MapPin, Plus, Search, Filter, Edit, Trash2, Eye, Map as MapIcon
// } from 'lucide-react';
// import {
//   Box, Typography, Grid, Card, Button, Chip, IconButton
// } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

// export default function AllPanchayatsPage() {
//   const dispatch = useDispatch();
//   const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat);
//   const { districts } = useSelector((state) => state.district);

//   const [filters, setFilters] = useState({ status: '', district: '', search: '' });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     if (panchayats.length === 0) {
//       dispatch(fetchPanchayats({ limit: 100 }));
//     }
//     if (districts.length === 0) {
//       dispatch(fetchDistricts({ limit: 100 }));
//     }
//   }, [dispatch, panchayats.length, districts.length]);

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
//     if (filters.district) params.district = filters.district;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchPanchayats(params));
//   }, [filters, dispatch]);

//   const handleReset = useCallback(() => {
//     setFilters({ status: '', district: '', search: '' });
//     dispatch(fetchPanchayats({ limit: 100 }));
//   }, [dispatch]);

//   const handleDelete = useCallback(async (id) => {
//     try {
//       await dispatch(deletePanchayat(id)).unwrap();
//       toast.success('Panchayat deleted successfully');
//       setDeleteConfirm(null);
//     } catch (err) {
//       toast.error(err.message || 'Failed to delete panchayat');
//     }
//   }, [dispatch]);

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'verified', label: 'Verified' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'draft', label: 'Draft' }
//   ];

//   const districtOptions = [
//     { value: '', label: 'All Districts' },
//     ...districts.map((d) => ({ value: d._id, label: d.name }))
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
//               Gram Panchayats ({totalPanchayats || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//             Manage all gram panchayats across Madhya Pradesh
//           </Typography>
//         </Box>
//         <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
//           <Link href="/panchayats" target="_blank" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//           <Link href="/admin/panchayats/create" style={{ textDecoration: 'none', flex: { xs: 1, sm: 'unset' } }}>
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
//               Add Panchayat
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
//               placeholder="Search panchayats..."
//               startIcon={<Search size={18} color="#144ae9" />}
//               fullWidth
//               sx={{ '& .MuiInputBase-root': { height: { xs: '44px', sm: '56px' } } }}
//             />
//           </Box>

//           <Box sx={{ width: { xs: '100%', sm: '160px' } }}>
//             <SelectField
//               label="District"
//               value={filters.district}
//               onChange={(e) => setFilters({ ...filters, district: e.target.value })}
//               options={districtOptions}
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
//         {loading && panchayats.length === 0 ? (
//           <div className="fixed inset-0 z-[9999]">
//             <Loader message={"Panchayats..."} />
//           </div>
//         ) : panchayats.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
//             <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
//             <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
//               No panchayats found
//             </Typography>
//           </Box>
//         ) : (
//           // <Grid justifyContent='center' container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
//           //   {panchayats.map((panchayat) => (
//           //     <Grid item xs={12} sm={6} md={4} key={panchayat._id}>
//           //       <Card
//           //         sx={{
//           //           border: '1px solid #144ae920',
//           //           transition: 'all 0.2s',
//           //           '&:hover': { boxShadow: 4, borderColor: '#144ae9' }
//           //         }}
//           //       >
//           //         <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
//           //           {panchayat.headerImage ? (
//           //             <img
//           //               src={panchayat.headerImage}
//           //               alt={panchayat.name}
//           //               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//           //             />
//           //           ) : (
//           //             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
//           //               <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
//           //             </Box>
//           //           )}
//           //         </Box>

//           //         <Box sx={{ p: { xs: 2, sm: 3 } }}>

//           //           {/* ---------------- FIRST ROW --------------- */}
//           //           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//           //             <Typography
//           //               variant="h6"
//           //               fontWeight={600}
//           //               color="text.primary"
//           //               sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
//           //             >
//           //               {panchayat.name}
//           //             </Typography>

//           //             <Chip
//           //               label={panchayat.status}
//           //               size="small"
//           //               sx={{
//           //                 backgroundColor:
//           //                   panchayat.status === 'verified'
//           //                     ? '#144ae9'
//           //                     : panchayat.status === 'pending'
//           //                       ? '#f59e0b'
//           //                       : '#6b7280',
//           //                 color: 'white',
//           //                 fontWeight: 600,
//           //                 fontSize: '0.7rem'
//           //               }}
//           //             />
//           //           </Box>

//           //           {/* --------------- DETAILS SECTION ---------- */}

//           //           {/* Row 1: District | Area */}
//           //           <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
//           //             <Typography variant="body2" >
//           //               District: {panchayat?.district?.name || '-'}
//           //             </Typography>

//           //             <Typography variant="body2" >
//           //               Area: {panchayat.area ? `${panchayat.area} sq km` : '-'}
//           //             </Typography>
//           //           </Box>

//           //           {/* Row 2: Block | Population */}
//           //           <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
//           //             <Typography variant="body2" >
//           //               Block: {panchayat.block || '-'}
//           //             </Typography>

//           //             <Typography variant="body2" >
//           //               Population: {panchayat.population ? panchayat.population.toLocaleString() : '-'}
//           //             </Typography>
//           //           </Box>

//           //           {/* ---------------- BUTTONS ---------------- */}
//           //           <Box sx={{ display: 'flex', gap: 1 }}>
//           //             {/* VIEW BUTTON */}
//           //             <Link
//           //               href={`/admin/panchayats/${panchayat._id}`}
//           //               style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
//           //             >
//           //               <Button
//           //                 fullWidth
//           //                 startIcon={<Eye size={14} />}
//           //                 sx={{
//           //                   backgroundColor: '#144ae910',
//           //                   color: '#144ae9',
//           //                   fontSize: { xs: '0.75rem', sm: '0.875rem' },
//           //                   py: { xs: 0.75, sm: 1 },
//           //                   '&:hover': { backgroundColor: '#144ae920' }
//           //                 }}
//           //               >
//           //                 View
//           //               </Button>
//           //             </Link>

//           //             {/* DELETE BUTTON */}
//           //             <Button
//           //               fullWidth
//           //               onClick={() => setDeleteConfirm(panchayat._id)}
//           //               startIcon={<Trash2 size={14} />}
//           //               sx={{
//           //                 flex: 1,
//           //                 minWidth: 0,
//           //                 backgroundColor: '#d32f2f10',
//           //                 color: '#d32f2f',
//           //                 fontSize: { xs: '0.75rem', sm: '0.875rem' },
//           //                 py: { xs: 0.75, sm: 1 },
//           //                 '&:hover': { backgroundColor: '#d32f2f20' }
//           //               }}
//           //             >
//           //               Delete
//           //             </Button>
//           //           </Box>



//           //         </Box>
//           //       </Card>

//           //     </Grid>
//           //   ))}
//           // </Grid>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 justify-center">
//   {panchayats.map((panchayat) => (
//     <div
//       key={panchayat._id}
//       className="bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-[#144ae9] hover:shadow-sm  transition-all duration-200 ease-in-out overflow-hidden"
//     >
//       {/* Header Image Section */}
//       <div className="relative h-40 sm:h-48 bg-blue-600">
//         {panchayat.headerImage ? (
//           <img
//             src={panchayat.headerImage}
//             alt={panchayat.name}
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

//         {/* First Row - Name and Status */}
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
//             {panchayat.name}
//           </h3>

//           <span
//             className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
//               panchayat.status === 'verified'
//                 ? 'bg-blue-600'
//                 : panchayat.status === 'pending'
//                 ? 'bg-amber-500'
//                 : 'bg-gray-500'
//             }`}
//           >
//             {panchayat.status}
//           </span>
//         </div>

//         {/* Details Section */}

//         {/* Row 1: District | Area */}
//         <div className="grid grid-cols-2 gap-2 mb-2">
//           <p className="text-sm font-semibold text-gray-600 truncate">
//             <span className="font-medium">District:</span> {panchayat?.district?.name || '-'}
//           </p>

//           <p className="text-sm font-semibold text-gray-600 truncate">
//             <span className="font-medium">Area:</span> {panchayat.area ? `${panchayat.area} sq km` : '-'}
//           </p>
//         </div>

//         {/* Row 2: Block | Population */}
//         <div className="grid grid-cols-2 gap-2 mb-4">
//           <p className="text-sm font-semibold text-gray-600 truncate">
//             <span className="font-medium">Block:</span> {panchayat.block || '-'}
//           </p>

//           <p className="text-sm font-semibold text-gray-600 truncate">
//             <span className="font-medium">Population:</span> {panchayat.population ? panchayat.population.toLocaleString() : '-'}
//           </p>
//         </div>

//         {/* Buttons Section */}
//         <div className="flex gap-2">
//           {/* VIEW BUTTON */}
//           <a
//             href={`/admin/panchayats/${panchayat._id}`}
//             className="flex-1 min-w-0 no-underline"
//           >
//             <button
//               className="w-full bg-blue-50 text-blue-600 text-sm py-2 px-4 rounded-md border border-transparent hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
//             >
//               <Eye size={14} />
//               View
//             </button>
//           </a>

//           {/* DELETE BUTTON */}
//           <button
//             onClick={() => setDeleteConfirm(panchayat._id)}
//             className="flex-1 min-w-0 bg-red-50 text-red-600 text-sm py-2 px-4 rounded-md border border-transparent hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
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
//         title="Delete Panchayat"
//         message="Are you sure you want to delete this panchayat? This will also remove all associated media references."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   );
// }

