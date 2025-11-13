'use client'
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDistricts, deleteDistrict, clearError, clearSuccess } from '@/redux/slices/districtSlice.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Map as MapIcon
} from 'lucide-react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AllDistrictsPage() {
  const dispatch = useDispatch();
  const { districts, loading, error, success, totalDistricts } = useSelector((state) => state.district);

  const [filters, setFilters] = useState({ status: '', search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (districts.length === 0) {
      dispatch(fetchDistricts({ limit: 100 }));
    }
  }, [dispatch, districts.length]);

  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
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
      await dispatch(deleteDistrict(id)).unwrap();
      toast.success('District deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete district');
    }
  }, [dispatch]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 } }}>
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
        {loading && districts.length === 0 ? (
          <div className="fixed inset-0 z-[9999]">
          <Loader message={"Loading Districts..."} />
        </div>
        ) : districts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              No districts found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
            {districts.map((district) => (
              <Grid item xs={12} sm={6} md={4} key={district._id}>
                <Card 
                  sx={{ 
                    border: '1px solid #144ae920',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, borderColor: '#144ae9' }
                  }}
                >
                  <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
                    {district.headerImage ? (
                      <img
                        src={district.headerImage}
                        alt={district.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        label={district.status}
                        size="small"
                        sx={{
                          backgroundColor: district.status === 'active' ? '#144ae9' : '#6b7280',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {district.name}
                    </Typography>
                    
                    <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {district.area && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Area: {district.area} sq km
                        </Typography>
                      )}
                      {district.population && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Population: {district.population.toLocaleString()}
                        </Typography>
                      )}
                      {district.formationYear && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Formed: {district.formationYear}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
                        <Button
                          fullWidth
                          startIcon={<Eye size={14} />}
                          sx={{
                            backgroundColor: '#144ae910',
                            color: '#144ae9',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 0.75, sm: 1 },
                            '&:hover': { backgroundColor: '#144ae920' }
                          }}
                        >
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/districts/${district._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
                        <Button
                          fullWidth
                          startIcon={<Edit size={14} />}
                          sx={{
                            backgroundColor: '#144ae910',
                            color: '#144ae9',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            py: { xs: 0.75, sm: 1 },
                            '&:hover': { backgroundColor: '#144ae920' }
                          }}
                        >
                          Edit
                        </Button>
                      </Link>
                      <IconButton
                        onClick={() => setDeleteConfirm(district._id)}
                        sx={{
                          color: '#d32f2f',
                          backgroundColor: '#d32f2f10',
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          '&:hover': { backgroundColor: '#d32f2f20' }
                        }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
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
      />
    </Box>
  );
}

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
