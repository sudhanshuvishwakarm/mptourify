'use client'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function AdminLogin() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error, success, isAuthenticated } = useSelector((state) => state.admin);

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false);

  
  // HANDLE SUCCESS
  useEffect(() => {
    if (success) {
      dispatch(clearSuccess());
      router.push('/admin/dashboard');
    }
  }, [success, dispatch, router]);

  // HANDLE ERROR
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Login failed. Please try again.');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    dispatch(loginAdmin(credentials));
  };

  return (
    <div className="flex pt-5 sm:pt-0 sm:min-h-screen bg-gradient-to-br from-blue-50 to-white">
        {loading && (
        <div className="fixed inset-0 z-[9999]">
          <Loader message={"Signing in..."} />
        </div>
      )}
      {/* LEFT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4">
              <span className="text-white text-2xl font-bold">MP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              MP Tourify Admin
            </h1>
            <p className="text-gray-600">
              Madhya Pradesh Tourism Department
            </p>
          </div>

          {/* LOGIN CARD */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Sign in to Dashboard
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    disabled={loading}
                    placeholder="admin@mptourism.gov.in"
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-blue-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    disabled={loading}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-blue-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-blue-400 hover:text-blue-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div> */}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || !credentials.email || !credentials.password}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                
                  <span>Sign in to Dashboard</span>
              </button>
            </form>

            {/* INFO */}
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-600">
                Authorized access only. Contact system administrator for credentials.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      {/* <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
              <span className="text-6xl">🏛️</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Welcome to MP Tourify
            </h2>
            <p className="text-xl text-blue-100 max-w-md mx-auto">
              Digital documentation of every district and gram panchayat of Madhya Pradesh
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">52</div>
              <div className="text-sm text-blue-100">Districts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">23K+</div>
              <div className="text-sm text-blue-100">Panchayats</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-blue-100">Heritage Sites</div>
            </div>
          </div>
        </div>
      </div> */}<div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden min-h-[600px]">
  {/* Background Image with Overlay */}
  <div 
    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: 'url("/images/adminlogin.png")', 
    }}
  >
    {/* Dark Overlay for better text readability */}
    <div className="absolute inset-0 bg-blue-900/50 "></div>
  </div>

  {/* Content */}
  <div className="relative z-10 text-center text-white w-full max-w-md">
    {/* Logo/Badge */}
    <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
     
      <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
        Welcome to MP Tourify
      </h2>
      <p className="text-lg text-blue-100 leading-relaxed">
        Digital documentation of every district and gram panchayat of Madhya Pradesh
      </p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-4 mt-12">
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
        <div className="text-3xl font-bold text-white mb-1">52</div>
        <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Districts</div>
      </div>
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
        <div className="text-3xl font-bold text-white mb-1">23K+</div>
        <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Panchayats</div>
      </div>
      <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
        <div className="text-3xl font-bold text-white mb-1">500+</div>
        <div className="text-xs font-medium text-blue-100 uppercase tracking-wider">Heritage Sites</div>
      </div>
    </div>

    {/* Additional Feature Badges */}
    <div className="flex justify-center gap-3 mt-8">
      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30">
        🗺️ Interactive Maps
      </span>
      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30">
        📱 Digital Guide
      </span>
      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30">
        🏛️ Heritage
      </span>
    </div>
  </div>

  {/* Floating Elements */}
</div>
    </div>
  );
}



// 'use client'
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { toast } from 'react-toastify';
// import { loginAdmin, clearError, clearSuccess } from '@/redux/slices/adminSlice';
// import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function AdminLogin() {
//   const router = useRouter();
//   const dispatch = useDispatch();

//   const { loading, error, success, isAuthenticated } = useSelector((state) => state.admin);

//   const [credentials, setCredentials] = useState({
//     email: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

  
//   // HANDLE SUCCESS
//   useEffect(() => {
//     if (success) {
//       toast.success('Login successful! Redirecting...');
//       dispatch(clearSuccess());
//       router.push('/admin/dashboard');
//     }
//   }, [success, dispatch, router]);

//   // HANDLE ERROR
//   useEffect(() => {
//     if (error) {
//       toast.error(error.message || 'Login failed. Please try again.');
//       dispatch(clearError());
//     }
//   }, [error, dispatch]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!credentials.email || !credentials.password) {
//       toast.error('Please fill in all fields');
//       return;
//     }

//     // EMAIL VALIDATION
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(credentials.email)) {
//       toast.error('Please enter a valid email address');
//       return;
//     }

//     dispatch(loginAdmin(credentials));
//   };

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-white">
//       {/* LEFT SIDE - LOGIN FORM */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
//         <div className="w-full max-w-md">
//           {/* LOGO */}
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl mb-4">
//               <span className="text-white text-2xl font-bold">MP</span>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               MP Tourify Admin
//             </h1>
//             <p className="text-gray-600">
//               Madhya Pradesh Tourism Department
//             </p>
//           </div>

//           {/* LOGIN CARD */}
//           <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//             <h2 className="text-2xl font-semibold text-gray-800 mb-6">
//               Sign in to Dashboard
//             </h2>

//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* EMAIL */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Mail className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="email"
//                     name="email"
//                     type="email"
//                     value={credentials.email}
//                     onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//                     disabled={loading}
//                     placeholder="admin@mptourism.gov.in"
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
//                   />
//                 </div>
//               </div>

//               {/* PASSWORD */}
//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <Lock className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <input
//                     id="password"
//                     name="password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={credentials.password}
//                     onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//                     disabled={loading}
//                     placeholder="Enter your password"
//                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     ) : (
//                       <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* REMEMBER ME */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     checked={rememberMe}
//                     onChange={(e) => setRememberMe(e.target.checked)}
//                     disabled={loading}
//                     className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
//                     Remember me
//                   </label>
//                 </div>
//               </div>

//               {/* SUBMIT BUTTON */}
//               <button
//                 type="submit"
//                 disabled={loading || !credentials.email || !credentials.password}
//                 className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
//               >
//                 {loading ? (
//                   <>
//                     <Loader/>
//                   </>
//                 ) : (
//                   <span>Sign in to Dashboard</span>
//                 )}
//               </button>
//             </form>

//             {/* INFO */}
//             <div className="mt-6 text-center">
//               <p className="text-sm text-gray-600">
//                 Authorized access only. Contact system administrator for credentials.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE - IMAGE */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 items-center justify-center p-12 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
//         </div>
//         <div className="relative z-10 text-center text-white">
//           <div className="mb-8">
//             <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6">
//               <span className="text-6xl">🏛️</span>
//             </div>
//             <h2 className="text-4xl font-bold mb-4">
//               Welcome to MP Tourify
//             </h2>
//             <p className="text-xl text-green-100 max-w-md mx-auto">
//               Digital documentation of every district and gram panchayat of Madhya Pradesh
//             </p>
//           </div>
//           <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12">
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
//               <div className="text-3xl font-bold">52</div>
//               <div className="text-sm text-green-100">Districts</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
//               <div className="text-3xl font-bold">23K+</div>
//               <div className="text-sm text-green-100">Panchayats</div>
//             </div>
//             <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
//               <div className="text-3xl font-bold">500+</div>
//               <div className="text-sm text-green-100">Heritage Sites</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }