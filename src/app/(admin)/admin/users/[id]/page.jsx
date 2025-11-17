'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchAdminById, updateAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import StatusChip from '@/components/ui/StatusChip';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedAdmin, loading, error, success } = useSelector((state) => state.admin);
  const { districts } = useSelector((state) => state.district);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'rtc',
    employeeId: '',
    designation: '',
    assignedDistricts: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.id && (!selectedAdmin || selectedAdmin._id !== params.id)) {
      dispatch(fetchAdminById(params.id));
    }
    if (districts.length === 0) {
      dispatch(fetchDistricts({ status: 'active', limit: 100 }));
    }
  }, [params.id, selectedAdmin?._id, districts.length, dispatch]);

  useEffect(() => {
    if (selectedAdmin && selectedAdmin._id === params.id) {
      setFormData({
        name: selectedAdmin.name || '',
        email: selectedAdmin.email || '',
        phone: selectedAdmin.phone || '',
        role: selectedAdmin.role || 'rtc',
        employeeId: selectedAdmin.employeeId || '',
        designation: selectedAdmin.designation || '',
        assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
      });
    }
  }, [selectedAdmin, params.id]);

  useEffect(() => {
    if (success) {
      toast.success('User updated successfully!');
      dispatch(clearSuccess());
      setIsEditing(false);
      setIsSaving(false);
    }
    if (error) {
      toast.error(error.message || 'Failed to update user');
      dispatch(clearError());
      setIsSaving(false);
    }
  }, [success, error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (formData.role === 'rtc' && formData.assignedDistricts.length === 0) {
      newErrors.assignedDistricts = 'RTC must have at least one assigned district';
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

    setIsSaving(true);
    try {
      await dispatch(updateAdmin({ id: params.id, adminData: formData })).unwrap();
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleDistrictToggle = (districtId) => {
    setFormData(prev => ({
      ...prev,
      assignedDistricts: prev.assignedDistricts.includes(districtId)
        ? prev.assignedDistricts.filter(id => id !== districtId)
        : [...prev.assignedDistricts, districtId]
    }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsSaving(false);
    if (selectedAdmin) {
      setFormData({
        name: selectedAdmin.name || '',
        email: selectedAdmin.email || '',
        phone: selectedAdmin.phone || '',
        role: selectedAdmin.role || 'rtc',
        employeeId: selectedAdmin.employeeId || '',
        designation: selectedAdmin.designation || '',
        assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
      });
    }
    setErrors({});
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'rtc', label: 'RTC' }
  ];

  if (loading && !selectedAdmin) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Loading..."} />
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="fixed inset-0 z-[9999]">
        <Loader message={"Saving..."} />
      </div>
    );
  }

  if (!selectedAdmin) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-600 text-lg mb-4">User not found</div>
        <Link href="/admin/users" className="no-underline">
          <Button variant="outlined" sx={{ mt: 2 }}>
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/users" className="no-underline">
            <Button 
              variant="outlined" 
              sx={{ 
                minWidth: 'auto', 
                p: 1,
                borderColor: '#1348e8',
                color: '#1348e8',
                '&:hover': {
                  borderColor: '#0d3ec7',
                  backgroundColor: 'rgba(19, 72, 232, 0.06)'
                }
              }}
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {selectedAdmin.name}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Edit user details' : 'View user details'}
            </p>
          </div>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            size="large"
            sx={{ 
              backgroundColor: '#1348e8',
              '&:hover': { backgroundColor: '#0d3ec7' }
            }}
          >
            Edit User
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="p-6 border border-gray-200 bg-white">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#1348e8] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {selectedAdmin.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedAdmin.name}
              </div>
              <div className="text-[#1348e8] font-medium capitalize">
                {selectedAdmin.role}
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Status</span>
                <StatusChip status={selectedAdmin.status} />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Employee ID</span>
                <span className="text-sm font-semibold text-[#1348e8]">
                  {selectedAdmin.employeeId || 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Created</span>
                </div>
                <span className="text-sm text-gray-900">
                  {selectedAdmin.createdAt
                    ? new Date(selectedAdmin.createdAt).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">Last Login</span>
                </div>
                <span className="text-sm text-gray-900">
                  {selectedAdmin.lastLogin
                    ? new Date(selectedAdmin.lastLogin).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information Card */}
            <Card className="p-6 border border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                User Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <TextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    error={errors.name}
                    required
                    fullWidth
                    startIcon={<User size={20} className="text-gray-500" />}
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    error={errors.email}
                    required
                    fullWidth
                    startIcon={<Mail size={20} className="text-gray-500" />}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <TextField
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    error={errors.phone}
                    required
                    fullWidth
                    startIcon={<Phone size={20} className="text-gray-500" />}
                  />
                  <SelectField
                    label="Role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    options={roleOptions}
                    disabled={!isEditing}
                    required
                    fullWidth
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <TextField
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    disabled={!isEditing}
                    fullWidth
                    startIcon={<Briefcase size={20} className="text-gray-500" />}
                  />
                  <TextField
                    label="Designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    disabled={!isEditing}
                    fullWidth
                  />
                </div>
              </div>
            </Card>

            {/* Assigned Districts Card */}
            {formData.role === 'rtc' && (
              <Card className="p-6 border border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-gray-500" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Assigned Districts
                  </h2>
                  <span className="text-red-500">*</span>
                  <span className="text-sm text-[#1348e8] font-medium ml-auto">
                    Selected: {formData.assignedDistricts.length} district(s)
                  </span>
                </div>
                
                <div className="max-h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {districts.map((district) => (
                      <label 
                        key={district._id}
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.assignedDistricts.includes(district._id)
                            ? 'border-[#1348e8] bg-blue-50'
                            : 'border-gray-300 bg-white'
                        } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#1348e8] hover:bg-blue-50'}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedDistricts.includes(district._id)}
                          onChange={() => handleDistrictToggle(district._id)}
                          disabled={!isEditing}
                          className="w-4 h-4 text-[#1348e8] bg-gray-100 border-gray-300 rounded focus:ring-[#1348e8] focus:ring-2"
                        />
                        <span className={`text-sm font-medium ${
                          formData.assignedDistricts.includes(district._id)
                            ? 'text-[#1348e8]'
                            : 'text-gray-700'
                        }`}>
                          {district.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                {errors.assignedDistricts && (
                  <div className="text-red-500 text-sm mt-2">
                    {errors.assignedDistricts}
                  </div>
                )}
              </Card>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSaving}
                  startIcon={<Save size={20} />}
                  size="large"
                  sx={{ 
                    backgroundColor: '#1348e8',
                    '&:hover': { backgroundColor: '#0d3ec7' },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(19, 72, 232, 0.3)'
                    }
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  size="large"
                  sx={{ 
                    borderColor: '#1348e8',
                    color: '#1348e8',
                    '&:hover': {
                      borderColor: '#0d3ec7',
                      backgroundColor: 'rgba(19, 72, 232, 0.06)'
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}


// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchAdminById, updateAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Mail,
//   Phone,
//   Briefcase,
//   MapPin,
//   Calendar,
//   Clock
// } from 'lucide-react';
// import { Box, Typography, Avatar, Checkbox, FormControlLabel, FormGroup, Divider } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import StatusChip from '@/components/ui/StatusChip';

// export default function EditUserPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedAdmin, loading, error, success } = useSelector((state) => state.admin);
//   const { districts } = useSelector((state) => state.district);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     role: 'rtc',
//     employeeId: '',
//     designation: '',
//     assignedDistricts: []
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (params.id && (!selectedAdmin || selectedAdmin._id !== params.id)) {
//       dispatch(fetchAdminById(params.id));
//     }
//     if (districts.length === 0) {
//       dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//     }
//   }, [params.id, selectedAdmin?._id, districts.length, dispatch]);

//   useEffect(() => {
//     if (selectedAdmin && selectedAdmin._id === params.id) {
//       setFormData({
//         name: selectedAdmin.name || '',
//         email: selectedAdmin.email || '',
//         phone: selectedAdmin.phone || '',
//         role: selectedAdmin.role || 'rtc',
//         employeeId: selectedAdmin.employeeId || '',
//         designation: selectedAdmin.designation || '',
//         assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
//       });
//     }
//   }, [selectedAdmin, params.id]);

//   useEffect(() => {
//     if (success) {
//       toast.success('User updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update user');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Invalid email format';
//     }
//     if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
//     if (!/^[0-9]{10}$/.test(formData.phone)) {
//       newErrors.phone = 'Phone must be 10 digits';
//     }
//     if (formData.role === 'rtc' && formData.assignedDistricts.length === 0) {
//       newErrors.assignedDistricts = 'RTC must have at least one assigned district';
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

//     try {
//       await dispatch(updateAdmin({ id: params.id, adminData: formData })).unwrap();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleDistrictToggle = (districtId) => {
//     setFormData(prev => ({
//       ...prev,
//       assignedDistricts: prev.assignedDistricts.includes(districtId)
//         ? prev.assignedDistricts.filter(id => id !== districtId)
//         : [...prev.assignedDistricts, districtId]
//     }));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     if (selectedAdmin) {
//       setFormData({
//         name: selectedAdmin.name || '',
//         email: selectedAdmin.email || '',
//         phone: selectedAdmin.phone || '',
//         role: selectedAdmin.role || 'rtc',
//         employeeId: selectedAdmin.employeeId || '',
//         designation: selectedAdmin.designation || '',
//         assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
//       });
//     }
//     setErrors({});
//   };

//   const roleOptions = [
//     { value: 'admin', label: 'Admin' },
//     { value: 'rtc', label: 'RTC' }
//   ];

//   if (loading && !selectedAdmin) {
//     return <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Signing in..."} />
//         </div>;
//   }

//   if (!selectedAdmin) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="h6" color="text.secondary" gutterBottom>
//           User not found
//         </Typography>
//         <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//           <Button variant="outlined" sx={{ mt: 2 }}>
//             Back to Users
//           </Button>
//         </Link>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         mb: 3,
//         flexDirection: { xs: 'column', sm: 'row' },
//         gap: 2
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               sx={{ 
//                 minWidth: 'auto', 
//                 p: 1,
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {selectedAdmin.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {isEditing ? 'Edit user details' : 'View user details'}
//             </Typography>
//           </Box>
//         </Box>
//         {!isEditing && (
//           <Button 
//             onClick={() => setIsEditing(true)} 
//             size="large"
//             sx={{ 
//               backgroundColor: '#144ae9',
//               '&:hover': { backgroundColor: '#0d3ec7' }
//             }}
//           >
//             Edit User
//           </Button>
//         )}
//       </Box>

//       <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
//         <Box sx={{ width: { xs: '100%', lg: '300px' }, flexShrink: 0 }}>
//           <Card sx={{ 
//             p: 3, 
//             border: '1px solid',
//             borderColor: '#144ae920',
//             backgroundColor: 'white'
//           }}>
//             <Box sx={{ textAlign: 'center', mb: 3 }}>
//               <Avatar sx={{ 
//                 width: 80, 
//                 height: 80, 
//                 bgcolor: '#144ae9',
//                 fontSize: '2rem',
//                 fontWeight: 700,
//                 mx: 'auto',
//                 mb: 2
//               }}>
//                 {selectedAdmin.name?.charAt(0).toUpperCase()}
//               </Avatar>
//               <Typography variant="h6" fontWeight={600} color="text.primary">
//                 {selectedAdmin.name}
//               </Typography>
//               <Typography variant="body2" color="#144ae9" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
//                 {selectedAdmin.role}
//               </Typography>
//             </Box>

//             <Divider sx={{ my: 3, borderColor: '#144ae920' }} />

//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Status
//                 </Typography>
//                 <StatusChip status={selectedAdmin.status} />
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Employee ID
//                 </Typography>
//                 <Typography variant="body2" fontWeight={600} color="#144ae9">
//                   {selectedAdmin.employeeId || 'N/A'}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Calendar size={16} color="#144ae9" />
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Created
//                   </Typography>
//                 </Box>
//                 <Typography variant="body2" color="text.primary">
//                   {selectedAdmin.createdAt
//                     ? new Date(selectedAdmin.createdAt).toLocaleDateString()
//                     : 'N/A'}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Clock size={16} color="#144ae9" />
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Last Login
//                   </Typography>
//                 </Box>
//                 <Typography variant="body2" color="text.primary">
//                   {selectedAdmin.lastLogin
//                     ? new Date(selectedAdmin.lastLogin).toLocaleDateString()
//                     : 'Never'}
//                 </Typography>
//               </Box>
//             </Box>
//           </Card>
//         </Box>

//         <Box sx={{ flex: 1 }}>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             <Card sx={{ 
//               p: 3, 
//               border: '1px solid',
//               borderColor: '#144ae920',
//               backgroundColor: 'white'
//             }}>
//               <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                 User Information
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Full Name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.name}
//                     required
//                     fullWidth
//                     startIcon={<User size={20} color="#144ae9" />}
//                   />
//                   <TextField
//                     label="Email Address"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.email}
//                     required
//                     fullWidth
//                     startIcon={<Mail size={20} color="#144ae9" />}
//                   />
//                 </Box>

//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Phone Number"
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.phone}
//                     required
//                     fullWidth
//                     startIcon={<Phone size={20} color="#144ae9" />}
//                   />
//                   <SelectField
//                     label="Role"
//                     value={formData.role}
//                     onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                     options={roleOptions}
//                     disabled={!isEditing}
//                     required
//                     fullWidth
//                   />
//                 </Box>

//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Employee ID"
//                     value={formData.employeeId}
//                     onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                     disabled={!isEditing}
//                     fullWidth
//                     startIcon={<Briefcase size={20} color="#144ae9" />}
//                   />
//                   <TextField
//                     label="Designation"
//                     value={formData.designation}
//                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                     disabled={!isEditing}
//                     fullWidth
//                   />
//                 </Box>
//               </Box>
//             </Card>

//             {formData.role === 'rtc' && (
//               <Card sx={{ 
//                 p: 3, 
//                 border: '1px solid',
//                 borderColor: '#144ae920',
//                 backgroundColor: 'white'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//                   <MapPin size={20} color="#144ae9" />
//                   <Typography variant="h5" fontWeight={600} color="text.primary">
//                     Assigned Districts
//                   </Typography>
//                   <Typography variant="caption" color="error">
//                     *
//                   </Typography>
//                   <Typography variant="body2" color="#144ae9" sx={{ ml: 'auto', fontWeight: 500 }}>
//                     Selected: {formData.assignedDistricts.length} district(s)
//                   </Typography>
//                 </Box>
                
//                 <FormGroup sx={{ 
//                   maxHeight: 400, 
//                   overflowY: 'auto',
//                   backgroundColor: '#f8fafc',
//                   p: 2,
//                   borderRadius: 2,
//                   border: '1px solid',
//                   borderColor: '#144ae920'
//                 }}>
//                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                     {districts.map((district) => (
//                       <FormControlLabel
//                         key={district._id}
//                         control={
//                           <Checkbox
//                             checked={formData.assignedDistricts.includes(district._id)}
//                             onChange={() => handleDistrictToggle(district._id)}
//                             disabled={!isEditing}
//                             sx={{
//                               color: '#144ae9',
//                               '&.Mui-checked': { color: '#144ae9' }
//                             }}
//                           />
//                         }
//                         label={
//                           <Typography variant="body2" sx={{ 
//                             color: formData.assignedDistricts.includes(district._id) ? '#144ae9' : 'text.primary',
//                             fontWeight: formData.assignedDistricts.includes(district._id) ? 600 : 400
//                           }}>
//                             {district.name}
//                           </Typography>
//                         }
//                         sx={{
//                           backgroundColor: 'white',
//                           m: 0,
//                           px: 2,
//                           py: 1,
//                           borderRadius: 1,
//                           border: '1px solid',
//                           borderColor: formData.assignedDistricts.includes(district._id) 
//                             ? '#144ae9' 
//                             : '#e2e8f0',
//                           minWidth: '150px',
//                           flex: '1 1 calc(33.333% - 8px)',
//                           maxWidth: 'calc(33.333% - 8px)',
//                           opacity: !isEditing ? 0.6 : 1,
//                           '&:hover': isEditing ? {
//                             borderColor: '#144ae9',
//                             backgroundColor: '#144ae908'
//                           } : {}
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </FormGroup>
//                 {errors.assignedDistricts && (
//                   <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
//                     {errors.assignedDistricts}
//                   </Typography>
//                 )}
//               </Card>
//             )}

//             {isEditing && (
//               <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
//                 <Button
//                   type="submit"
//                   disabled={loading}
//                   startIcon={<Save size={20} />}
//                   size="large"
                  
//                 >
//                   {loading ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   onClick={handleCancel}
//                   size="large"
//                   sx={{ 
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter, useParams } from 'next/navigation';
// import { fetchAdminById, updateAdmin, clearError, clearSuccess , clearAdmin } from '@/redux/slices/adminSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Mail,
//   Phone,
//   Briefcase,
//   MapPin,
//   Shield,
//   Calendar,
//   Clock
// } from 'lucide-react';
// import { Box, Typography, Avatar, Checkbox, FormControlLabel, FormGroup, Divider } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import StatusChip from '@/components/ui/StatusChip';

// export default function EditUserPage() {
//   const router = useRouter();
//   const params = useParams();
//   const dispatch = useDispatch();
//   const { selectedAdmin, loading, error, success } = useSelector((state) => state.admin);
//   const { districts } = useSelector((state) => state.district);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     role: 'rtc',
//     employeeId: '',
//     designation: '',
//     assignedDistricts: []
//   });

//   const [isEditing, setIsEditing] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [hasFetched, setHasFetched] = useState(false);
  
//   useEffect(() => {
//   // This detects when the user ID changes but selectedAdmin still has old data
//   if (params.id && selectedAdmin && selectedAdmin._id !== params.id) {
//     // Force refetch when we have a different user's data
//     dispatch(fetchAdminById(params.id));
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//   }
// }, [params.id, selectedAdmin, dispatch]);
//   useEffect(() => {
//     if (params.id && !hasFetched && !selectedAdmin) {
//       dispatch(fetchAdminById(params.id));
//       dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//       setHasFetched(true);
//     }
//   }, [params.id, hasFetched, selectedAdmin, dispatch]);
//   useEffect(() => {
//     if (selectedAdmin && selectedAdmin._id === params.id) {
//       setFormData({
//         name: selectedAdmin.name || '',
//         email: selectedAdmin.email || '',
//         phone: selectedAdmin.phone || '',
//         role: selectedAdmin.role || 'rtc',
//         employeeId: selectedAdmin.employeeId || '',
//         designation: selectedAdmin.designation || '',
//         assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
//       });
//     }
//   }, [selectedAdmin, params.id]);

//   // FIXED: Handle only toast messages, no API calls
//   useEffect(() => {
//     if (success) {
//       toast.success('User updated successfully!');
//       dispatch(clearSuccess());
//       setIsEditing(false);
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to update user');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) newErrors.name = 'Name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Invalid email format';
//     }
//     if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
//     if (!/^[0-9]{10}$/.test(formData.phone)) {
//       newErrors.phone = 'Phone must be 10 digits';
//     }
//     if (formData.role === 'rtc' && formData.assignedDistricts.length === 0) {
//       newErrors.assignedDistricts = 'RTC must have at least one assigned district';
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

//     dispatch(updateAdmin({ id: params.id, adminData: formData }));
//   };

//   const handleDistrictToggle = (districtId) => {
//     setFormData(prev => ({
//       ...prev,
//       assignedDistricts: prev.assignedDistricts.includes(districtId)
//         ? prev.assignedDistricts.filter(id => id !== districtId)
//         : [...prev.assignedDistricts, districtId]
//     }));
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     if (selectedAdmin) {
//       setFormData({
//         name: selectedAdmin.name || '',
//         email: selectedAdmin.email || '',
//         phone: selectedAdmin.phone || '',
//         role: selectedAdmin.role || 'rtc',
//         employeeId: selectedAdmin.employeeId || '',
//         designation: selectedAdmin.designation || '',
//         assignedDistricts: selectedAdmin.assignedDistricts?.map(d => d._id || d) || []
//       });
//     }
//     setErrors({});
//   };

//   const roleOptions = [
//     { value: 'admin', label: 'Admin' },
//     { value: 'rtc', label: 'RTC' }
//   ];

//   if (loading && !selectedAdmin) {
//     return (
//         <Loader />
//     );
//   }

//   if (!selectedAdmin) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 8 }}>
//         <Typography variant="h6" color="text.secondary" gutterBottom>
//           User not found
//         </Typography>
//         <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//           <Button variant="outlined" sx={{ mt: 2 }}>
//             Back to Users
//           </Button>
//         </Link>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1200px', mx: 'auto' }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         justifyContent: 'space-between', 
//         alignItems: 'center', 
//         mb: 3,
//         flexDirection: { xs: 'column', sm: 'row' },
//         gap: 2
//       }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               sx={{ 
//                 minWidth: 'auto', 
//                 p: 1,
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               <ArrowLeft size={20} />
//             </Button>
//           </Link>
//           <Box>
//             <Typography variant="h4" fontWeight={700} color="text.primary">
//               {selectedAdmin.name}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {isEditing ? 'Edit user details' : 'View user details'}
//             </Typography>
//           </Box>
//         </Box>
//         {!isEditing && (
//           <Button 
//             onClick={() => setIsEditing(true)} 
//             size="large"
//             sx={{ 
//               backgroundColor: '#144ae9',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             Edit User
//           </Button>
//         )}
//       </Box>

//       {/* MAIN CONTENT - USING BOX INSTEAD OF GRID */}
//       <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
//         {/* USER INFO CARD */}
//         <Box sx={{ width: { xs: '100%', lg: '300px' }, flexShrink: 0 }}>
//           <Card sx={{ 
//             p: 3, 
//             border: '1px solid',
//             borderColor: '#144ae920',
//             backgroundColor: 'white'
//           }}>
//             {/* AVATAR */}
//             <Box sx={{ textAlign: 'center', mb: 3 }}>
//               <Avatar sx={{ 
//                 width: 80, 
//                 height: 80, 
//                 bgcolor: '#144ae9',
//                 fontSize: '2rem',
//                 fontWeight: 700,
//                 mx: 'auto',
//                 mb: 2
//               }}>
//                 {selectedAdmin.name?.charAt(0).toUpperCase()}
//               </Avatar>
//               <Typography variant="h6" fontWeight={600} color="text.primary">
//                 {selectedAdmin.name}
//               </Typography>
//               <Typography variant="body2" color="#144ae9" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
//                 {selectedAdmin.role}
//               </Typography>
//             </Box>

//             <Divider sx={{ my: 3, borderColor: '#144ae920' }} />

//             {/* STATUS INFO */}
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Status
//                 </Typography>
//                 <StatusChip status={selectedAdmin.status} />
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                   Employee ID
//                 </Typography>
//                 <Typography variant="body2" fontWeight={600} color="#144ae9">
//                   {selectedAdmin.employeeId || 'N/A'}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Calendar size={16} color="#144ae9" />
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Created
//                   </Typography>
//                 </Box>
//                 <Typography variant="body2" color="text.primary">
//                   {selectedAdmin.createdAt
//                     ? new Date(selectedAdmin.createdAt).toLocaleDateString()
//                     : 'N/A'}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Clock size={16} color="#144ae9" />
//                   <Typography variant="body2" color="text.secondary" fontWeight={500}>
//                     Last Login
//                   </Typography>
//                 </Box>
//                 <Typography variant="body2" color="text.primary">
//                   {selectedAdmin.lastLogin
//                     ? new Date(selectedAdmin.lastLogin).toLocaleDateString()
//                     : 'Never'}
//                 </Typography>
//               </Box>
//             </Box>
//           </Card>
//         </Box>

//         {/* EDIT FORM */}
//         <Box sx={{ flex: 1 }}>
//           <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//             {/* USER INFORMATION CARD */}
//             <Card sx={{ 
//               p: 3, 
//               border: '1px solid',
//               borderColor: '#144ae920',
//               backgroundColor: 'white'
//             }}>
//               <Typography variant="h5" fontWeight={600} gutterBottom color="text.primary" sx={{ mb: 3 }}>
//                 User Information
//               </Typography>
              
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                 {/* FIRST ROW */}
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Full Name"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.name}
//                     required
//                     fullWidth
//                     startIcon={<User size={20} color="#144ae9" />}
//                   />
//                   <TextField
//                     label="Email Address"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.email}
//                     required
//                     fullWidth
//                     startIcon={<Mail size={20} color="#144ae9" />}
//                   />
//                 </Box>

//                 {/* SECOND ROW */}
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Phone Number"
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     disabled={!isEditing}
//                     error={errors.phone}
//                     required
//                     fullWidth
//                     startIcon={<Phone size={20} color="#144ae9" />}
//                   />
//                   <SelectField
//                     label="Role"
//                     value={formData.role}
//                     onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                     options={roleOptions}
//                     disabled={!isEditing}
//                     required
//                     fullWidth
//                   />
//                 </Box>

//                 {/* THIRD ROW */}
//                 <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
//                   <TextField
//                     label="Employee ID"
//                     value={formData.employeeId}
//                     onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                     disabled={!isEditing}
//                     fullWidth
//                     startIcon={<Briefcase size={20} color="#144ae9" />}
//                   />
//                   <TextField
//                     label="Designation"
//                     value={formData.designation}
//                     onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                     disabled={!isEditing}
//                     fullWidth
//                   />
//                 </Box>
//               </Box>
//             </Card>

//             {/* ASSIGNED DISTRICTS (FOR RTC) */}
//             {formData.role === 'rtc' && (
//               <Card sx={{ 
//                 p: 3, 
//                 border: '1px solid',
//                 borderColor: '#144ae920',
//                 backgroundColor: 'white'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
//                   <MapPin size={20} color="#144ae9" />
//                   <Typography variant="h5" fontWeight={600} color="text.primary">
//                     Assigned Districts
//                   </Typography>
//                   <Typography variant="caption" color="error">
//                     *
//                   </Typography>
//                   <Typography variant="body2" color="#144ae9" sx={{ ml: 'auto', fontWeight: 500 }}>
//                     Selected: {formData.assignedDistricts.length} district(s)
//                   </Typography>
//                 </Box>
                
//                 <FormGroup sx={{ 
//                   maxHeight: 400, 
//                   overflowY: 'auto',
//                   backgroundColor: '#f8fafc',
//                   p: 2,
//                   borderRadius: 2,
//                   border: '1px solid',
//                   borderColor: '#144ae920'
//                 }}>
//                   <Box sx={{ 
//                     display: 'flex', 
//                     flexWrap: 'wrap', 
//                     gap: 1 
//                   }}>
//                     {districts.map((district) => (
//                       <FormControlLabel
//                         key={district._id}
//                         control={
//                           <Checkbox
//                             checked={formData.assignedDistricts.includes(district._id)}
//                             onChange={() => handleDistrictToggle(district._id)}
//                             disabled={!isEditing}
//                             sx={{
//                               color: '#144ae9',
//                               '&.Mui-checked': {
//                                 color: '#144ae9',
//                               },
//                             }}
//                           />
//                         }
//                         label={
//                           <Typography variant="body2" sx={{ 
//                             color: formData.assignedDistricts.includes(district._id) ? '#144ae9' : 'text.primary',
//                             fontWeight: formData.assignedDistricts.includes(district._id) ? 600 : 400
//                           }}>
//                             {district.name}
//                           </Typography>
//                         }
//                         sx={{
//                           backgroundColor: 'white',
//                           m: 0,
//                           px: 2,
//                           py: 1,
//                           borderRadius: 1,
//                           border: '1px solid',
//                           borderColor: formData.assignedDistricts.includes(district._id) 
//                             ? '#144ae9' 
//                             : '#e2e8f0',
//                           minWidth: '150px',
//                           flex: '1 1 calc(33.333% - 8px)',
//                           maxWidth: 'calc(33.333% - 8px)',
//                           opacity: !isEditing ? 0.6 : 1,
//                           '&:hover': isEditing ? {
//                             borderColor: '#144ae9',
//                             backgroundColor: '#144ae908'
//                           } : {},
//                         }}
//                       />
//                     ))}
//                   </Box>
//                 </FormGroup>
//                 {errors.assignedDistricts && (
//                   <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
//                     {errors.assignedDistricts}
//                   </Typography>
//                 )}
//               </Card>
//             )}

//             {/* SUBMIT BUTTONS */}
//             {isEditing && (
//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: 2,
//                 justifyContent: 'flex-start'
//               }}>
//                 <Button
//                   type="submit"
//                   disabled={loading}
//                   startIcon={loading ? <Loader size={16} /> : <Save size={20} />}
//                   size="large"
//                   sx={{ 
//                     backgroundColor: '#144ae9',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     }
//                   }}
//                 >
//                   {loading ? 'Saving...' : 'Save Changes'}
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   onClick={handleCancel}
//                   size="large"
//                   sx={{ 
//                     borderColor: '#144ae9',
//                     color: '#144ae9',
//                     '&:hover': {
//                       borderColor: '#0d3ec7',
//                       backgroundColor: '#144ae910'
//                     }
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             )}
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// }


