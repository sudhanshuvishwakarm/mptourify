'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { registerAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { fetchDistricts } from '@/redux/slices/districtSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  MapPin,
  Shield
} from 'lucide-react';
import { Box, Typography, Grid, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import Loader from '@/components/ui/Loader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';

export default function CreateUserPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.admin);
  const { districts } = useSelector((state) => state.district);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'rtc',
    employeeId: '',
    designation: '',
    assignedDistricts: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchDistricts({ status: 'active', limit: 100 }));
  }, []);

  useEffect(() => {
    if (success) {
      toast.success('User created successfully!');
      dispatch(clearSuccess());
      router.push('/admin/users');
    }
    if (error) {
      toast.error(error.message || 'Failed to create user');
      dispatch(clearError());
    }
  }, [success, error]);

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
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      toast.error('Please review and complete all required fields.');
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    dispatch(registerAdmin(submitData));
  };

  const handleDistrictToggle = (districtId) => {
    setFormData(prev => ({
      ...prev,
      assignedDistricts: prev.assignedDistricts.includes(districtId)
        ? prev.assignedDistricts.filter(id => id !== districtId)
        : [...prev.assignedDistricts, districtId]
    }));
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'rtc', label: 'RTC (Regional Tourism Coordinator)' }
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3},display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 , textAlign: 'left', width: '100%', maxWidth: 1000}}>
        <Link href="/admin/users" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
            <ArrowLeft size={20} color="#144ae9" />
          </Button>
        </Link>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Create New User
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add a new admin or RTC to the system
          </Typography>
        </Box>
      </Box>

      {/* FORM */}
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1000 }}>
        {/* BASIC INFORMATION */}
        <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Basic Information
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                placeholder="John Doe"
                required
                startIcon={<User size={20} color="#144ae9" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="john@mptourism.gov.in"
                required
                startIcon={<Mail size={20} color="#144ae9" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                placeholder="9876543210"
                required
                startIcon={<Phone size={20} color="#144ae9" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SelectField
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={roleOptions}
                required
              />
            </Grid>
          </Grid>
        </Card>

        {/* EMPLOYEE INFORMATION */}
        <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Employee Information
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP001"
                startIcon={<Briefcase size={20} color="#144ae9" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="Regional Coordinator"
              />
            </Grid>
          </Grid>
        </Card>

        {/* SECURITY */}
        <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Security
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
                placeholder="Minimum 8 characters"
                required
                startIcon={<Lock size={20} color="#144ae9" />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
                placeholder="Re-enter password"
                required
                startIcon={<Lock size={20} color="#144ae9" />}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ASSIGNED DISTRICTS (FOR RTC) */}
        {formData.role === 'rtc' && (
          <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <MapPin size={20} color="#144ae9" />
              <Typography variant="h6" fontWeight={600}>
                Assigned Districts
              </Typography>
              <Typography variant="caption" color="error">
                *
              </Typography>
            </Box>
            <FormGroup sx={{ 
              maxHeight: 400, 
              overflowY: 'auto',
              bgcolor: '#144ae905',
              p: 2,
              borderRadius: 2
            }}>
              <Grid container spacing={1}>
                {districts.map((district) => (
                  <Grid item xs={12} sm={6} md={4} key={district._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.assignedDistricts.includes(district._id)}
                          onChange={() => handleDistrictToggle(district._id)}
                          sx={{
                            color: '#144ae9',
                            '&.Mui-checked': {
                              color: '#144ae9',
                            },
                          }}
                        />
                      }
                      label={district.name}
                      sx={{
                        bgcolor: 'white',
                        m: 0,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: formData.assignedDistricts.includes(district._id) 
                          ? '#144ae9' 
                          : '#144ae920',
                        '&:hover': {
                          borderColor: '#144ae9',
                          bgcolor: '#144ae910'
                        }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
            {errors.assignedDistricts && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.assignedDistricts}
              </Typography>
            )}
            <Typography variant="body2" color="#144ae9" sx={{ mt: 2 }}>
              Selected: {formData.assignedDistricts.length} district(s)
            </Typography>
          </Card>
        )}

        {/* SUBMIT BUTTONS */}
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          <Link href="/admin/users" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
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
          </Link>
        </Box>
      </Box>
    </Box>
  );
}// 'use client'
// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useRouter } from 'next/navigation';
// import { registerAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
// import { fetchDistricts } from '@/redux/slices/districtSlice';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Mail,
//   Phone,
//   Lock,
//   Briefcase,
//   MapPin,
//   Shield
// } from 'lucide-react';
// import { Box, Typography, Grid, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';

// export default function CreateUserPage() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((state) => state.admin);
//   const { districts } = useSelector((state) => state.district);

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     role: 'rtc',
//     employeeId: '',
//     designation: '',
//     assignedDistricts: []
//   });

//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     dispatch(fetchDistricts({ status: 'active', limit: 100 }));
//   }, []);

//   useEffect(() => {
//     if (success) {
//       toast.success('User created successfully!');
//       dispatch(clearSuccess());
//       router.push('/admin/users');
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to create user');
//       dispatch(clearError());
//     }
//   }, [success, error]);

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
//     if (!formData.password) newErrors.password = 'Password is required';
//     if (formData.password.length < 8) {
//       newErrors.password = 'Password must be at least 8 characters';
//     }
//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
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

//     const { confirmPassword, ...submitData } = formData;
//     dispatch(registerAdmin(submitData));
//   };

//   const handleDistrictToggle = (districtId) => {
//     setFormData(prev => ({
//       ...prev,
//       assignedDistricts: prev.assignedDistricts.includes(districtId)
//         ? prev.assignedDistricts.filter(id => id !== districtId)
//         : [...prev.assignedDistricts, districtId]
//     }));
//   };

//   const roleOptions = [
//     { value: 'admin', label: 'Admin' },
//     { value: 'rtc', label: 'RTC (Regional Tourism Coordinator)' }
//   ];

//   return (
//     <Box sx={{ p: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
//         <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//           <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5 }}>
//             <ArrowLeft size={20} />
//           </Button>
//         </Link>
//         <Box>
//           <Typography variant="h4" fontWeight={700} color="text.primary">
//             Create New User
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//             Add a new admin or RTC to the system
//           </Typography>
//         </Box>
//       </Box>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 900 }}>
//         {/* BASIC INFORMATION */}
//         <Card sx={{ mb: 3 }}>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Basic Information
//           </Typography>
//           <Grid container spacing={3} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Full Name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 error={errors.name}
//                 placeholder="John Doe"
//                 required
//                 startIcon={<User size={20} />}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Email Address"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 error={errors.email}
//                 placeholder="john@mptourism.gov.in"
//                 required
//                 startIcon={<Mail size={20} />}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Phone Number"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 error={errors.phone}
//                 placeholder="9876543210"
//                 required
//                 startIcon={<Phone size={20} />}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <SelectField
//                 label="Role"
//                 value={formData.role}
//                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                 options={roleOptions}
//                 required
//               />
//             </Grid>
//           </Grid>
//         </Card>

//         {/* EMPLOYEE INFORMATION */}
//         <Card sx={{ mb: 3 }}>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Employee Information
//           </Typography>
//           <Grid container spacing={3} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Employee ID"
//                 value={formData.employeeId}
//                 onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                 placeholder="EMP001"
//                 startIcon={<Briefcase size={20} />}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Designation"
//                 value={formData.designation}
//                 onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                 placeholder="Regional Coordinator"
//               />
//             </Grid>
//           </Grid>
//         </Card>

//         {/* SECURITY */}
//         <Card sx={{ mb: 3 }}>
//           <Typography variant="h6" fontWeight={600} gutterBottom>
//             Security
//           </Typography>
//           <Grid container spacing={3} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Password"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 error={errors.password}
//                 placeholder="Minimum 8 characters"
//                 required
//                 startIcon={<Lock size={20} />}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Confirm Password"
//                 type="password"
//                 value={formData.confirmPassword}
//                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                 error={errors.confirmPassword}
//                 placeholder="Re-enter password"
//                 required
//                 startIcon={<Lock size={20} />}
//               />
//             </Grid>
//           </Grid>
//         </Card>

//         {/* ASSIGNED DISTRICTS (FOR RTC) */}
//         {formData.role === 'rtc' && (
//           <Card sx={{ mb: 3 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//               <MapPin size={20} color="#16a34a" />
//               <Typography variant="h6" fontWeight={600}>
//                 Assigned Districts
//               </Typography>
//               <Typography variant="caption" color="error">
//                 *
//               </Typography>
//             </Box>
//             <FormGroup sx={{ 
//               maxHeight: 400, 
//               overflowY: 'auto',
//               bgcolor: 'grey.50',
//               p: 2,
//               borderRadius: 2
//             }}>
//               <Grid container spacing={1}>
//                 {districts.map((district) => (
//                   <Grid item xs={12} sm={6} md={4} key={district._id}>
//                     <FormControlLabel
//                       control={
//                         <Checkbox
//                           checked={formData.assignedDistricts.includes(district._id)}
//                           onChange={() => handleDistrictToggle(district._id)}
//                           color="success"
//                         />
//                       }
//                       label={district.name}
//                       sx={{
//                         bgcolor: 'white',
//                         m: 0,
//                         px: 1.5,
//                         py: 0.5,
//                         borderRadius: 1,
//                         border: '1px solid',
//                         borderColor: formData.assignedDistricts.includes(district._id) 
//                           ? 'success.main' 
//                           : 'divider',
//                         '&:hover': {
//                           borderColor: 'success.main',
//                           bgcolor: 'success.lighter'
//                         }
//                       }}
//                     />
//                   </Grid>
//                 ))}
//               </Grid>
//             </FormGroup>
//             {errors.assignedDistricts && (
//               <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
//                 {errors.assignedDistricts}
//               </Typography>
//             )}
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//               Selected: {formData.assignedDistricts.length} district(s)
//             </Typography>
//           </Card>
//         )}

//         {/* SUBMIT BUTTONS */}
//         <Box sx={{ display: 'flex', gap: 2 }}>
//           <Button
//             type="submit"
//             disabled={loading}
//             startIcon={loading ? <Loader /> : <Save size={20} />}
//             size="large"
//           >
//             {loading ? 'Creating...' : 'Create User'}
//           </Button>
//           <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//             <Button variant="outlined" size="large">
//               Cancel
//             </Button>
//           </Link>
//         </Box>
//       </Box>
//     </Box>
//   );
// }