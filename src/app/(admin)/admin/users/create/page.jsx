'use client';

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
  Image as ImageIcon,
  CloudUpload,
  Link as LinkIcon,
  X
} from 'lucide-react';
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

  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'rtc',
    employeeId: '',
    designation: '',
    assignedDistricts: [],
    profileImageUrl: ''
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        toast.error('File size exceeds 10MB limit');
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUrlChange = (url) => {
    setFormData(prev => ({ ...prev, profileImageUrl: url }));
    setPreview(url);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (uploadMethod === 'url') {
      setFormData(prev => ({ ...prev, profileImageUrl: '' }));
    }
  };

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

    // Create FormData for file upload or use JSON for URL
    if (uploadMethod === 'file' && file) {
      const formDataToSubmit = new FormData();
      
      // Append profile image file
      formDataToSubmit.append('profileImage', file);
      formDataToSubmit.append('uploadMethod', 'file');
      
      // Append other form data
      formDataToSubmit.append('name', submitData.name);
      formDataToSubmit.append('email', submitData.email);
      formDataToSubmit.append('password', submitData.password);
      formDataToSubmit.append('phone', submitData.phone);
      formDataToSubmit.append('role', submitData.role);
      formDataToSubmit.append('employeeId', submitData.employeeId);
      formDataToSubmit.append('designation', submitData.designation);
      formDataToSubmit.append('assignedDistricts', JSON.stringify(submitData.assignedDistricts));

      dispatch(registerAdmin(formDataToSubmit));
    } else if (uploadMethod === 'url' && formData.profileImageUrl) {
      // Use regular JSON for URL upload
      const dataWithUrl = {
        ...submitData,
        profileImage: formData.profileImageUrl,
        uploadMethod: 'url'
      };
      delete dataWithUrl.profileImageUrl;
      dispatch(registerAdmin(dataWithUrl));
    } else {
      // No image uploaded
      dispatch(registerAdmin(submitData));
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

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'rtc', label: 'RTC (Regional Tourism Coordinator)' }
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* HEADER */}
      {loading && <div className="fixed inset-0 z-[9999]">
          <Loader message={"Creating..."} />
        </div>}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/users" className="no-underline">
          <Button 
            variant="outlined" 
            sx={{ 
              minWidth: 'auto', 
              p: 1.5,
              borderColor: '#1348e8',
              color: '#1348e8',
              '&:hover': {
                borderColor: '#0f3bc7',
                backgroundColor: '#1348e810'
              }
            }}
          >
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold  text-gray-900">
            Create New User
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Add a new admin or RTC to the system
          </p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* PROFILE IMAGE */}
        <Card className="p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Profile Image
          </h2>
          
          {/* UPLOAD METHOD SELECTION */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              type="button"
              onClick={() => {
                setUploadMethod('file');
                setFile(null);
                setPreview(null);
                setFormData(prev => ({ ...prev, profileImageUrl: '' }));
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                uploadMethod === 'file' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CloudUpload size={18} />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMethod('url');
                setFile(null);
                setPreview(null);
                setFormData(prev => ({ ...prev, profileImageUrl: '' }));
              }}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm ${
                uploadMethod === 'url' 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon size={18} />
              Paste URL
            </button>
          </div>

          {uploadMethod === 'file' ? (
            <>
              {!file ? (
                <div
                  className="border-2 border-dashed border-blue-600 rounded-lg p-6 text-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => document.getElementById('profile-image-upload').click()}
                >
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={36} className="text-blue-600" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    Click to upload profile image
                  </div>
                  <div className="text-sm text-gray-600">
                    Supports JPG, PNG, WebP (Max 10MB)
                  </div>
                </div>
              ) : (
                <div className="border border-blue-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <ImageIcon size={24} className="text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={removeFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={18} />
                    </Button>
                  </div>
                  
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-blue-100"
                  />
                </div>
              )}
              
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <>
              <TextField
                label="Profile Image URL"
                value={formData.profileImageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/profile-image.jpg"
                startIcon={<LinkIcon size={20} className="text-blue-600" />}
                fullWidth
              />
              {preview && formData.profileImageUrl && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={preview}
                    alt="URL Preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-blue-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      toast.error('Invalid image URL');
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Card>

        {/* BASIC INFORMATION */}
        <Card className="p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              placeholder="John Doe"
              required
              fullWidth
              startIcon={<User size={20} className="text-blue-600" />}
            />
            <TextField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              placeholder="john@mptourism.gov.in"
              required
              fullWidth
              startIcon={<Mail size={20} className="text-blue-600" />}
            />
            <TextField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              placeholder="9876543210"
              required
              fullWidth
              startIcon={<Phone size={20} className="text-blue-600" />}
            />
            <SelectField
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={roleOptions}
              required
              fullWidth
            />
          </div>
        </Card>

        {/* EMPLOYEE INFORMATION */}
        <Card className="p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Employee Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="EMP001"
              fullWidth
              startIcon={<Briefcase size={20} className="text-blue-600" />}
            />
            <TextField
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Regional Coordinator"
              fullWidth
            />
          </div>
        </Card>

        {/* SECURITY */}
        <Card className="p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              placeholder="Minimum 8 characters"
              required
              fullWidth
              startIcon={<Lock size={20} className="text-blue-600" />}
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              placeholder="Re-enter password"
              required
              fullWidth
              startIcon={<Lock size={20} className="text-blue-600" />}
            />
          </div>
        </Card>

        {/* ASSIGNED DISTRICTS (FOR RTC) */}
        {formData.role === 'rtc' && (
          <Card className="p-6 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Assigned Districts
              </h2>
              <span className="text-red-500">*</span>
            </div>
            
            <div className="max-h-96 overflow-y-auto bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {districts.map((district) => (
                  <label
                    key={district._id}
                    className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors ${
                      formData.assignedDistricts.includes(district._id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedDistricts.includes(district._id)}
                      onChange={() => handleDistrictToggle(district._id)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${
                      formData.assignedDistricts.includes(district._id)
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700'
                    }`}>
                      {district.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {errors.assignedDistricts && (
              <p className="text-red-600 text-sm mt-2">{errors.assignedDistricts}</p>
            )}
            
            <p className="text-blue-600 text-sm font-medium mt-3">
              Selected: {formData.assignedDistricts.length} district(s)
            </p>
          </Card>
        )}

        {/* SUBMIT BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="submit"
            disabled={loading}
            startIcon={!loading && <Save size={20} />}
            size="large"
            sx={{
              flex: 1,
              backgroundColor: '#1348e8',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#0f3bc7'
              },
              '&.Mui-disabled': {
                backgroundColor: '#1348e850'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </Button>
          
          <Link href="/admin/users" className="no-underline flex-1">
            <Button
              variant="outlined"
              size="large"
              sx={{
                width: '100%',
                borderColor: '#1348e8',
                color: '#1348e8',
                '&:hover': {
                  borderColor: '#0f3bc7',
                  backgroundColor: '#1348e810'
                }
              }}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}


// 'use client';

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
//   MapPin
// } from 'lucide-react';
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
//       toast.error('Please review and complete all required fields.');
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
//     <div className="p-4 md:p-6 max-w-5xl mx-auto">
//       {/* HEADER */}
//       {loading && <div className="fixed inset-0 z-[9999]">
//           <Loader message={"Creating..."} />
//         </div>}
//       <div className="flex items-center gap-4 mb-6">
//         <Link href="/admin/users" className="no-underline">
//           <Button 
//             variant="outlined" 
//             sx={{ 
//               minWidth: 'auto', 
//               p: 1.5,
//               borderColor: '#1348e8',
//               color: '#1348e8',
//               '&:hover': {
//                 borderColor: '#0f3bc7',
//                 backgroundColor: '#1348e810'
//               }
//             }}
//           >
//             <ArrowLeft size={20} />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-2xl md:text-3xl font-semibold  text-gray-900">
//             Create New User
//           </h1>
//           <p className="text-sm text-gray-600 mt-1">
//             Add a new admin or RTC to the system
//           </p>
//         </div>
//       </div>

//       {/* FORM */}
//       <form onSubmit={handleSubmit} className="flex flex-col gap-6">
//         {/* BASIC INFORMATION */}
//         <Card className="p-6 border border-blue-100">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Basic Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <TextField
//               label="Full Name"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               error={errors.name}
//               placeholder="John Doe"
//               required
//               fullWidth
//               startIcon={<User size={20} className="text-blue-600" />}
//             />
//             <TextField
//               label="Email Address"
//               type="email"
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               error={errors.email}
//               placeholder="john@mptourism.gov.in"
//               required
//               fullWidth
//               startIcon={<Mail size={20} className="text-blue-600" />}
//             />
//             <TextField
//               label="Phone Number"
//               type="tel"
//               value={formData.phone}
//               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//               error={errors.phone}
//               placeholder="9876543210"
//               required
//               fullWidth
//               startIcon={<Phone size={20} className="text-blue-600" />}
//             />
//             <SelectField
//               label="Role"
//               value={formData.role}
//               onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//               options={roleOptions}
//               required
//               fullWidth
//             />
//           </div>
//         </Card>

//         {/* EMPLOYEE INFORMATION */}
//         <Card className="p-6 border border-blue-100">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Employee Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <TextField
//               label="Employee ID"
//               value={formData.employeeId}
//               onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//               placeholder="EMP001"
//               fullWidth
//               startIcon={<Briefcase size={20} className="text-blue-600" />}
//             />
//             <TextField
//               label="Designation"
//               value={formData.designation}
//               onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//               placeholder="Regional Coordinator"
//               fullWidth
//             />
//           </div>
//         </Card>

//         {/* SECURITY */}
//         <Card className="p-6 border border-blue-100">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Security
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <TextField
//               label="Password"
//               type="password"
//               value={formData.password}
//               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//               error={errors.password}
//               placeholder="Minimum 8 characters"
//               required
//               fullWidth
//               startIcon={<Lock size={20} className="text-blue-600" />}
//             />
//             <TextField
//               label="Confirm Password"
//               type="password"
//               value={formData.confirmPassword}
//               onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//               error={errors.confirmPassword}
//               placeholder="Re-enter password"
//               required
//               fullWidth
//               startIcon={<Lock size={20} className="text-blue-600" />}
//             />
//           </div>
//         </Card>

//         {/* ASSIGNED DISTRICTS (FOR RTC) */}
//         {formData.role === 'rtc' && (
//           <Card className="p-6 border border-blue-100">
//             <div className="flex items-center gap-2 mb-4">
//               <MapPin size={20} className="text-blue-600" />
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Assigned Districts
//               </h2>
//               <span className="text-red-500">*</span>
//             </div>
            
//             <div className="max-h-96 overflow-y-auto bg-blue-50 p-4 rounded-lg border border-blue-100">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
//                 {districts.map((district) => (
//                   <label
//                     key={district._id}
//                     className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors ${
//                       formData.assignedDistricts.includes(district._id)
//                         ? 'border-blue-600 bg-blue-50'
//                         : 'border-gray-300 bg-white hover:border-blue-400'
//                     }`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={formData.assignedDistricts.includes(district._id)}
//                       onChange={() => handleDistrictToggle(district._id)}
//                       className="text-blue-600 focus:ring-blue-500"
//                     />
//                     <span className={`text-sm ${
//                       formData.assignedDistricts.includes(district._id)
//                         ? 'text-blue-600 font-semibold'
//                         : 'text-gray-700'
//                     }`}>
//                       {district.name}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>
            
//             {errors.assignedDistricts && (
//               <p className="text-red-600 text-sm mt-2">{errors.assignedDistricts}</p>
//             )}
            
//             <p className="text-blue-600 text-sm font-medium mt-3">
//               Selected: {formData.assignedDistricts.length} district(s)
//             </p>
//           </Card>
//         )}

//         {/* SUBMIT BUTTONS */}
//         <div className="flex flex-col sm:flex-row gap-4">
//           <Button
//             type="submit"
//             disabled={loading}
//             startIcon={!loading && <Save size={20} />}
//             size="large"
//             sx={{
//               flex: 1,
//               backgroundColor: '#1348e8',
//               color: 'white',
//               fontWeight: 600,
//               '&:hover': {
//                 backgroundColor: '#0f3bc7'
//               },
//               '&.Mui-disabled': {
//                 backgroundColor: '#1348e850'
//               }
//             }}
//           >
//             {loading ? 'Creating...' : 'Create User'}
//           </Button>
          
//           <Link href="/admin/users" className="no-underline flex-1">
//             <Button
//               variant="outlined"
//               size="large"
//               sx={{
//                 width: '100%',
//                 borderColor: '#1348e8',
//                 color: '#1348e8',
//                 '&:hover': {
//                   borderColor: '#0f3bc7',
//                   backgroundColor: '#1348e810'
//                 }
//               }}
//             >
//               Cancel
//             </Button>
//           </Link>
//         </div>
//       </form>
//     </div>
//   );
// }


// 'use client';

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
// import Loader from '@/components/ui/Loader';
// import Button from '@/components/ui/Button';
// import Card from '@/components/ui/Card';
// import TextField from '@/components/ui/TextField';
// import SelectField from '@/components/ui/SelectField';
// import StatCard from '@/components/ui/StatCard';
// import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
//       toast.error('Please review and complete all required fields.');
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
//     <div className="page-container">
//       {/* HEADER */}
//       <div className="header-container">
//         <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//           <Button variant="outlined" className="back-button">
//             <ArrowLeft size={20} color="#1348e8" />
//           </Button>
//         </Link>
//         <div className="header-content">
//           <h1 className="page-title">Create New User</h1>
//           <p className="page-subtitle">Add a new admin or RTC to the system</p>
//         </div>
//       </div>

//       {/* FORM */}
//       <form onSubmit={handleSubmit} className="form-container flex flex-col gap-5">
//         {/* BASIC INFORMATION */}
//         <Card className="form-section">
//           <h2 className="section-title">Basic Information</h2>
//           <div className="form-grid">
//             <div className="form-field">
//               <TextField
//                 label="Full Name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 error={errors.name}
//                 placeholder="John Doe"
//                 required
//                 startIcon={<User size={20} color="#1348e8" />}
//               />
//             </div>
//             <div className="form-field">
//               <TextField
//                 label="Email Address"
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 error={errors.email}
//                 placeholder="john@mptourism.gov.in"
//                 required
//                 startIcon={<Mail size={20} color="#1348e8" />}
//               />
//             </div>
//             <div className="form-field">
//               <TextField
//                 label="Phone Number"
//                 type="tel"
//                 value={formData.phone}
//                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                 error={errors.phone}
//                 placeholder="9876543210"
//                 required
//                 startIcon={<Phone size={20} color="#1348e8" />}
//               />
//             </div>
//             <div className="form-field">
//               <SelectField
//                 label="Role"
//                 value={formData.role}
//                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                 options={roleOptions}
//                 required
//               />
//             </div>
//           </div>
//         </Card>

//         {/* EMPLOYEE INFORMATION */}
//         <Card className="form-section">
//           <h2 className="section-title">Employee Information</h2>
//           <div className="form-grid">
//             <div className="form-field">
//               <TextField
//                 label="Employee ID"
//                 value={formData.employeeId}
//                 onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                 placeholder="EMP001"
//                 startIcon={<Briefcase size={20} color="#1348e8" />}
//               />
//             </div>
//             <div className="form-field">
//               <TextField
//                 label="Designation"
//                 value={formData.designation}
//                 onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                 placeholder="Regional Coordinator"
//               />
//             </div>
//           </div>
//         </Card>

//         {/* SECURITY */}
//         <Card className="form-section">
//           <h2 className="section-title">Security</h2>
//           <div className="form-grid">
//             <div className="form-field">
//               <TextField
//                 label="Password"
//                 type="password"
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 error={errors.password}
//                 placeholder="Minimum 8 characters"
//                 required
//                 startIcon={<Lock size={20} color="#1348e8" />}
//               />
//             </div>
//             <div className="form-field">
//               <TextField
//                 label="Confirm Password"
//                 type="password"
//                 value={formData.confirmPassword}
//                 onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                 error={errors.confirmPassword}
//                 placeholder="Re-enter password"
//                 required
//                 startIcon={<Lock size={20} color="#1348e8" />}
//               />
//             </div>
//           </div>
//         </Card>

//         {/* ASSIGNED DISTRICTS (FOR RTC) */}
//         {formData.role === 'rtc' && (
//           <Card className="form-section">
//             <div className="section-header">
//               <MapPin size={20} color="#1348e8" />
//               <h2 className="section-title">Assigned Districts</h2>
//               <span className="required-asterisk">*</span>
//             </div>
//             <div className="districts-container">
//               <div className="districts-grid">
//                 {districts.map((district) => (
//                   <div className="district-checkbox-item" key={district._id}>
//                     <label className={`district-checkbox-label ${formData.assignedDistricts.includes(district._id) ? 'checked' : ''}`}>
//                       <input
//                         type="checkbox"
//                         checked={formData.assignedDistricts.includes(district._id)}
//                         onChange={() => handleDistrictToggle(district._id)}
//                         className="district-checkbox"
//                       />
//                       {district.name}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             {errors.assignedDistricts && (
//               <span className="error-text">{errors.assignedDistricts}</span>
//             )}
//             <p className="selected-count">
//               Selected: {formData.assignedDistricts.length} district(s)
//             </p>
//           </Card>
//         )}

//         {/* SUBMIT BUTTONS */}
//         <div className="button-container">
//           <Button
//             type="submit"
//             disabled={loading}
//             startIcon={loading ? <Loader /> : <Save size={20} />}
//             size="large"
//             className="submit-button"
//             style={{
//               backgroundColor: '#1348e8',
//               borderColor: '#1348e8'
//             }}
//           >
//             {loading ? 'Creating...' : 'Create User'}
//           </Button>
//           <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               size="large"
//               className="cancel-button"
//               style={{
//                 borderColor: '#1348e8',
//                 color: '#1348e8'
//               }}
//             >
//               Cancel
//             </Button>
//           </Link>
//         </div>
//       </form>

//       <style jsx>{`
//         .page-container {
//           padding: 16px 24px;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }

//         .header-container {
//           display: flex;
//           align-items: center;
//           gap: 16px;
//           margin-bottom: 32px;
//           text-align: left;
//           width: 100%;
//           max-width: 1000px;
//         }

//         .back-button {
//           min-width: auto;
//           padding: 12px;
//           border-color: #1348e8;
//           color: #1348e8;
//         }

//         .header-content {
//           flex: 1;
//         }

//         .page-title {
//           font-size: 2rem;
//           font-weight: 700;
//           color: #333;
//           margin: 0;
//         }

//         .page-subtitle {
//           font-size: 0.875rem;
//           color: #666;
//           margin-top: 4px;
//           margin-bottom: 0;
//         }

//         .form-container {
//           max-width: 1000px;
//           width: 100%;
//         }

//         .form-section {
//           margin-bottom: 24px;
//           border: 1px solid #1348e820;
//           padding: 24px;
//         }

//         .section-title {
//           font-size: 1.25rem;
//           font-weight: 600;
//           margin-bottom: 16px;
//           color: #333;
//         }

//         .form-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
//           gap: 24px;
//           margin-top: 8px;
//         }

//         .form-field {
//           width: 100%;
//         }

//         .section-header {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 16px;
//         }

//         .required-asterisk {
//           color: #ff0000;
//         }

//         .districts-container {
//           max-height: 400px;
//           overflow-y: auto;
//           background-color: #1348e805;
//           padding: 16px;
//           border-radius: 8px;
//         }

//         .districts-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 8px;
//         }

//         .district-checkbox-item {
//           width: 100%;
//         }

//         .district-checkbox-label {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           background-color: white;
//           margin: 0;
//           padding: 8px 12px;
//           border-radius: 4px;
//           border: 1px solid #1348e820;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .district-checkbox-label:hover {
//           border-color: #1348e8;
//           background-color: #1348e810;
//         }

//         .district-checkbox-label.checked {
//           border-color: #1348e8;
//         }

//         .district-checkbox {
//           margin: 0;
//         }

//         .error-text {
//           color: #ff0000;
//           font-size: 0.875rem;
//           margin-top: 8px;
//           display: block;
//         }

//         .selected-count {
//           color: #1348e8;
//           font-size: 0.875rem;
//           margin-top: 16px;
//         }

//         .button-container {
//           display: flex;
//           gap: 16px;
//         }

//         .submit-button {
//           background-color: #1348e8;
//           border-color: #1348e8;
//         }

//         .submit-button:hover {
//           background-color: #0f3bc7;
//           border-color: #0f3bc7;
//         }

//         .cancel-button {
//           border-color: #1348e8;
//           color: #1348e8;
//         }

//         .cancel-button:hover {
//           border-color: #0f3bc7;
//           background-color: #1348e810;
//           color: #0f3bc7;
//         }

//         @media (max-width: 768px) {
//           .page-container {
//             padding: 16px;
//           }

//           .page-title {
//             font-size: 1.5rem;
//           }

//           .page-subtitle {
//             font-size: 0.8rem;
//           }

//           .form-grid {
//             grid-template-columns: 1fr;
//           }

//           .districts-grid {
//             grid-template-columns: 1fr;
//           }

//           .button-container {
//             flex-direction: column;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// 'use client'
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
//       toast.error('Please review and complete all required fields.');
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
//     <Box sx={{ p: { xs: 2, md: 3},display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     }}>
//       {/* HEADER */}
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 , textAlign: 'left', width: '100%', maxWidth: 1000}}>
//         <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//           <Button variant="outlined" sx={{ minWidth: 'auto', p: 1.5, borderColor: '#144ae9', color: '#144ae9' }}>
//             <ArrowLeft size={20} color="#144ae9" />
//           </Button>
//         </Link>
//      <Box>
//   <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
//     Create New User
//   </Typography>
//   <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//     Add a new admin or RTC to the system
//   </Typography>
// </Box>
//       </Box>

//       {/* FORM */}
//       <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1000 }}>
//         {/* BASIC INFORMATION */}
//         <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
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
//                 startIcon={<User size={20} color="#144ae9" />}
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
//                 startIcon={<Mail size={20} color="#144ae9" />}
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
//                 startIcon={<Phone size={20} color="#144ae9" />}
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
//         <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
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
//                 startIcon={<Briefcase size={20} color="#144ae9" />}
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
//         <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
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
//                 startIcon={<Lock size={20} color="#144ae9" />}
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
//                 startIcon={<Lock size={20} color="#144ae9" />}
//               />
//             </Grid>
//           </Grid>
//         </Card>

//         {/* ASSIGNED DISTRICTS (FOR RTC) */}
//         {formData.role === 'rtc' && (
//           <Card sx={{ mb: 3, border: '1px solid #144ae920' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
//               <MapPin size={20} color="#144ae9" />
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
//               bgcolor: '#144ae905',
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
//                           sx={{
//                             color: '#144ae9',
//                             '&.Mui-checked': {
//                               color: '#144ae9',
//                             },
//                           }}
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
//                           ? '#144ae9' 
//                           : '#144ae920',
//                         '&:hover': {
//                           borderColor: '#144ae9',
//                           bgcolor: '#144ae910'
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
//             <Typography variant="body2" color="#144ae9" sx={{ mt: 2 }}>
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
//             sx={{
//               backgroundColor: '#144ae9',
//               '&:hover': {
//                 backgroundColor: '#0d3ec7'
//               }
//             }}
//           >
//             {loading ? 'Creating...' : 'Create User'}
//           </Button>
//           <Link href="/admin/users" style={{ textDecoration: 'none' }}>
//             <Button 
//               variant="outlined" 
//               size="large"
//               sx={{
//                 borderColor: '#144ae9',
//                 color: '#144ae9',
//                 '&:hover': {
//                   borderColor: '#0d3ec7',
//                   backgroundColor: '#144ae910'
//                 }
//               }}
//             >
//               Cancel
//             </Button>
//           </Link>
//         </Box>
//       </Box>
//     </Box>
//   );
// }


// 'use client'
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