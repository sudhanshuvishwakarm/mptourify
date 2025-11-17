'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts, deleteContact, updateContactStatus, clearError, clearSuccess } from '@/redux/slices/contactSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from '@mui/material';
import {
  Message,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  Cancel,
  Visibility,
  Delete,
  Search,
  Refresh
} from '@mui/icons-material';

// Import your custom components
import TextField from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Loader from '@/components/ui/Loader';
import { Filter } from 'lucide-react';

export default function AdminContactsPage() {
  const dispatch = useDispatch();
  const { contacts, stats, loading, error, success, totalContacts, currentPage, totalPages } = useSelector((state) => state.contact);

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // INITIAL LOAD - ONLY ONCE
  useEffect(() => {
    if (!dataLoaded) {
      const params = { page: 1, limit: 20 };
      dispatch(fetchContacts(params));
      setDataLoaded(true);
    }
  }, [dataLoaded, dispatch]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      
      const params = { page: filters.page, limit: 20 };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      dispatch(fetchContacts(params));
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error]);

  const handleSearch = () => {
    const params = { page: 1, limit: 20 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    setFilters({ ...filters, page: 1 });
    dispatch(fetchContacts(params));
  };

  const handleReset = () => {
    setFilters({ status: '', search: '', page: 1 });
    dispatch(fetchContacts({ page: 1, limit: 20 }));
  };

  const handlePageChange = (event, newPage) => {
    const params = { page: newPage, limit: 20 };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    setFilters({ ...filters, page: newPage });
    dispatch(fetchContacts(params));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteContact(id)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'new' ? 'resolved' : 'new';
    try {
      await dispatch(updateContactStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric'
    });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'resolved', label: 'Resolved' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* HEADER */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: 2, 
        mb: 4 
      }}>
        {/* <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Message sx={{ fontSize: 32, color: "#144ae9" }} />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Contact Messages ({totalContacts || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage contact form submissions
          </Typography>
        </Box> */}<Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
           <Message sx={{ fontSize: 32, color: "#144ae9" }} />
            <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Contact Messages ({totalContacts || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
             Manage contact form submissions
          </Typography>
        </Box>
      </Box>

      {/* STATS & FILTERS IN ONE ROW */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4, 
        flexDirection: { xs: 'column', md: 'row' } 
      }}>
        {/* STATS CARD */}
        {/* <Box sx={{ width: { xs: '100%', md: '20%' } }}>
          <Card sx={{ 
            p: 3, 
            border: '1px solid #144ae920', 
            height: '100%' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Messages
                </Typography>
                <Typography variant="h3" fontWeight={700} color="text.primary">
                  {totalContacts || 0}
                </Typography>
              </Box>
              <Message sx={{ fontSize: 48, color: "#144ae9" }} />
            </Box>
          </Card>
        </Box> */}

        {/* FILTERS CARD */}
        <Box sx={{ width: { xs: '100%'} }}>
          <Card sx={{ 
            p: { xs: 2, sm: 3 }, 
            border: '1px solid #144ae920', 
            height: '100%' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 2, md: 2 }, 
              alignItems: 'center', 
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: 'wrap'
            }}>
              {/* SEARCH FIELD - Flexible width */}
              <Box sx={{ 
                flex: 1,
                minWidth: { xs: '100%', sm: '200px' },
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <TextField
                  label="Search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by name, email, or subject..."
                  startIcon={<Search sx={{ color: "#144ae9" }} />}
                  fullWidth
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      height: { xs: '48px', sm: '56px' } 
                    } 
                  }}
                />
              </Box>

              {/* STATUS FILTER */}
              <Box sx={{ 
                width: { xs: '100%', sm: '180px', md: '180px' },
                display: 'flex', 
                alignItems: 'center' 
              }}>
                <SelectField
                  label="Status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={statusOptions}
                  fullWidth
                  sx={{ 
                    '& .MuiInputBase-root': { 
                      height: { xs: '48px', sm: '56px' } 
                    } 
                  }}
                />
              </Box>

              {/* BUTTONS - Fixed width */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 1, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexDirection: 'row',
                  width: { xs: '100%', sm: 'auto' }
                }}>
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    startIcon={<Filter sx={{ fontSize: 14 }} />}
                    size="large"
                    sx={{
                      backgroundColor: '#144ae9',
                      color: 'white',
                      height: { xs: '48px', sm: '56px' },
                      minWidth: '100px',
                      '&:hover': {
                        backgroundColor: '#0d3ec7',
                        color: 'white'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#144ae950',
                        color: 'white'
                      },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<Refresh sx={{ fontSize: 18 }} />}
                    size="large"
                    sx={{
                      borderColor: '#144ae9',
                      color: '#144ae9',
                      height: { xs: '48px', sm: '56px' },
                      minWidth: '100px',
                      '&:hover': {
                        borderColor: '#0d3ec7',
                        backgroundColor: '#144ae910',
                        color: '#0d3ec7'
                      },
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* CONTACTS TABLE */}
      <Card sx={{ border: '1px solid #144ae920' }}>
        {loading && !contacts.length ? (
          <div className="fixed inset-0 z-[9999]">
          <Loader message={"contacts..."} />
        </div>
        ) : contacts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Message sx={{ fontSize: 48, color: "#144ae9", mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              No contact messages found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#144ae905' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Contact Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Subject & Message</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contacts.map((contact,index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#144ae905' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#144ae9', width: 40, height: 40 }}>
                            {contact.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              {contact.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Email sx={{ fontSize: 16, color: '#144ae9' }} />
                              <Typography variant="body2" color="text.secondary">
                                {contact.email}
                              </Typography>
                            </Box>
                            {contact.phone && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Phone sx={{ fontSize: 16, color: '#144ae9' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {contact.phone}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600} color="text.primary" noWrap>
                          {contact.subject}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {contact.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleStatusToggle(contact._id, contact.status)}
                          size="small"
                          startIcon={contact.status === 'new' ? <Cancel size={16} /> : <CheckCircle size={16} />}
                          sx={{
                            backgroundColor: contact.status === 'new' ? '#ff6b35' : '#10b981',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: contact.status === 'new' ? '#e55a2b' : '#0da271'
                            },
                            minWidth: '100px'
                          }}
                        >
                          {contact.status === 'new' ? 'New' : 'Resolved'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#144ae9' }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {formatDate(contact.createdAt)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Link href={`/admin/contacts/${contact._id}`} style={{ textDecoration: 'none' }}>
                            <IconButton
                              size="small"
                              sx={{
                                color: '#144ae9',
                                backgroundColor: '#144ae910',
                                '&:hover': {
                                  backgroundColor: '#144ae920'
                                }
                              }}
                            >
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Link>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(contact._id)}
                            sx={{
                              color: '#d32f2f',
                              backgroundColor: '#d32f2f10',
                              '&:hover': {
                                backgroundColor: '#d32f2f20'
                              }
                            }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Box sx={{ 
                p: 3, 
                borderTop: '1px solid #144ae920', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing page <Typography component="span" fontWeight={600}>{currentPage}</Typography> of{' '}
                  <Typography component="span" fontWeight={600}>{totalPages}</Typography>
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#144ae9',
                      borderColor: '#144ae9',
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#144ae9',
                      color: 'white',
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Card>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Contact Message"
        message="Are you sure you want to delete this contact message? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Delete sx={{ color: '#144ae9' }} />}
      />
    </Box>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchContacts, deleteContact, updateContactStatus, clearError, clearSuccess } from '@/redux/slices/contactSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   Box,
//   Typography,
//   Grid,
//   Avatar,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Stack,
//   Pagination,
//   CircularProgress
// } from '@mui/material';
// import {
//   Search,
//   FilterList,
//   Visibility,
//   Delete,
//   CheckCircle,
//   Cancel,
//   Email,
//   Phone,
//   CalendarToday,
//   Message,
//   Refresh
// } from '@mui/icons-material';

// // Import your custom components
// import TextField from '@/components/ui/TextField';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import SelectField from '@/components/ui/SelectField';
// import StatCard from '@/components/ui/StatCard';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';
// import Loader from '@/components/ui/Loader';

// export default function AdminContactsPage() {
//   const dispatch = useDispatch();
//   const { contacts, stats, loading, error, success, totalContacts, currentPage, totalPages } = useSelector((state) => state.contact);

//   const [filters, setFilters] = useState({
//     status: '',
//     search: '',
//     page: 1
//   });
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   // INITIAL LOAD - ONLY ONCE
//   useEffect(() => {
//     if (!dataLoaded) {
//       const params = { page: 1, limit: 20 };
//       dispatch(fetchContacts(params));
//       setDataLoaded(true);
//     }
//   }, [dataLoaded, dispatch]);

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
      
//       const params = { page: filters.page, limit: 20 };
//       if (filters.status) params.status = filters.status;
//       if (filters.search) params.search = filters.search;
//       dispatch(fetchContacts(params));
//     }
//     if (error) {
//       toast.error(error.message || 'Something went wrong');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   const handleSearch = () => {
//     const params = { page: 1, limit: 20 };
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     setFilters({ ...filters, page: 1 });
//     dispatch(fetchContacts(params));
//   };

//   const handleReset = () => {
//     setFilters({ status: '', search: '', page: 1 });
//     dispatch(fetchContacts({ page: 1, limit: 20 }));
//   };

//   const handlePageChange = (event, newPage) => {
//     const params = { page: newPage, limit: 20 };
//     if (filters.status) params.status = filters.status;
//     if (filters.search) params.search = filters.search;
//     setFilters({ ...filters, page: newPage });
//     dispatch(fetchContacts(params));
//   };

//   const handleDelete = async (id) => {
//     try {
//       await dispatch(deleteContact(id)).unwrap();
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleStatusToggle = async (id, currentStatus) => {
//     const newStatus = currentStatus === 'new' ? 'resolved' : 'new';
//     try {
//       await dispatch(updateContactStatus({ id, status: newStatus })).unwrap();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', { 
//       day: 'numeric', 
//       month: 'short', 
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const statusOptions = [
//     { value: '', label: 'All Status' },
//     { value: 'new', label: 'New' },
//     { value: 'resolved', label: 'Resolved' }
//   ];

//   return (
//     <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Message sx={{ fontSize: 32, color: '#144ae9' }} />
//         <Box>
//           <Typography variant="h4" fontWeight="bold" color="text.primary">
//             Contact Messages
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             Manage contact form submissions
//           </Typography>
//         </Box>
//       </Box>

//       {/* STATS */}
//       {stats && (
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           <Grid item xs={12} md={4}>
//             <StatCard
//               label="Total Messages"
//               value={totalContacts || 0}
//               icon={<Message sx={{ fontSize: 24 }} />}
//               color="#144ae9"
//             />
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <StatCard
//               label="New Messages"
//               value={stats.new || 0}
//               icon={<Email sx={{ fontSize: 24 }} />}
//               color="#ff6b35"
//             />
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <StatCard
//               label="Resolved"
//               value={stats.resolved || 0}
//               icon={<CheckCircle sx={{ fontSize: 24 }} />}
//               color="#10b981"
//             />
//           </Grid>
//         </Grid>
//       )}

//       {/* FILTERS */}
//       <Card sx={{ mb: 3 }}>
//         <Grid container spacing={3} alignItems="end">
//           {/* SEARCH */}
//           <Grid item xs={12} md={6}>
//             <TextField
//               label="Search"
//               value={filters.search}
//               onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//               placeholder="Search by name, email, or subject..."
//               startIcon={<Search />}
//             />
//           </Grid>

//           {/* STATUS FILTER */}
//           <Grid item xs={12} md={4}>
//             <SelectField
//               label="Status"
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//               options={statusOptions}
//             />
//           </Grid>

//           {/* BUTTONS */}
//           <Grid item xs={12} md={2}>
//             <Stack direction="row" spacing={1}>
//               <Button
//                 onClick={handleSearch}
//                 disabled={loading}
//                 startIcon={<FilterList />}
//                 sx={{ flex: 1 }}
//               >
//                 Filter
//               </Button>
//               <Button
//                 variant="outlined"
//                 onClick={handleReset}
//                 startIcon={<Refresh />}
//                 sx={{ flex: 1 }}
//               >
//                 Reset
//               </Button>
//             </Stack>
//           </Grid>
//         </Grid>
//       </Card>

//       {/* CONTACTS TABLE */}
//       <Card>
//         {loading && !contacts.length ? (
//             <Loader />
         
//         ) : contacts.length === 0 ? (
//           <Box sx={{ textAlign: 'center', py: 8 }}>
//             <Message sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//             <Typography variant="h6" color="text.secondary">
//               No contact messages found
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             <TableContainer>
//               <Table>
//                 <TableHead sx={{ backgroundColor: '#f8fafc' }}>
//                   <TableRow>
//                     <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                       Contact Info
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                       Subject & Message
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                       Status
//                     </TableCell>
//                     <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                       Date
//                     </TableCell>
//                     <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                       Actions
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {contacts.map((contact) => (
//                     <TableRow 
//                       key={contact._id} 
//                       sx={{ 
//                         '&:hover': { 
//                           backgroundColor: '#f8fafc' 
//                         } 
//                       }}
//                     >
//                       <TableCell>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//                           <Avatar sx={{ bgcolor: '#144ae9' }}>
//                             {contact.name.charAt(0).toUpperCase()}
//                           </Avatar>
//                           <Box>
//                             <Typography variant="subtitle1" fontWeight="medium">
//                               {contact.name}
//                             </Typography>
//                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
//                               <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
//                               <Typography variant="body2" color="text.secondary">
//                                 {contact.email}
//                               </Typography>
//                             </Box>
//                             {contact.phone && (
//                               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
//                                 <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
//                                 <Typography variant="body2" color="text.secondary">
//                                   {contact.phone}
//                                 </Typography>
//                               </Box>
//                             )}
//                           </Box>
//                         </Box>
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="subtitle2" fontWeight="medium" noWrap>
//                           {contact.subject}
//                         </Typography>
//                         <Typography 
//                           variant="body2" 
//                           color="text.secondary" 
//                           sx={{ 
//                             mt: 0.5,
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: 'vertical',
//                             overflow: 'hidden'
//                           }}
//                         >
//                           {contact.message}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <IconButton
//                           onClick={() => handleStatusToggle(contact._id, contact.status)}
//                           sx={{ p: 0 }}
//                         >
//                           {contact.status === 'new' ? (
//                             <Box
//                               sx={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 1,
//                                 px: 2,
//                                 py: 0.5,
//                                 borderRadius: 2,
//                                 backgroundColor: '#ff6b35',
//                                 color: 'white',
//                                 fontWeight: 'bold',
//                                 fontSize: '0.75rem'
//                               }}
//                             >
//                               <Cancel sx={{ fontSize: 16 }} />
//                               New
//                             </Box>
//                           ) : (
//                             <Box
//                               sx={{
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 gap: 1,
//                                 px: 2,
//                                 py: 0.5,
//                                 borderRadius: 2,
//                                 backgroundColor: '#10b981',
//                                 color: 'white',
//                                 fontWeight: 'bold',
//                                 fontSize: '0.75rem'
//                               }}
//                             >
//                               <CheckCircle sx={{ fontSize: 16 }} />
//                               Resolved
//                             </Box>
//                           )}
//                         </IconButton>
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                           <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
//                           <Typography variant="body2" color="text.secondary">
//                             {formatDate(contact.createdAt)}
//                           </Typography>
//                         </Box>
//                       </TableCell>
//                       <TableCell align="right">
//                         <Stack direction="row" spacing={1} justifyContent="flex-end">
//                           <Link href={`/admin/contacts/${contact._id}`} style={{ textDecoration: 'none' }}>
//                             <IconButton
//                               sx={{ 
//                                 color: '#144ae9',
//                                 '&:hover': { 
//                                   backgroundColor: '#144ae910' 
//                                 } 
//                               }}
//                             >
//                               <Visibility />
//                             </IconButton>
//                           </Link>
//                           <IconButton
//                             onClick={() => setDeleteConfirm(contact._id)}
//                             sx={{ 
//                               color: '#dc2626',
//                               '&:hover': { 
//                                 backgroundColor: '#fef2f2' 
//                               } 
//                             }}
//                           >
//                             <Delete />
//                           </IconButton>
//                         </Stack>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             {/* PAGINATION */}
//             {totalPages > 1 && (
//               <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     Page {currentPage} of {totalPages}
//                   </Typography>
//                   <Pagination
//                     count={totalPages}
//                     page={currentPage}
//                     onChange={handlePageChange}
//                     sx={{
//                       '& .MuiPaginationItem-root': {
//                         color: '#144ae9',
//                         borderColor: '#144ae9'
//                       },
//                       '& .MuiPaginationItem-root.Mui-selected': {
//                         backgroundColor: '#144ae9',
//                         color: 'white'
//                       }
//                     }}
//                   />
//                 </Box>
//               </Box>
//             )}
//           </>
//         )}
//       </Card>

//       {/* DELETE CONFIRMATION DIALOG */}
//       <ConfirmDialog
//         open={!!deleteConfirm}
//         onClose={() => setDeleteConfirm(null)}
//         onConfirm={() => handleDelete(deleteConfirm)}
//         title="Delete Contact Message"
//         message="Are you sure you want to delete this contact message? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         confirmColor="error"
//         icon={<Delete />}
//       />
//     </Box>
//   );
// }