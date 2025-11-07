'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { toast } from 'react-toastify';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  Save,
  Shield,   
  Calendar,
  MapPin
} from 'lucide-react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import StatusChip from '@/components/ui/StatusChip';

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { currentAdmin, loading, error, success } = useSelector((state) => state.admin);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    employeeId: '',
    designation: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // POPULATE FORM WHEN ADMIN DATA LOADS
  useEffect(() => {
    if (currentAdmin) {
      setFormData(prev => ({
        ...prev,
        name: currentAdmin.name || '',
        phone: currentAdmin.phone || '',
        employeeId: currentAdmin.employeeId || '',
        designation: currentAdmin.designation || ''
      }));
    }
  }, [currentAdmin]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('Profile updated successfully!');
      dispatch(clearSuccess());
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
    if (error) {
      toast.error(error.message || 'Failed to update profile');
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    const submitData = {
      name: formData.name,
      phone: formData.phone,
      employeeId: formData.employeeId,
      designation: formData.designation
    };

    if (formData.newPassword) {
      submitData.currentPassword = formData.currentPassword;
      submitData.newPassword = formData.newPassword;
    }

    dispatch(updateProfile(submitData));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (currentAdmin) {
      setFormData({
        name: currentAdmin.name || '',
        phone: currentAdmin.phone || '',
        employeeId: currentAdmin.employeeId || '',
        designation: currentAdmin.designation || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1200px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          My Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your account settings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* PROFILE CARD */}
        <Box sx={{ width: { xs: '100%', lg: '320px' }, flexShrink: 0 }}>
          <Card sx={{ 
            p: 4, 
            border: '1px solid',
            borderColor: '#144ae920',
            backgroundColor: 'white'
          }}>
            {/* AVATAR */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ 
                width: 96, 
                height: 96, 
                bgcolor: '#144ae9',
                fontSize: '2.5rem',
                fontWeight: 700,
                mx: 'auto',
                mb: 2
              }}>
                {currentAdmin?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                {currentAdmin?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {currentAdmin?.email}
              </Typography>
              <Chip
                label={currentAdmin?.role?.toUpperCase()}
                size="small"
                sx={{
                  mt: 2,
                  backgroundColor: currentAdmin?.role === 'admin' ? '#144ae9' : '#144ae980',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem'
                }}
              />
            </Box>

            {/* INFO */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 4, borderTop: '1px solid', borderColor: '#144ae920' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Shield size={18} color="#144ae9" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Status
                  </Typography>
                </Box>
                <StatusChip status={currentAdmin?.status} />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Briefcase size={18} color="#144ae9" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Employee ID
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600} color="#144ae9">
                  {currentAdmin?.employeeId || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Calendar size={18} color="#144ae9" />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Joined
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {currentAdmin?.createdAt 
                    ? new Date(currentAdmin.createdAt).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Box>

              {currentAdmin?.role === 'rtc' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MapPin size={18} color="#144ae9" />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Districts
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="#144ae9">
                    {currentAdmin?.assignedDistricts?.length || 0}
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Box>

        {/* EDIT FORM */}
        <Box sx={{ flex: 1 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* BASIC INFO */}
            <Card sx={{ 
              p: 4, 
              border: '1px solid',
              borderColor: '#144ae920',
              backgroundColor: 'white'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight={600} color="text.primary">
                  Basic Information
                </Typography>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    sx={{ 
                      color: '#FFFFFF',
                      fontWeight: 600,
                        backgroundColor: '#144ae9'
                      
                    }}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* FIRST ROW */}
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    error={errors.name}
                    required
                    startIcon={<User size={20} color="#144ae9" />}
                    fullWidth
                  />
                  <TextField
                    label="Email Address"
                    value={currentAdmin?.email || ''}
                    disabled
                    startIcon={<Mail size={20} color="#144ae9" />}
                    fullWidth
                  />
                </Box>

                {/* SECOND ROW */}
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                  <TextField
                    label="Phone Number *"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    error={errors.phone}
                    required
                    startIcon={<Phone size={20} color="#144ae9" />}
                    fullWidth
                  />
                  <TextField
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    disabled={!isEditing}
                    startIcon={<Briefcase size={20} color="#144ae9" />}
                    fullWidth
                  />
                </Box>

                {/* DESIGNATION */}
                <TextField
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>
            </Card>

            {/* CHANGE PASSWORD */}
            {isEditing && (
              <Card sx={{ 
                p: 4, 
                border: '1px solid',
                borderColor: '#144ae920',
                backgroundColor: 'white'
              }}>
                <Typography variant="h5" fontWeight={600} color="text.primary" sx={{ mb: 4 }}>
                  Change Password
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* CURRENT PASSWORD */}
                  <TextField
                    label="Current Password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    error={errors.currentPassword}
                    startIcon={<Lock size={20} color="#144ae9" />}
                    placeholder="Enter current password"
                    fullWidth
                  />

                  {/* NEW PASSWORDS */}
                  <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    <TextField
                      label="New Password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      error={errors.newPassword}
                      startIcon={<Lock size={20} color="#144ae9" />}
                      placeholder="Minimum 8 characters"
                      fullWidth
                    />
                    <TextField
                      label="Confirm New Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={errors.confirmPassword}
                      startIcon={<Lock size={20} color="#144ae9" />}
                      placeholder="Re-enter new password"
                      fullWidth
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    Leave blank if you don't want to change your password
                  </Typography>
                </Box>
              </Card>
            )}

            {/* SUBMIT BUTTONS */}
            {isEditing && (
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Button
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <Loader /> : <Save size={20} />}
                  size="large"
                  sx={{ 
                    backgroundColor: '#144ae9',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    }
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  size="large"
                  sx={{ 
                    borderColor: '#144ae9',
                    color: '#144ae9',
                    '&:hover': {
                      borderColor: '#0d3ec7',
                      backgroundColor: '#144ae910'
                    }
                  }}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
// 'use client';
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { updateProfile, clearError, clearSuccess } from '@/redux/slices/adminSlice';
// import { toast } from 'react-toastify';
// import {
//   User,
//   Mail,
//   Phone,
//   Briefcase,
//   Lock,
//   Save,
//   Loader2,
//   Shield,   
//   Calendar,
//   MapPin
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function AdminProfilePage() {
//   const dispatch = useDispatch();
//   const { currentAdmin, loading, error, success } = useSelector((state) => state.admin);

//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     name: '',
//     phone: '',
//     employeeId: '',
//     designation: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});

//   // POPULATE FORM WHEN ADMIN DATA LOADS
//   useEffect(() => {
//     if (currentAdmin) {
//       setFormData(prev => ({
//         ...prev,
//         name: currentAdmin.name || '',
//         phone: currentAdmin.phone || '',
//         employeeId: currentAdmin.employeeId || '',
//         designation: currentAdmin.designation || ''
//       }));
//     }
//   }, [currentAdmin]);

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success('Profile updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//       setFormData(prev => ({
//         ...prev,
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       }));
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update profile');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
//     if (!/^[0-9]{10}$/.test(formData.phone)) {
//       newErrors.phone = 'Phone must be 10 digits';
//     }

//     if (formData.newPassword) {
//       if (!formData.currentPassword) {
//         newErrors.currentPassword = 'Current password is required';
//       }
//       if (formData.newPassword.length < 8) {
//         newErrors.newPassword = 'Password must be at least 8 characters';
//       }
//       if (formData.newPassword !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     const submitData = {
//       name: formData.name,
//       phone: formData.phone,
//       employeeId: formData.employeeId,
//       designation: formData.designation
//     };

//     if (formData.newPassword) {
//       submitData.currentPassword = formData.currentPassword;
//       submitData.newPassword = formData.newPassword;
//     }

//     dispatch(updateProfile(submitData));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     if (currentAdmin) {
//       setFormData({
//         name: currentAdmin.name || '',
//         phone: currentAdmin.phone || '',
//         employeeId: currentAdmin.employeeId || '',
//         designation: currentAdmin.designation || '',
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: ''
//       });
//     }
//     setErrors({});
//   };

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
//         <p className="text-gray-600 mt-1">Manage your account settings</p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* PROFILE CARD */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
//             {/* AVATAR */}
//             <div className="text-center">
//               <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <span className="text-white text-3xl font-bold">
//                   {currentAdmin?.name?.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//               <h2 className="text-xl font-semibold text-gray-900">{currentAdmin?.name}</h2>
//               <p className="text-sm text-gray-500">{currentAdmin?.email}</p>
//               <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
//                 currentAdmin?.role === 'admin'
//                   ? 'bg-blue-100 text-blue-700'
//                   : 'bg-green-100 text-green-700'
//               }`}>
//                 {currentAdmin?.role?.toUpperCase()}
//               </span>
//             </div>

//             {/* INFO */}
//             <div className="space-y-3 pt-6 border-t border-gray-200">
//               <div className="flex items-center gap-3 text-sm">
//                 <Shield className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">Status:</span>
//                 <span className="font-medium text-green-600 capitalize">
//                   {currentAdmin?.status}
//                 </span>
//               </div>

//               <div className="flex items-center gap-3 text-sm">
//                 <Briefcase className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">Employee ID:</span>
//                 <span className="font-medium text-gray-900">
//                   {currentAdmin?.employeeId || 'N/A'}
//                 </span>
//               </div>

//               <div className="flex items-center gap-3 text-sm">
//                 <Calendar className="h-4 w-4 text-gray-400" />
//                 <span className="text-gray-600">Joined:</span>
//                 <span className="font-medium text-gray-900">
//                   {currentAdmin?.createdAt 
//                     ? new Date(currentAdmin.createdAt).toLocaleDateString()
//                     : 'N/A'}
//                 </span>
//               </div>

//               {currentAdmin?.role === 'rtc' && (
//                 <div className="flex items-center gap-3 text-sm">
//                   <MapPin className="h-4 w-4 text-gray-400" />
//                   <span className="text-gray-600">Districts:</span>
//                   <span className="font-medium text-gray-900">
//                     {currentAdmin?.assignedDistricts?.length || 0}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* EDIT FORM */}
//         <div className="lg:col-span-2">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* BASIC INFO */}
//             <div className="bg-white rounded-xl border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
//                 {!isEditing && (
//                   <button
//                     type="button"
//                     onClick={() => setIsEditing(true)}
//                     className="text-sm text-green-600 hover:text-green-700 font-medium"
//                   >
//                     Edit
//                   </button>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* NAME */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Full Name *
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       disabled={!isEditing}
//                       className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 ${
//                         errors.name ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                     />
//                   </div>
//                   {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//                 </div>

//                 {/* EMAIL (READ ONLY) */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="email"
//                       value={currentAdmin?.email || ''}
//                       disabled
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
//                 </div>

//                 {/* PHONE */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number *
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="tel"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                       disabled={!isEditing}
//                       className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 ${
//                         errors.phone ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       maxLength={10}
//                     />
//                   </div>
//                   {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//                 </div>

//                 {/* EMPLOYEE ID */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Employee ID
//                   </label>
//                   <div className="relative">
//                     <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={formData.employeeId}
//                       onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                       disabled={!isEditing}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
//                     />
//                   </div>
//                 </div>

//                 {/* DESIGNATION */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Designation
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.designation}
//                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                     disabled={!isEditing}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* CHANGE PASSWORD */}
//             {isEditing && (
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
//                 <div className="space-y-4">
//                   {/* CURRENT PASSWORD */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Current Password
//                     </label>
//                     <div className="relative">
//                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                       <input
//                         type="password"
//                         value={formData.currentPassword}
//                         onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
//                         className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
//                           errors.currentPassword ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                         placeholder="Enter current password"
//                       />
//                     </div>
//                     {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* NEW PASSWORD */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         New Password
//                       </label>
//                       <div className="relative">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                         <input
//                           type="password"
//                           value={formData.newPassword}
//                           onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
//                           className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
//                             errors.newPassword ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                           placeholder="Minimum 8 characters"
//                         />
//                       </div>
//                       {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
//                     </div>

//                     {/* CONFIRM PASSWORD */}
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Confirm New Password
//                       </label>
//                       <div className="relative">
//                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                         <input
//                           type="password"
//                           value={formData.confirmPassword}
//                           onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                           className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
//                             errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
//                           }`}
//                           placeholder="Re-enter new password"
//                         />
//                       </div>
//                       {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-500">
//                     Leave blank if you don't want to change your password
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* SUBMIT BUTTONS */}
//             {isEditing && (
//               <div className="flex gap-3">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader/>
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-5 w-5" />
//                       <span>Save Changes</span>
//                     </>
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             )}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }