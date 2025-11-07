'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAdmins, deleteAdmin, updateAdminStatus, clearError, clearSuccess, } from '@/redux/slices/adminSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCog,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { Box, Typography, IconButton, Avatar, Chip, Grid } from '@mui/material';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import StatCard from '@/components/ui/StatCard';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AllAdminsPage() {
  const dispatch = useDispatch();
  const { admins, stats, loading, error, success } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
   const [hasFetched, setHasFetched] = useState(false);
  useEffect(() => {
    if (!hasFetched && admins.length === 0) {
      dispatch(fetchAllAdmins({}));
      setHasFetched(true);
    }
  }, [dispatch, hasFetched, admins.length]);

  // Handle success/error messages only
  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      dispatch(fetchAllAdmins(params));
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error, dispatch,filters.role, filters.status, filters.search]);

  const handleSearch = () => {
    const params = {};
    if (filters.role) params.role = filters.role;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    dispatch(fetchAllAdmins(params));
  };

  const handleReset = () => {
    setFilters({ role: '', status: '', search: '' });
    dispatch(fetchAllAdmins({}));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteAdmin(id)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await dispatch(updateAdminStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'rtc', label: 'RTC' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Users size={32} color="#144ae9" />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Users Management
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage admins and RTCs
          </Typography>
        </Box>
        <Link href="/admin/users/create" style={{ textDecoration: 'none' }}>
          <Button 
            startIcon={<Plus size={20} />} 
            size="large"
            sx={{ 
              backgroundColor: '#144ae9',
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Add New User
          </Button>
        </Link>
      </Box>

      {/* STATS */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 , width: '100%'}}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Total Admins" 
              value={stats.totalAdmins || 0}
              icon={<UserCog size={28} />}
              color="#144ae9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Total RTCs" 
              value={stats.totalRTCs || 0}
              icon={<Users size={28} />}
              color="#144ae9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              label="Active Users" 
              value={stats.activeCount || 0}
              icon={<CheckCircle size={28} />}
              color="#144ae9"
            />
          </Grid>
        </Grid>
      )}

      {/* FILTERS */}
    <Card
  sx={{
    mb: 4,
    border: '1px solid',
    borderColor: '#144ae9' + '20',
    p: 2,
  }}
>
  <Grid container spacing={3} alignItems="center">
    <Grid item xs={12} md={6}>
      <TextField
        label="Search"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search by name, email, or employee ID..."
        startIcon={<Search size={20} color="#144ae9" />}
        fullWidth
      />
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <SelectField
        label="Role"
        value={filters.role}
        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        options={roleOptions}
        fullWidth
      />
    </Grid>

    <Grid item xs={12} sm={6} md={3}>
      <SelectField
        label="Status"
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        options={statusOptions}
        fullWidth
      />
    </Grid>

    {/* Buttons — responsive layout */}
    <Grid item xs={12}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: { xs: 'flex-start', md: 'flex-end' }, // 👈 right only on desktop
          flexWrap: 'wrap',
          gap: 2,
          mt: { xs: 2, md: 0 },
        }}
      >
        <Button
          onClick={handleSearch}
          disabled={loading}
          startIcon={<Filter size={18} />}
          sx={{
            backgroundColor: '#144ae9',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0d3ec7',
            },
          }}
        >
          Apply Filters
        </Button>

        <Button
          variant="outlined"
          onClick={handleReset}
          sx={{
            borderColor: '#144ae9',
            color: '#144ae9',
            '&:hover': {
              borderColor: '#0d3ec7',
              backgroundColor: '#144ae9' + '10',
            },
          }}
        >
          Reset
        </Button>
      </Box>
    </Grid>
  </Grid>
</Card>


      {/* USERS GRID */}
      <Card sx={{ border: '1px solid', borderColor: '#144ae9' + '20' }}>
        {loading ? (
          <Loader />
        ) : admins.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Users size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              No users found
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {admins.map((admin) => (
              <Card key={admin._id} elevation={0} sx={{ border: '1px solid', borderColor: '#144ae9' + '20', '&:hover': { borderColor: '#144ae9', boxShadow: 1 }, transition: 'all 0.2s' }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                  {/* USER INFO */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: '#144ae9', fontSize: '1.25rem', fontWeight: 700 }}>
                      {admin.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {admin.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admin.employeeId || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* ROLE & STATUS */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={admin.role.toUpperCase()}
                      color={admin.role === 'admin' ? 'primary' : 'success'}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: admin.role === 'admin' ? '#144ae9' : '#144ae9' + '80',
                        color: 'white'
                      }}
                    />
                    <Chip
                      label={admin.status}
                      color={admin.status === 'active' ? 'success' : 'error'}
                      size="small"
                      icon={admin.status === 'active' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      onClick={() => handleStatusToggle(admin._id, admin.status)}
                      sx={{ 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        backgroundColor: admin.status === 'active' ? '#144ae9' : '#d32f2f',
                        color: 'white'
                      }}
                    />
                  </Box>

                  {/* CONTACT INFO */}
                  <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', gap: 0.5, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Mail size={14} color="#144ae9" />
                      <Typography variant="caption" color="#144ae9">
                        {admin.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone size={14} color="#144ae9" />
                      <Typography variant="caption" color="#144ae9">
                        {admin.phone}
                      </Typography>
                    </Box>
                  </Box>

                  {/* LAST LOGIN */}
                  <Box sx={{ display: { xs: 'none', md: 'block' }, minWidth: 100 }}>
                    <Typography variant="caption" color="#144ae9" sx={{ display: 'block' }}>
                      Last Login
                    </Typography>
                    <Typography variant="body2" fontWeight={500} color="#144ae9">
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Box>

                  {/* ACTIONS */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Link href={`/admin/users/${admin._id}`} style={{ textDecoration: 'none' }}>
                      <IconButton size="small" sx={{ color: '#144ae9' }}>
                        <Eye size={18} />
                      </IconButton>
                    </Link>
                    <Link href={`/admin/users/${admin._id}`} style={{ textDecoration: 'none' }}>
                      <IconButton size="small" sx={{ color: '#144ae9' }}>
                        <Edit size={18} />
                      </IconButton>
                    </Link>
                    <IconButton 
                      size="small" 
                      sx={{ color: '#d32f2f' }} 
                      onClick={() => setDeleteConfirm(admin._id)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Card>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
      />
    </Box>
  );
}

// 'use client'
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAllAdmins, deleteAdmin, updateAdminStatus, clearError, clearSuccess } from '@/redux/slices/adminSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   Users,
//   Plus,
//   Search,
//   Filter,
//   Edit,
//   Trash2,
//   Loader2,
//   UserCog,
//   CheckCircle,
//   XCircle,
//   Eye
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function AllAdminsPage() {
//   const dispatch = useDispatch();
//   const { admins, stats, loading, error, success } = useSelector((state) => state.admin);

//   const [filters, setFilters] = useState({
//     role: '',
//     status: '',
//     search: ''
//   });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
 
//   // // INITIAL LOAD - ONLY ONCE
//   // useEffect(() => {
//   //   const params = {};
//   //   if (filters.role) params.role = filters.role;
//   //   if (filters.status) params.status = filters.status;
//   //   if (filters.search) params.search = filters.search;
//   //   dispatch(fetchAllAdmins(params));
//   // }, []); // Empty dependency array - runs only once

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());

//       const params = {};
//       if (filters.role) params.role = filters.role;
//       if (filters.status) params.status = filters.status;
//       if (filters.search) params.search = filters.search;
//       dispatch(fetchAllAdmins(params));
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error]); // Only run when success or error changes

//   const handleSearch = () => {
//     const params = {};
//     if (filters.role) params.role = filters.role;
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     dispatch(fetchAllAdmins(params));
//   };

//   const handleReset = () => {
//     setFilters({ role: '', status: '', search: '' });
//     dispatch(fetchAllAdmins({}));
//   };

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deleteAdmin(id)).unwrap();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleStatusToggle = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
//     try {
//       await dispatch(updateAdminStatus({ id, status: newStatus })).unwrap();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <Users className="h-8 w-8 text-green-600" />
//             Users Management
//           </h1>
//           <p className="text-gray-600 mt-1">Manage admins and RTCs</p>
//         </div>
//         <Link
//           href="/admin/users/create"
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
//         >
//           <Plus className="h-5 w-5" />
//           Add New User
//         </Link>
//       </div>

//       {/* STATS */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="bg-white rounded-lg border border-gray-200 p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Admins</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins || 0}</p>
//               </div>
//               <UserCog className="h-10 w-10 text-blue-500" />
//             </div>
//           </div>
//           <div className="bg-white rounded-lg border border-gray-200 p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total RTCs</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.totalRTCs || 0}</p>
//               </div>
//               <Users className="h-10 w-10 text-green-500" />
//             </div>
//           </div>
//           <div className="bg-white rounded-lg border border-gray-200 p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Active Users</p>
//                 <p className="text-2xl font-bold text-gray-900">{stats.activeCount || 0}</p>
//               </div>
//               <CheckCircle className="h-10 w-10 text-emerald-500" />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* FILTERS */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           {/* SEARCH */}
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Search
//             </label>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                 placeholder="Search by name, email, or employee ID..."
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               />
//             </div>
//           </div>

//           {/* ROLE FILTER */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Role
//             </label>
//             <select
//               value={filters.role}
//               onChange={(e) => setFilters({ ...filters, role: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//             >
//               <option value="">All Roles</option>
//               <option value="admin">Admin</option>
//               <option value="rtc">RTC</option>
//             </select>
//           </div>

//           {/* STATUS FILTER */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Status
//             </label>
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//             >
//               <option value="">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>
//         </div>

//         {/* SEARCH BUTTON */}
//         <div className="flex gap-3 mt-4">
//           <button
//             onClick={handleSearch}
//             disabled={loading}
//             className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
//           >
//             <Filter className="h-4 w-4" />
//             Apply Filters
//           </button>
//           <button
//             onClick={handleReset}
//             className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             Reset
//           </button>
//         </div>
//       </div>

//       {/* ADMINS TABLE */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         {loading ? (
//           <Loader/>
//         ) : admins.length === 0 ? (
//           <div className="text-center py-12">
//             <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//             <p className="text-gray-500">No users found</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Role
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Contact
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Last Login
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {admins.map((admin) => (
//                   <tr key={admin._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                           <span className="text-green-700 font-semibold">
//                             {admin.name.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900">{admin.name}</p>
//                           <p className="text-sm text-gray-500">{admin.employeeId || 'N/A'}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//                         admin.role === 'admin'
//                           ? 'bg-blue-100 text-blue-700'
//                           : 'bg-green-100 text-green-700'
//                       }`}>
//                         {admin.role.toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm">
//                         <p className="text-gray-900">{admin.email}</p>
//                         <p className="text-gray-500">{admin.phone}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <button
//                         onClick={() => handleStatusToggle(admin._id, admin.status)}
//                         className="flex items-center gap-2 hover:opacity-75 transition-opacity"
//                       >
//                         {admin.status === 'active' ? (
//                           <>
//                             <CheckCircle className="h-5 w-5 text-green-500" />
//                             <span className="text-sm font-medium text-green-700">Active</span>
//                           </>
//                         ) : (
//                           <>
//                             <XCircle className="h-5 w-5 text-red-500" />
//                             <span className="text-sm font-medium text-red-700">Inactive</span>
//                           </>
//                         )}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <div className="flex items-center justify-end gap-2">
//                         <Link
//                           href={`/admin/users/${admin._id}`}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                           title="View Details"
//                         >
//                           <Eye className="h-4 w-4" />
//                         </Link>
//                         <Link
//                           href={`/admin/users/${admin._id}`}
//                           className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
//                           title="Edit"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </Link>
//                         <button
//                           onClick={() => setDeleteConfirm(admin._id)}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* DELETE CONFIRMATION MODAL */}
//       {deleteConfirm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6">
//             <div className="text-center">
//               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Trash2 className="h-6 w-6 text-red-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Delete User
//               </h3>
//               <p className="text-gray-600 mb-6">
//                 Are you sure you want to delete this user? This action cannot be undone.
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setDeleteConfirm(null)}
//                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDelete(deleteConfirm)}
//                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }