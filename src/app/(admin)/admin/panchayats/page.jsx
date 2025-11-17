'use client'
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from '@/redux/slices/panchayatSlice.js';
import { fetchDistricts } from '@/redux/slices/districtSlice.js';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  MapPin, Plus, Search, Filter, Edit, Trash2, Eye, Map as MapIcon
} from 'lucide-react';
import {
  Box, Typography, Grid, Card, Button, Chip, IconButton
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AllPanchayatsPage() {
  const dispatch = useDispatch();
  const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat);
  const { districts } = useSelector((state) => state.district);

  const [filters, setFilters] = useState({ status: '', district: '', search: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (panchayats.length === 0) {
      dispatch(fetchPanchayats({ limit: 100 }));
    }
    if (districts.length === 0) {
      dispatch(fetchDistricts({ limit: 100 }));
    }
  }, [dispatch, panchayats.length, districts.length]);

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
    if (filters.district) params.district = filters.district;
    if (filters.search) params.search = filters.search;
    dispatch(fetchPanchayats(params));
  }, [filters, dispatch]);

  const handleReset = useCallback(() => {
    setFilters({ status: '', district: '', search: '' });
    dispatch(fetchPanchayats({ limit: 100 }));
  }, [dispatch]);

  const handleDelete = useCallback(async (id) => {
    try {
      await dispatch(deletePanchayat(id)).unwrap();
      toast.success('Panchayat deleted successfully');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete panchayat');
    }
  }, [dispatch]);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'draft', label: 'Draft' }
  ];

  const districtOptions = [
    { value: '', label: 'All Districts' },
    ...districts.map((d) => ({ value: d._id, label: d.name }))
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
              Gram Panchayats ({totalPanchayats || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Manage all gram panchayats across Madhya Pradesh
          </Typography>
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
        {loading && panchayats.length === 0 ? (
          <div className="fixed inset-0 z-[9999]">
            <Loader message={"Panchayats..."} />
          </div>
        ) : panchayats.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 } }}>
            <MapPin size={40} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} className="sm:w-12 sm:h-12" />
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              No panchayats found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ p: { xs: 2, sm: 3 } }}>
            {panchayats.map((panchayat) => (
              <Grid item xs={12} sm={6} md={4} key={panchayat._id}>
                {/* <Card 
                  sx={{ 
                    border: '1px solid #144ae920',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 4, borderColor: '#144ae9' }
                  }}
                >
                  <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
                    {panchayat.headerImage ? (
                      <img
                        src={panchayat.headerImage}
                        alt={panchayat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
                      </Box>
                    )}
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip
                        label={panchayat.status}
                        size="small"
                        sx={{
                          backgroundColor: panchayat.status === 'verified' ? '#144ae9' : panchayat.status === 'pending' ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                      {panchayat.name}
                    </Typography>
                    
                    <Box sx={{ mb: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {panchayat.district && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          District: {panchayat.district.name}
                        </Typography>
                      )}
                      {panchayat.block && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Block: {panchayat.block}
                        </Typography>
                      )}
                      {panchayat.population && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Population: {panchayat.population.toLocaleString()}
                        </Typography>
                      )}
                      {panchayat.area && (
                        <Typography variant="body2" color="#144ae9" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          Area: {panchayat.area} sq km
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Link href={`/admin/panchayats/${panchayat._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
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
                      <Link href={`/admin/panchayats/${panchayat._id}`} style={{ textDecoration: 'none', flex: 1, minWidth: '100px' }}>
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
                        onClick={() => setDeleteConfirm(panchayat._id)}
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
                </Card> */}<Card 
  sx={{ 
    border: '1px solid #144ae920',
    transition: 'all 0.2s',
    '&:hover': { boxShadow: 4, borderColor: '#144ae9' }
  }}
>
  <Box sx={{ position: 'relative', height: { xs: 160, sm: 200 }, bgcolor: '#144ae9' }}>
    {panchayat.headerImage ? (
      <img
        src={panchayat.headerImage}
        alt={panchayat.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <MapPin size={40} color="white" style={{ opacity: 0.5 }} />
      </Box>
    )}
  </Box>

  <Box sx={{ p: { xs: 2, sm: 3 } }}>

    {/* ---------------- FIRST ROW --------------- */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography
        variant="h6"
        fontWeight={600}
        color="text.primary"
        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
      >
        {panchayat.name}
      </Typography>

      <Chip
        label={panchayat.status}
        size="small"
        sx={{
          backgroundColor:
            panchayat.status === 'verified'
              ? '#144ae9'
              : panchayat.status === 'pending'
              ? '#f59e0b'
              : '#6b7280',
          color: 'white',
          fontWeight: 600,
          fontSize: '0.7rem'
        }}
      />
    </Box>

    {/* --------------- DETAILS SECTION ---------- */}

    {/* Row 1: District | Area */}
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
      <Typography variant="body2" >
        District: {panchayat?.district?.name || '-'}
      </Typography>

      <Typography variant="body2" >
        Area: {panchayat.area ? `${panchayat.area} sq km` : '-'}
      </Typography>
    </Box>

    {/* Row 2: Block | Population */}
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
      <Typography variant="body2" >
        Block: {panchayat.block || '-'}
      </Typography>

      <Typography variant="body2" >
        Population: {panchayat.population ? panchayat.population.toLocaleString() : '-'}
      </Typography>
    </Box>

    {/* ---------------- BUTTONS ---------------- */}
  <Box sx={{ display: 'flex', gap: 1 }}>
  {/* VIEW BUTTON */}
  <Link
    href={`/admin/panchayats/${panchayat._id}`}
    style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
  >
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

  {/* DELETE BUTTON */}
  <Button
    fullWidth
    onClick={() => setDeleteConfirm(panchayat._id)}
    startIcon={<Trash2 size={14} />}
    sx={{
      flex: 1,
      minWidth: 0,
      backgroundColor: '#d32f2f10',
      color: '#d32f2f',
      fontSize: { xs: '0.75rem', sm: '0.875rem' },
      py: { xs: 0.75, sm: 1 },
      '&:hover': { backgroundColor: '#d32f2f20' }
    }}
  >
    Delete
  </Button>
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
        title="Delete Panchayat"
        message="Are you sure you want to delete this panchayat? This will also remove all associated media references."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
      />
    </Box>
  );
}


// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import Link from "next/link"
// import { MapPin, Plus, Search, Filter, Trash2, Eye } from "lucide-react"
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"
// import Card from "@/components/ui/Card"
// import Button from "@/components/ui/Button"

// export default function AllPanchayatsPage() {
//   const dispatch = useDispatch()
//   const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat)

//   const [filters, setFilters] = useState({
//     status: "",
//     block: "",
//     search: "",
//   })
//   const [deleteConfirm, setDeleteConfirm] = useState(null)

//   // INITIAL LOAD
//   useEffect(() => {
//     dispatch(fetchPanchayats({ limit: 100 }))
//   }, [])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully!")
//       dispatch(clearSuccess())
//       handleSearch()
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

//   const handleSearch = () => {
//     const params = { limit: 100 }
//     if (filters.status) params.status = filters.status
//     if (filters.block) params.block = filters.block
//     if (filters.search) params.search = filters.search
//     dispatch(fetchPanchayats(params))
//   }

//   const handleReset = () => {
//     setFilters({ status: "", block: "", search: "" })
//     dispatch(fetchPanchayats({ limit: 100 }))
//   }

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deletePanchayat(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const statusOptions = [
//     { value: "", label: "All Status" },
//     { value: "verified", label: "Verified" },
//     { value: "pending", label: "Pending" },
//     { value: "draft", label: "Draft" }
//   ]

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "verified":
//         return { backgroundColor: '#144ae9', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   return (
//     <div className="p-4 md:p-6">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div>
//           <div className="flex items-center gap-3 mb-2">
//             <MapPin size={32} color="#144ae9" />
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//               Gram Panchayats ({totalPanchayats || 0})
//             </h1>
//           </div>
//           <div className="text-sm text-gray-600">
//             Manage all gram panchayats and their information
//           </div>
//         </div>
//         <Link href="/admin/panchayats/create" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<Plus size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Add Panchayat
//           </Button>
//         </Link>
//       </div>

//       {/* FILTERS CARD */}
//       <div className="mb-6">
//         <Card sx={{
//           p: { xs: 2, sm: 3 },
//           border: '1px solid #144ae920',
//           height: '100%'
//         }}>
//           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center flex-wrap">
//             {/* SEARCH FIELD */}
//             <div className="flex-1 min-w-full sm:min-w-64">
//               <TextField
//                 label="Search"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                 placeholder="Search by panchayat name..."
//                 startIcon={<Search size={20} color="#144ae9" />}
//                 fullWidth
//                 sx={{
//                   '& .MuiInputBase-root': {
//                     height: { xs: '48px', sm: '56px' }
//                   }
//                 }}
//               />
//             </div>

//             {/* STATUS FILTER */}
//             <div className="w-full sm:w-48">
//               <SelectField
//                 label="Status"
//                 value={filters.status}
//                 onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                 options={statusOptions}
//                 fullWidth
//                 sx={{
//                   '& .MuiInputBase-root': {
//                     height: { xs: '48px', sm: '56px' }
//                   }
//                 }}
//               />
//             </div>

//             {/* BLOCK FILTER */}
//             <div className="w-full sm:w-48">
//               <TextField
//                 label="Block"
//                 value={filters.block}
//                 onChange={(e) => setFilters({ ...filters, block: e.target.value })}
//                 placeholder="Filter by block..."
//                 fullWidth
//                 sx={{
//                   '& .MuiInputBase-root': {
//                     height: { xs: '48px', sm: '56px' }
//                   }
//                 }}
//               />
//             </div>

//             {/* BUTTONS */}
//             <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading}
//                 startIcon={<Filter size={18} />}
//                 size="large"
//                 sx={{
//                   backgroundColor: '#144ae9',
//                   color: 'white',
//                   height: { xs: '48px', sm: '56px' },
//                   minWidth: '100px',
//                   '&:hover': {
//                     backgroundColor: '#0d3ec7',
//                     color: 'white'
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: '#144ae950',
//                     color: 'white'
//                   },
//                   fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 Apply
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 size="large"
//                 sx={{
//                   borderColor: '#144ae9',
//                   color: '#144ae9',
//                   height: { xs: '48px', sm: '56px' },
//                   minWidth: '100px',
//                   '&:hover': {
//                     borderColor: '#0d3ec7',
//                     backgroundColor: '#144ae910',
//                     color: '#0d3ec7'
//                   },
//                   fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                   whiteSpace: 'nowrap'
//                 }}
//               >
//                 Reset
//               </Button>
//             </div>
//           </div>
//         </Card>
//       </div>

//       {/* PANCHAYATS TABLE */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading ? (
//           <div className="fixed inset-0 z-[9999]">
//             <Loader message={"Loading..."} />
//           </div>
//         ) : panchayats.length === 0 ? (
//           <div className="text-center py-8">
//             <MapPin size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
//             <div className="text-gray-600">No panchayats found</div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[650px]">
//               <thead>
//                 <tr style={{ backgroundColor: '#144ae905' }}>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px' }}>Name</th>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px' }}>Block</th>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px' }}>Status</th>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px', display: 'none', sm: 'table-cell' }}>Population</th>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px', display: 'none', sm: 'table-cell' }}>Created</th>
//                   <th style={{ fontWeight: 600, color: '#144ae9', textAlign: 'left', padding: '16px' }}>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {panchayats.map((panchayat) => (
//                   <tr
//                     key={panchayat._id}
//                     style={{
//                       borderBottom: '1px solid #e5e7eb',
//                       ':lastChild': { borderBottom: 0 },
//                       ':hover': { backgroundColor: '#144ae905' }
//                     }}
//                   >
//                     <td style={{ fontWeight: 500, padding: '16px' }}>{panchayat.name}</td>
//                     <td style={{ padding: '16px' }}>{panchayat.block}</td>
//                     <td style={{ padding: '16px' }}>
//                       <span
//                         style={{
//                           display: 'inline-flex',
//                           alignItems: 'center',
//                           padding: '4px 12px',
//                           borderRadius: '16px',
//                           fontSize: '0.75rem',
//                           fontWeight: 500,
//                           ...getStatusColor(panchayat.status)
//                         }}
//                       >
//                         {panchayat.status}
//                       </span>
//                     </td>
//                     <td style={{ padding: '16px', display: 'none', sm: 'table-cell' }}>
//                       {panchayat.population?.toLocaleString() || "N/A"}
//                     </td>
//                     <td style={{ padding: '16px', display: 'none', sm: 'table-cell' }}>
//                       {new Date(panchayat.createdAt).toLocaleDateString()}
//                     </td>
//                     <td style={{ padding: '16px' }}>
//                       <div className="flex gap-2">
//                         <Link href={`/admin/panchayats/${panchayat._id}`} style={{ textDecoration: 'none' }}>
//                           <Button
//                             size="small"
//                             startIcon={<Eye size={16} />}
//                             sx={{
//                               backgroundColor: '#144ae910',
//                               color: '#144ae9',
//                               '&:hover': {
//                                 backgroundColor: '#144ae920'
//                               }
//                             }}
//                           >
//                             View
//                           </Button>
//                         </Link>
//                         <Button
//                           size="small"
//                           startIcon={<Trash2 size={16} />}
//                           onClick={() => setDeleteConfirm(panchayat._id)}
//                           sx={{
//                             backgroundColor: '#d32f2f10',
//                             color: '#d32f2f',
//                             '&:hover': {
//                               backgroundColor: '#d32f2f20'
//                             }
//                           }}
//                         >
//                           Delete
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Panchayat"
//         message="Are you sure you want to delete this panchayat? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </div>
//   )
// }

// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import Link from "next/link"
// import { MapPin, Plus, Search, Filter, Trash2, Eye } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   Button,
//   Chip,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
// } from '@mui/material'
// import Loader from "@/components/ui/Loader"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import ConfirmDialog from "@/components/ui/ConfirmDialog"

// export default function AllPanchayatsPage() {
//   const dispatch = useDispatch()
//   const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat)

//   const [filters, setFilters] = useState({
//     status: "",
//     block: "",
//     search: "",
//   })
//   const [deleteConfirm, setDeleteConfirm] = useState(null)

//   // INITIAL LOAD
//   useEffect(() => {
//     dispatch(fetchPanchayats({ limit: 100 }))
//   }, [])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("Action completed successfully!")
//       dispatch(clearSuccess())
//       handleSearch()
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

//   const handleSearch = () => {
//     const params = { limit: 100 }
//     if (filters.status) params.status = filters.status
//     if (filters.block) params.block = filters.block
//     if (filters.search) params.search = filters.search
//     dispatch(fetchPanchayats(params))
//   }

//   const handleReset = () => {
//     setFilters({ status: "", block: "", search: "" })
//     dispatch(fetchPanchayats({ limit: 100 }))
//   }

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deletePanchayat(id)).unwrap()
//       setDeleteConfirm(null)
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const statusOptions = [
//     { value: "", label: "All Status" },
//     { value: "verified", label: "Verified" },
//     { value: "pending", label: "Pending" },
//     { value: "draft", label: "Draft" }
//   ]

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "verified":
//         return { backgroundColor: '#144ae9', color: 'white' }
//       case "pending":
//         return { backgroundColor: '#f59e0b', color: 'white' }
//       default:
//         return { backgroundColor: '#6b7280', color: 'white' }
//     }
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{
//         display: 'flex',
//         flexDirection: { xs: 'column', sm: 'row' },
//         justifyContent: 'space-between',
//         alignItems: { xs: 'flex-start', sm: 'center' },
//         gap: 2,
//         mb: 4
//       }}>
//         <Box>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
//             <MapPin size={32} color="#144ae9" />
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               Gram Panchayats ({totalPanchayats || 0})
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Manage all gram panchayats and their information
//           </Typography>
//         </Box>
//         <Link href="/admin/panchayats/create" style={{ textDecoration: 'none' }}>
//           <Button
//             startIcon={<Plus size={20} />}
//             sx={{
//               backgroundColor: '#144ae9',
//               color: 'white',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Add Panchayat
//           </Button>
//         </Link>
//       </Box>

//       {/* STATS & FILTERS IN ONE ROW */}
//       <Box sx={{
//         display: 'flex',
//         gap: 3,
//         mb: 4,
//         flexDirection: { xs: 'column', md: 'row' }
//       }}>
//         {/* FILTERS CARD - Full width since stats card is removed */}
//         <Box sx={{ width: { xs: '100%', md: '100%' } }}>
//           <Card sx={{
//             p: { xs: 2, sm: 3 },
//             border: '1px solid #144ae920',
//             height: '100%'
//           }}>
//             <Box sx={{
//               display: 'flex',
//               gap: { xs: 2, sm: 2, md: 2 },
//               alignItems: 'center',
//               flexDirection: { xs: 'column', sm: 'row' },
//               flexWrap: 'wrap'
//             }}>
//               {/* SEARCH FIELD - Flexible width */}
//               <Box sx={{
//                 flex: 1,
//                 minWidth: { xs: '100%', sm: '200px' },
//                 display: 'flex',
//                 alignItems: 'center'
//               }}>
//                 <TextField
//                   label="Search"
//                   value={filters.search}
//                   onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                   placeholder="Search by panchayat name..."
//                   startIcon={<Search size={20} color="#144ae9" />}
//                   fullWidth
//                   sx={{
//                     '& .MuiInputBase-root': {
//                       height: { xs: '48px', sm: '56px' }
//                     }
//                   }}
//                 />
//               </Box>

//               {/* STATUS FILTER */}
//               <Box sx={{
//                 width: { xs: '100%', sm: '180px', md: '180px' },
//                 display: 'flex',
//                 alignItems: 'center'
//               }}>
//                 <SelectField
//                   label="Status"
//                   value={filters.status}
//                   onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                   options={statusOptions}
//                   fullWidth
//                   sx={{
//                     '& .MuiInputBase-root': {
//                       height: { xs: '48px', sm: '56px' }
//                     }
//                   }}
//                 />
//               </Box>

//               {/* BLOCK FILTER */}
//               <Box sx={{
//                 width: { xs: '100%', sm: '180px', md: '180px' },
//                 display: 'flex',
//                 alignItems: 'center'
//               }}>
//                 <TextField
//                   label="Block"
//                   value={filters.block}
//                   onChange={(e) => setFilters({ ...filters, block: e.target.value })}
//                   placeholder="Filter by block..."
//                   fullWidth
//                   sx={{
//                     '& .MuiInputBase-root': {
//                       height: { xs: '48px', sm: '56px' }
//                     }
//                   }}
//                 />
//               </Box>

//               {/* BUTTONS - Fixed width */}
//               <Box sx={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 width: { xs: '100%', sm: 'auto' },
//                 mt: { xs: 1, sm: 0 }
//               }}>
//                 <Box sx={{
//                   display: 'flex',
//                   gap: 1,
//                   flexDirection: 'row',
//                   width: { xs: '100%', sm: 'auto' }
//                 }}>
//                   <Button
//                     onClick={handleSearch}
//                     disabled={loading}
//                     startIcon={<Filter size={18} />}
//                     size="large"
//                     sx={{
//                       backgroundColor: '#144ae9',
//                       color: 'white',
//                       height: { xs: '48px', sm: '56px' },
//                       minWidth: '100px',
//                       '&:hover': {
//                         backgroundColor: '#0d3ec7',
//                         color: 'white'
//                       },
//                       '&.Mui-disabled': {
//                         backgroundColor: '#144ae950',
//                         color: 'white'
//                       },
//                       fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                       whiteSpace: 'nowrap'
//                     }}
//                   >
//                     Apply
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     onClick={handleReset}
//                     size="large"
//                     sx={{
//                       borderColor: '#144ae9',
//                       color: '#144ae9',
//                       height: { xs: '48px', sm: '56px' },
//                       minWidth: '100px',
//                       '&:hover': {
//                         borderColor: '#0d3ec7',
//                         backgroundColor: '#144ae910',
//                         color: '#0d3ec7'
//                       },
//                       fontSize: { xs: '0.8rem', sm: '0.875rem' },
//                       whiteSpace: 'nowrap'
//                     }}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             </Box>
//           </Card>
//         </Box>
//       </Box>

//       {/* PANCHAYATS TABLE */}
//       <Card sx={{ border: '1px solid #144ae920' }}>
//         {loading ? (
//           <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Loading..."} />
//         </div>
//         ) : panchayats.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 8 }}>
//             <MapPin size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
//             <Typography variant="body1" color="text.secondary">
//               No panchayats found
//             </Typography>
//           </Box>
//         ) : (
//           <TableContainer>
//             <Table sx={{ minWidth: 650 }} aria-label="panchayats table">
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: '#144ae905' }}>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Name</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Block</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Status</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9', display: { xs: 'none', sm: 'table-cell' } }}>Population</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9', display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
//                   <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Actions</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {panchayats.map((panchayat) => (
//                   <TableRow
//                     key={panchayat._id}
//                     sx={{
//                       '&:last-child td, &:last-child th': { border: 0 },
//                       '&:hover': { backgroundColor: '#144ae905' }
//                     }}
//                   >
//                     <TableCell sx={{ fontWeight: 500 }}>{panchayat.name}</TableCell>
//                     <TableCell>{panchayat.block}</TableCell>
//                     <TableCell>
//                       <Chip
//                         label={panchayat.status}
//                         size="small"
//                         sx={getStatusColor(panchayat.status)}
//                       />
//                     </TableCell>
//                     <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
//                       {panchayat.population?.toLocaleString() || "N/A"}
//                     </TableCell>
//                     <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
//                       {new Date(panchayat.createdAt).toLocaleDateString()}
//                     </TableCell>
//                     <TableCell>
//                       <Box sx={{ display: 'flex', gap: 1 }}>
//                         <Link href={`/admin/panchayats/${panchayat._id}`} style={{ textDecoration: 'none' }}>
//                           <Button
//                             size="small"
//                             startIcon={<Eye size={16} />}
//                             sx={{
//                               backgroundColor: '#144ae910',
//                               color: '#144ae9',
//                               '&:hover': {
//                                 backgroundColor: '#144ae920'
//                               }
//                             }}
//                           >
//                             View
//                           </Button>
//                         </Link>
//                         <Button
//                           size="small"
//                           startIcon={<Trash2 size={16} />}
//                           onClick={() => setDeleteConfirm(panchayat._id)}
//                           sx={{
//                             backgroundColor: '#d32f2f10',
//                             color: '#d32f2f',
//                             '&:hover': {
//                               backgroundColor: '#d32f2f20'
//                             }
//                           }}
//                         >
//                           Delete
//                         </Button>
//                       </Box>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Panchayat"
//         message="Are you sure you want to delete this panchayat? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Trash2 size={24} color="#144ae9" />}
//       />
//     </Box>
//   )
// }