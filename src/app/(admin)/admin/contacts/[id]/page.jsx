'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchContactById, updateContactStatus, deleteContact, clearError, clearSuccess } from '@/redux/slices/contactSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  User
} from 'lucide-react';

// Import your custom components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Loader from '@/components/ui/Loader';

export default function ContactDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedContact, loading, error, success } = useSelector((state) => state.contact);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // LOAD DATA ONLY ONCE
  useEffect(() => {
    if (params.id && !dataLoaded) {
      dispatch(fetchContactById(params.id));
      setDataLoaded(true);
    }
  }, [params.id, dataLoaded, dispatch]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      
      // Reload data after update
      if (!deleteConfirm) {
        dispatch(fetchContactById(params.id));
      } else {
        // Navigate to list after delete
        router.push('/admin/contacts');
      }
    }
    if (error) {
      toast.error(error.message || 'Failed to perform action');
      dispatch(clearError());
    }
  }, [success, error]);

  const handleStatusToggle = () => {
    if (selectedContact) {
      const newStatus = selectedContact.status === 'new' ? 'resolved' : 'new';
      dispatch(updateContactStatus({ id: selectedContact._id, status: newStatus }));
    }
  };

  const handleDelete = () => {
    if (selectedContact) {
      dispatch(deleteContact(selectedContact._id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !selectedContact) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Contacts..."} />
      </div>
    );
  }

  if (!selectedContact) {
    return (
      <div className="text-center py-8">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <h6 className="text-gray-500 text-xl mb-4">
          Contact message not found
        </h6>
        <Link href="/admin/contacts" className="no-underline">
          <Button 
            variant="contained"
            sx={{ backgroundColor: '#1348e8' }}
            className="mt-2"
          >
            Back to Contacts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
         <Link href="/admin/contacts" className="no-underline">
  <Button
    variant="outlined"
    sx={{
      borderColor: "#1348e8",
      color: "#1348e8",
      "&:hover": {
        borderColor: "#0d3a9d",
        backgroundColor: "#1348e810",
      },
    }}
    className="!min-w-auto !p-3"
  >
    <ArrowLeft size={20} />
  </Button>
</Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Contact Details
            </h1>
            <p className="text-gray-500">
              View and manage contact message
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <Button
            onClick={() => setDeleteConfirm(true)}
            variant="contained"
            sx={{ backgroundColor: '#dc2626' }}
            startIcon={<Trash2 size={16} />}
          >
            Delete Message
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT - ROW WISE LAYOUT */}
      <div className="flex flex-col gap-6">
        {/* USER INFO CARD */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-1">
              <div className="text-center md:text-left">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto md:mx-0 mb-4"
                  style={{ backgroundColor: '#1348e8' }}
                >
                  {selectedContact.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {selectedContact.name}
                </h2>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedContact.status === 'new' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {selectedContact.status === 'new' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {selectedContact.status === 'new' ? 'New Message' : 'Resolved'}
                </span>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Mail size={20} style={{ color: '#1348e8' }} />
                    <div>
                      <p className="text-gray-500 text-sm">
                        Email Address
                      </p>
                      <p className="font-medium text-gray-900 break-all">
                        {selectedContact.email}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedContact.phone && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Phone size={20} style={{ color: '#1348e8' }} />
                      <div>
                        <p className="text-gray-500 text-sm">
                          Phone Number
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedContact.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar size={20} style={{ color: '#1348e8' }} />
                    <div>
                      <p className="text-gray-500 text-sm">
                        Submitted On
                      </p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedContact.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedContact.respondedAt && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle size={20} className="text-green-500" />
                      <div>
                        <p className="text-gray-500 text-sm">
                          Resolved On
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatDate(selectedContact.respondedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* MESSAGE CONTENT CARD */}
        <Card>
          <div className="flex flex-col gap-6">
            {/* SUBJECT AND STATUS TOGGLE */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={18} className="text-gray-500" />
                  <p className="font-medium text-gray-500">
                    Subject
                  </p>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {selectedContact.subject}
                </h3>
              </div>

              {/* STATUS TOGGLE BUTTON */}
              <Button
                onClick={handleStatusToggle}
                disabled={loading}
                variant="contained"
                startIcon={selectedContact.status === 'new' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                sx={{
                  backgroundColor: selectedContact.status === 'new' ? '#10b981' : '#f97316',
                  '&:hover': {
                    backgroundColor: selectedContact.status === 'new' ? '#059669' : '#ea580c'
                  }
                }}
              >
                {selectedContact.status === 'new' ? 'Mark as Resolved' : 'Mark as New'}
              </Button>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* MESSAGE CONTENT */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText size={18} className="text-gray-500" />
                <h4 className="text-lg font-medium text-gray-500">
                  Message Content
                </h4>
              </div>
              <Card className="bg-gray-50 p-6 border border-gray-200 rounded-xl">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-lg">
                  {selectedContact.message}
                </p>
              </Card>
            </div>

            {/* QUICK RESPONSE SECTION */}
            <div className="pt-4">
              <Card 
                className="p-6 rounded-xl border-2"
                style={{ 
                  backgroundColor: '#1348e810',
                  borderColor: '#1348e820'
                }}
              >
                <div className="flex gap-4 items-start">
                  <Mail size={24} style={{ color: '#1348e8' }} className="flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h5 
                      className="text-lg font-bold mb-2"
                      style={{ color: '#1348e8' }}
                    >
                      Quick Response
                    </h5>
                    <p className="text-gray-600 mb-4">
                      Send a quick email response to {selectedContact.name}
                    </p>
                    <Button
                      variant="contained"
                      startIcon={<Mail size={16} />}
                      href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}&body=Dear ${selectedContact.name},%0D%0A%0D%0A`}
                      sx={{ backgroundColor: '#1348e8' }}
                    >
                      Send Email Reply
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* MESSAGE METADATA */}
        <Card>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            Message Information
          </h4>
          <div className="border-t border-gray-200 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-2">
                Message ID
              </p>
              <p className="font-mono text-sm text-gray-900 bg-gray-100 p-2 rounded break-all">
                {selectedContact._id}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">
                Current Status
              </p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                selectedContact.status === 'new' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {selectedContact.status === 'new' ? 'New' : 'Resolved'}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">
                Message Type
              </p>
              <p className="font-medium text-gray-900">
                Contact Form
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-2">
                Character Count
              </p>
              <p className="font-medium text-gray-900">
                {selectedContact.message?.length || 0} characters
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Contact Message"
        message={`Are you sure you want to delete this contact message from ${selectedContact.name}? This action cannot be undone.`}
        confirmText="Delete Message"
        cancelText="Keep Message"
        confirmColor="error"
        icon={<Trash2 />}
      />
    </div>
  );
}// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchContactById, updateContactStatus, deleteContact, clearError, clearSuccess } from '@/redux/slices/contactSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   Box,
//   Typography,
//   Grid,
//   Avatar,
//   Chip,
//   Stack,
//   IconButton,
//   Divider
// } from '@mui/material';
// import {
//   ArrowBack,
//   Email,
//   Phone,
//   CalendarToday,
//   CheckCircle,
//   Cancel,
//   Delete,
//   Description,
//   Person
// } from '@mui/icons-material';

// // Import your custom components
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';
// import Loader from '@/components/ui/Loader';

// export default function ContactDetailsPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedContact, loading, error, success } = useSelector((state) => state.contact);

//   const [deleteConfirm, setDeleteConfirm] = useState(false);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   // LOAD DATA ONLY ONCE
//   useEffect(() => {
//     if (params.id && !dataLoaded) {
//       dispatch(fetchContactById(params.id));
//       setDataLoaded(true);
//     }
//   }, [params.id, dataLoaded, dispatch]);

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('Action completed successfully!');
//       dispatch(clearSuccess());
      
//       // Reload data after update
//       if (!deleteConfirm) {
//         dispatch(fetchContactById(params.id));
//       } else {
//         // Navigate to list after delete
//         router.push('/admin/contacts');
//       }
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to perform action');
//       dispatch(clearError());
//     }
//   }, [success, error]);

//   const handleStatusToggle = () => {
//     if (selectedContact) {
//       const newStatus = selectedContact.status === 'new' ? 'resolved' : 'new';
//       dispatch(updateContactStatus({ id: selectedContact._id, status: newStatus }));
//     }
//   };

//   const handleDelete = () => {
//     if (selectedContact) {
//       dispatch(deleteContact(selectedContact._id));
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-IN', { 
//       day: 'numeric', 
//       month: 'long', 
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading && !selectedContact) {
//     return (
//         <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Contacts..."} />
//         </div>
//     );
//   }

//   if (!selectedContact) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
//         <Typography variant="h6" color="text.secondary" gutterBottom>
//           Contact message not found
//         </Typography>
//         <Link href="/admin/contacts" style={{ textDecoration: 'none' }}>
//           <Button variant="text" sx={{ mt: 2 }}>
//             Back to Contacts
//           </Button>
//         </Link>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/contacts" style={{ textDecoration: 'none' }}>
//             <IconButton sx={{ color: '#144ae9', p: 1.5 }}>
//               <ArrowBack />
//             </IconButton>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight="bold" color="text.primary">
//               Contact Details
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               View and manage contact message
//             </Typography>
//           </Box>
//         </Box>

//         {/* ACTION BUTTONS */}
//         <Stack direction="row" spacing={2}>
//           <Button
//             onClick={() => setDeleteConfirm(true)}
//             variant="outlined"
//             color="error"
//             startIcon={<Delete />}
//           >
//             Delete Message
//           </Button>
//         </Stack>
//       </Box>

//       {/* MAIN CONTENT - ROW WISE LAYOUT */}
//       <Stack spacing={3}>
//         {/* USER INFO CARD */}
//         <Card>
//           <Grid container spacing={4} alignItems="center">
//             <Grid item xs={12} md={3}>
//               <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
//                 <Avatar
//                   sx={{
//                     width: 80,
//                     height: 80,
//                     bgcolor: '#144ae9',
//                     fontSize: '2rem',
//                     fontWeight: 'bold',
//                     mx: { xs: 'auto', md: 0 },
//                     mb: 2
//                   }}
//                 >
//                   {selectedContact.name?.charAt(0).toUpperCase()}
//                 </Avatar>
//                 <Typography variant="h5" fontWeight="bold" gutterBottom>
//                   {selectedContact.name}
//                 </Typography>
//                 <Chip
//                   icon={selectedContact.status === 'new' ? <Cancel /> : <CheckCircle />}
//                   label={selectedContact.status === 'new' ? 'New Message' : 'Resolved'}
//                   sx={{
//                     backgroundColor: selectedContact.status === 'new' ? '#ff6b35' : '#10b981',
//                     color: 'white',
//                     fontWeight: 'bold',
//                     fontSize: '0.9rem',
//                     px: 2,
//                     py: 1
//                   }}
//                 />
//               </Box>
//             </Grid>

//             <Grid item xs={12} md={9}>
//               <Grid container spacing={3}>
//                 <Grid item xs={12} sm={6}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                     <Email sx={{ fontSize: 24, color: '#144ae9' }} />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary">
//                         Email Address
//                       </Typography>
//                       <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
//                         {selectedContact.email}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {selectedContact.phone && (
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                       <Phone sx={{ fontSize: 24, color: '#144ae9' }} />
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           Phone Number
//                         </Typography>
//                         <Typography variant="body1" fontWeight="medium">
//                           {selectedContact.phone}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 )}

//                 <Grid item xs={12} sm={6}>
//                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                     <CalendarToday sx={{ fontSize: 24, color: '#144ae9' }} />
//                     <Box>
//                       <Typography variant="body2" color="text.secondary">
//                         Submitted On
//                       </Typography>
//                       <Typography variant="body1" fontWeight="medium">
//                         {formatDate(selectedContact.createdAt)}
//                       </Typography>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {selectedContact.respondedAt && (
//                   <Grid item xs={12} sm={6}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                       <CheckCircle sx={{ fontSize: 24, color: '#10b981' }} />
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           Resolved On
//                         </Typography>
//                         <Typography variant="body1" fontWeight="medium">
//                           {formatDate(selectedContact.respondedAt)}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </Grid>
//                 )}
//               </Grid>
//             </Grid>
//           </Grid>
//         </Card>

//         {/* MESSAGE CONTENT CARD */}
//         <Card>
//           <Stack spacing={4}>
//             {/* SUBJECT AND STATUS TOGGLE */}
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//               <Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                   <Description sx={{ color: 'text.secondary' }} />
//                   <Typography variant="body1" fontWeight="medium" color="text.secondary">
//                     Subject
//                   </Typography>
//                 </Box>
//                 <Typography variant="h4" fontWeight="bold" color="text.primary">
//                   {selectedContact.subject}
//                 </Typography>
//               </Box>

//               {/* STATUS TOGGLE BUTTON */}
//               <Button
//                 onClick={handleStatusToggle}
//                 disabled={loading}
//                 variant={selectedContact.status === 'new' ? 'contained' : 'outlined'}
//                 startIcon={selectedContact.status === 'new' ? <CheckCircle /> : <Cancel />}
//                 sx={{
//                   backgroundColor: selectedContact.status === 'new' ? '#10b981' : 'transparent',
//                   color: selectedContact.status === 'new' ? 'white' : '#ff6b35',
//                   borderColor: selectedContact.status === 'new' ? '#10b981' : '#ff6b35',
//                   '&:hover': {
//                     backgroundColor: selectedContact.status === 'new' ? '#0da271' : '#ff6b35',
//                     color: selectedContact.status === 'new' ? 'white' : 'white',
//                   }
//                 }}
//               >
//                 {selectedContact.status === 'new' ? 'Mark as Resolved' : 'Mark as New'}
//               </Button>
//             </Box>

//             <Divider />

//             {/* MESSAGE CONTENT */}
//             <Box>
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//                 <Description sx={{ color: 'text.secondary' }} />
//                 <Typography variant="h6" fontWeight="medium" color="text.secondary">
//                   Message Content
//                 </Typography>
//               </Box>
//               <Card
//                 elevation={0}
//                 sx={{
//                   backgroundColor: 'grey.50',
//                   p: 4,
//                   border: '1px solid',
//                   borderColor: 'divider',
//                   borderRadius: 2
//                 }}
//               >
//                 <Typography variant="body1" color="text.primary" sx={{ 
//                   whiteSpace: 'pre-wrap', 
//                   lineHeight: 1.8,
//                   fontSize: '1.1rem'
//                 }}>
//                   {selectedContact.message}
//                 </Typography>
//               </Card>
//             </Box>

//             {/* QUICK RESPONSE SECTION */}
//             <Box sx={{ pt: 2 }}>
//               <Card
//                 elevation={0}
//                 sx={{
//                   backgroundColor: '#144ae910',
//                   border: '2px solid',
//                   borderColor: '#144ae920',
//                   p: 3,
//                   borderRadius: 2
//                 }}
//               >
//                 <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
//                   <Email sx={{ fontSize: 28, color: '#144ae9', flexShrink: 0, mt: 0.5 }} />
//                   <Box sx={{ flex: 1 }}>
//                     <Typography variant="h6" fontWeight="bold" color="#144ae9" gutterBottom>
//                       Quick Response
//                     </Typography>
//                     <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//                       Send a quick email response to {selectedContact.name}
//                     </Typography>
//                     <Button
//                       variant="contained"
//                       startIcon={<Email />}
//                       href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}&body=Dear ${selectedContact.name},%0D%0A%0D%0A`}
//                       component="a"
//                       sx={{
//                         backgroundColor: '#144ae9',
//                         '&:hover': {
//                           backgroundColor: '#0d3ec7'
//                         }
//                       }}
//                     >
//                       Send Email Reply
//                     </Button>
//                   </Box>
//                 </Box>
//               </Card>
//             </Box>
//           </Stack>
//         </Card>

//         {/* MESSAGE METADATA */}
//         <Card>
//           <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
//             Message Information
//           </Typography>
//           <Divider sx={{ mb: 3 }} />
//           <Grid container spacing={4}>
//             <Grid item xs={12} sm={6} md={3}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" gutterBottom>
//                   Message ID
//                 </Typography>
//                 <Typography variant="body2" fontFamily="monospace" color="text.primary" sx={{ 
//                   wordBreak: 'break-all',
//                   backgroundColor: 'grey.100',
//                   p: 1,
//                   borderRadius: 1
//                 }}>
//                   {selectedContact._id}
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" gutterBottom>
//                   Current Status
//                 </Typography>
//                 <Chip
//                   label={selectedContact.status === 'new' ? 'New' : 'Resolved'}
//                   color={selectedContact.status === 'new' ? 'warning' : 'success'}
//                   size="medium"
//                   sx={{ fontWeight: 'bold' }}
//                 />
//               </Box>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" gutterBottom>
//                   Message Type
//                 </Typography>
//                 <Typography variant="body1" fontWeight="medium" color="text.primary">
//                   Contact Form
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <Box>
//                 <Typography variant="body2" color="text.secondary" gutterBottom>
//                   Character Count
//                 </Typography>
//                 <Typography variant="body1" fontWeight="medium" color="text.primary">
//                   {selectedContact.message?.length || 0} characters
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>
//         </Card>
//       </Stack>

//       {/* DELETE CONFIRMATION DIALOG */}
//       <ConfirmDialog
//         open={deleteConfirm}
//         onClose={() => setDeleteConfirm(false)}
//         onConfirm={handleDelete}
//         title="Delete Contact Message"
//         message={`Are you sure you want to delete this contact message from ${selectedContact.name}? This action cannot be undone.`}
//         confirmText="Delete Message"
//         cancelText="Keep Message"
//         confirmColor="error"
//         icon={<Delete />}
//       />
//     </Box>
//   );
// }