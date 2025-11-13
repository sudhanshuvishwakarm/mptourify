'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitContact, clearError, clearSuccess } from '@/redux/slices/contactSlice';
import { toast } from 'react-toastify';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  MessageSquare,
  User,
  AtSign,
  FileText,
  CheckCircle2,
  MapPinned,
  Clock,
  Globe
} from 'lucide-react';
import Loader from '@/components/ui/Loader';

export default function ContactPage() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.contact);

  const colors = {
    primary: '#138808',
    primaryDark: '#0A5C08',
    secondary: '#1E88E5',
    white: '#FFFFFF',
    bgColor: '#F8FDF7',
    black: '#2E3A3B',
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (success) {
      toast.success('Thank you! Your message has been sent successfully.');
      dispatch(clearSuccess());
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setErrors({});
    }
    if (error) {
      toast.error(error.message || 'Failed to send message. Please try again.');
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill the required fields.');
      return;
    }

    dispatch(submitContact(formData));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      content: 'Madhya Pradesh Tourism Board',
      subContent: 'Gangotri, T.T. Nagar, Bhopal - 462003'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 755 277 8383',
      subContent: 'Mon - Fri: 9:00 AM - 6:00 PM'
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@mptourism.com',
      // subContent: 'We reply within 24 hours'
    },
    {
      icon: Globe,
      title: 'Website',
      content: 'www.mptourify.com',
      subContent: 'Explore Madhya Pradesh'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgColor }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(45deg, ${colors.white} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 text-center">
          <MessageSquare className="mx-auto mb-4 text-white" size={48} />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            We’re Here to Help
          </h1>
          <p className="text-lg md:text-xl text-white opacity-90 max-w-2xl mx-auto">
            Have questions about Madhya Pradesh tourism? We're here to help you plan your perfect journey.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border-2 p-6 md:p-8" style={{ borderColor: colors.primary }}>
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: colors.black }}>
                  Send Us a Message
                </h2>
                <p className="opacity-70" style={{ color: colors.black }}>
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.black }}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.black }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                     className={`w-full pl-11 pr-4 py-3 border-2 rounded-md transition-all
    focus:outline-none focus:!border-[#0A5C08] ${
      errors.name ? 'border-red-500' : 'border-gray-300'
    }`}
                      style={{ 
                        ...(errors.name ? {} : { borderColor: colors.primary + '40' }),
                        outline: 'none'
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: colors.black }}>
                      Email Address *
                    </label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.black }} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                         className={`w-full pl-11 pr-4 py-3 border-2 rounded-md transition-all
    focus:outline-none focus:!border-[#0A5C08] ${
      errors.email ? 'border-red-500' : 'border-gray-300'
    }`}
                        style={{ 
                          ...(errors.email ? {} : { borderColor: colors.primary + '40' }),
                          outline: 'none'
                        }}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: colors.black }}>
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.black }} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3 border-2 rounded-md transition-all
    focus:outline-none focus:!border-[#0A5C08] ${
      errors.phone ? 'border-red-500' : 'border-gray-300'
    }`}
                        style={{ 
                          ...(errors.phone ? {} : { borderColor: colors.primary + '40' }),
                          outline: 'none'
                        }}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.black }}>
                    Subject *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.black }} />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-md transition-all
    focus:outline-none focus:!border-[#0A5C08] ${
      errors.subject ? 'border-red-500' : 'border-gray-300'
    }`}
                      style={{ 
                        ...(errors.subject ? {} : { borderColor: colors.primary + '40' }),
                        outline: 'none'
                      }}
                      placeholder="e.g. Feedback, Suggestion, Complaint "
                    />
                  </div>
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.black }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full pl-5 pr-4 py-3 border-2 rounded-md transition-all
    focus:outline-none focus:!border-[#0A5C08] ${
      errors.message ? 'border-red-500' : 'border-gray-300'
    }`}
                    style={{ 
                      ...(errors.message ? {} : { borderColor: colors.primary + '40' }),
                      outline: 'none'
                    }}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-md font-bold text-white text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <>
                     <Loader/>
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{ borderColor: colors.primary }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-md" style={{ backgroundColor: `${colors.primary}20` }}>
                      <Icon size={24} style={{ color: colors.primary }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1" style={{ color: colors.black }}>
                        {info.title}
                      </h3>
                      <p className="font-semibold mb-1" style={{ color: colors.primary }}>
                        {info.content}
                      </p>
                      <p className="text-sm font-semibold" style={{ color: colors.black }}>
                        {info.subContent}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Facts */}
            <div
              className="bg-white rounded-xl p-6 border-2"
              style={{ borderColor: colors.primary }}
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: colors.black }}>
               <div className="p-3 rounded-md" style={{ backgroundColor: `${colors.primary}20` }}>
                      <Clock size={24} style={{ color: colors.primary }} />
                    </div>
                Office Hours
              </h3>
              <div className="space-y-2 text-sm" style={{ color: colors.black }}>
                <div className="flex justify-between">
                  <span className="font-semibold">Monday - Friday</span>
                  <span className="font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Saturday</span>
                  <span className="font-semibold">10:00 AM - 4:00 PM</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="opacity-70">Sunday</span>
                  <span className="font-semibold">Closed</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          
        </div>

        {/* Map Section */}
        {/* <div className="mt-12">
          <div className="bg-white rounded-xl border-2 overflow-hidden" style={{ borderColor: colors.primary }}>
            <div className="p-6 border-b-2" style={{ borderColor: colors.primary + '40' }}>
              <h3 className="text-xl font-black flex items-center gap-2" style={{ color: colors.black }}>
                <MapPinned size={24} style={{ color: colors.primary }} />
                Find Us on Map
              </h3>
            </div>
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <p className="text-gray-500">Map integration placeholder - Add your preferred map service</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { submitContact, clearError, clearSuccess } from '@/redux/slices/contactSlice';
// import { toast } from 'react-toastify';
// import {
//   Mail,
//   Phone,
//   MapPin,
//   Send,
//   Loader2,
//   MessageSquare,
//   User,
//   AtSign,
//   FileText,
//   CheckCircle2,
//   MapPinned,
//   Clock,
//   Globe
// } from 'lucide-react';
// import Loader from '@/components/ui/Loader';

// export default function ContactPage() {
//   const dispatch = useDispatch();
//   const { loading, error, success } = useSelector((state) => state.contact);

//   const colors = {
//     saffron: '#F3902C',
//     green: '#339966',
//     skyBlue: '#33CCFF',
//     white: '#FFFFFF',
//     bgColor: '#FFF7EB',
//     darkGray: '#333333',
//     lightGray: '#F5F5F5'
//   };

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     subject: '',
//     message: ''
//   });

//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (success) {
//       toast.success('Thank you! Your message has been sent successfully.');
//       dispatch(clearSuccess());
//       setFormData({
//         name: '',
//         email: '',
//         phone: '',
//         subject: '',
//         message: ''
//       });
//       setErrors({});
//     }
//     if (error) {
//       toast.error(error.message || 'Failed to send message. Please try again.');
//       dispatch(clearError());
//     }
//   }, [success, error, dispatch]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = 'Name is required';
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Invalid email format';
//     }

//     if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
//       newErrors.phone = 'Invalid phone number (10 digits required)';
//     }

//     if (!formData.subject.trim()) {
//       newErrors.subject = 'Subject is required';
//     }

//     if (!formData.message.trim()) {
//       newErrors.message = 'Message is required';
//     } else if (formData.message.trim().length < 10) {
//       newErrors.message = 'Message must be at least 10 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!validateForm()) {
//       toast.error('Please fix all errors');
//       return;
//     }

//     dispatch(submitContact(formData));
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const contactInfo = [
//     {
//       icon: MapPin,
//       title: 'Visit Us',
//       content: 'Madhya Pradesh Tourism Board',
//       subContent: 'Gangotri, T.T. Nagar, Bhopal - 462003'
//     },
//     {
//       icon: Phone,
//       title: 'Call Us',
//       content: '+91 755 277 8383',
//       subContent: 'Mon - Fri: 9:00 AM - 6:00 PM'
//     },
//     {
//       icon: Mail,
//       title: 'Email Us',
//       content: 'info@mptourism.com',
//       subContent: 'We reply within 24 hours'
//     },
//     {
//       icon: Globe,
//       title: 'Website',
//       content: 'www.mptourism.com',
//       subContent: 'Explore Madhya Pradesh'
//     }
//   ];

//   return (
//     <div className="min-h-screen" style={{ backgroundColor: colors.bgColor }}>
//       {/* Hero Section */}
//       <div className="relative overflow-hidden" style={{ backgroundColor: colors.saffron }}>
//         <div className="absolute inset-0 opacity-10" style={{
//           backgroundImage: `linear-gradient(45deg, ${colors.white} 1px, transparent 1px)`,
//           backgroundSize: '30px 30px'
//         }} />
        
//         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
//           <MessageSquare className="mx-auto mb-4 text-white" size={48} />
//           <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
//             Get in Touch
//           </h1>
//           <p className="text-lg md:text-xl text-white opacity-90 max-w-2xl mx-auto">
//             Have questions about Madhya Pradesh tourism? We're here to help you plan your perfect journey.
//           </p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Contact Information Cards */}
//           <div className="lg:col-span-1 space-y-6">
//             {contactInfo.map((info, index) => {
//               const Icon = info.icon;
//               return (
//                 <div
//                   key={index}
//                   className="bg-white rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
//                   style={{ borderColor: colors.green }}
//                 >
//                   <div className="flex items-start gap-4">
//                     <div className="p-3 rounded-md" style={{ backgroundColor: `${colors.saffron}20` }}>
//                       <Icon size={24} style={{ color: colors.saffron }} />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-bold text-lg mb-1" style={{ color: colors.darkGray }}>
//                         {info.title}
//                       </h3>
//                       <p className="font-semibold mb-1" style={{ color: colors.green }}>
//                         {info.content}
//                       </p>
//                       <p className="text-sm opacity-70" style={{ color: colors.darkGray }}>
//                         {info.subContent}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {/* Quick Facts */}
//             <div
//               className="bg-white rounded-xl p-6 border-2"
//               style={{ borderColor: colors.skyBlue }}
//             >
//               <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: colors.darkGray }}>
//                 <Clock size={20} style={{ color: colors.skyBlue }} />
//                 Office Hours
//               </h3>
//               <div className="space-y-2 text-sm" style={{ color: colors.darkGray }}>
//                 <div className="flex justify-between">
//                   <span className="opacity-70">Monday - Friday</span>
//                   <span className="font-semibold">9:00 AM - 6:00 PM</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="opacity-70">Saturday</span>
//                   <span className="font-semibold">10:00 AM - 4:00 PM</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="opacity-70">Sunday</span>
//                   <span className="font-semibold">Closed</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Contact Form */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-xl border-2 p-6 md:p-8" style={{ borderColor: colors.green }}>
//               <div className="mb-6">
//                 <h2 className="text-2xl md:text-3xl font-black mb-2" style={{ color: colors.darkGray }}>
//                   Send Us a Message
//                 </h2>
//                 <p className="opacity-70" style={{ color: colors.darkGray }}>
//                   Fill out the form below and we'll get back to you as soon as possible.
//                 </p>
//               </div>

//               <form onSubmit={handleSubmit} className="space-y-6">
//                 {/* Name */}
//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: colors.darkGray }}>
//                     Full Name *
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.darkGray }} />
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className={`w-full pl-11 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-offset-2 transition-all ${
//                         errors.name ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       style={{ 
//                         ...(errors.name ? {} : { borderColor: colors.lightGray }),
//                         outline: 'none'
//                       }}
//                       placeholder="Enter your full name"
//                     />
//                   </div>
//                   {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//                 </div>

//                 {/* Email & Phone */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Email */}
//                   <div>
//                     <label className="block text-sm font-bold mb-2" style={{ color: colors.darkGray }}>
//                       Email Address *
//                     </label>
//                     <div className="relative">
//                       <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.darkGray }} />
//                       <input
//                         type="email"
//                         name="email"
//                         value={formData.email}
//                         onChange={handleChange}
//                         className={`w-full pl-11 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-offset-2 transition-all ${
//                           errors.email ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                         style={{ 
//                           ...(errors.email ? {} : { borderColor: colors.lightGray }),
//                           outline: 'none'
//                         }}
//                         placeholder="your@email.com"
//                       />
//                     </div>
//                     {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//                   </div>

//                   {/* Phone */}
//                   <div>
//                     <label className="block text-sm font-bold mb-2" style={{ color: colors.darkGray }}>
//                       Phone Number (Optional)
//                     </label>
//                     <div className="relative">
//                       <Phone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.darkGray }} />
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={formData.phone}
//                         onChange={handleChange}
//                         className={`w-full pl-11 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-offset-2 transition-all ${
//                           errors.phone ? 'border-red-500' : 'border-gray-300'
//                         }`}
//                         style={{ 
//                           ...(errors.phone ? {} : { borderColor: colors.lightGray }),
//                           outline: 'none'
//                         }}
//                         placeholder="10-digit mobile number"
//                       />
//                     </div>
//                     {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//                   </div>
//                 </div>

//                 {/* Subject */}
//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: colors.darkGray }}>
//                     Subject *
//                   </label>
//                   <div className="relative">
//                     <FileText className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={20} style={{ color: colors.darkGray }} />
//                     <input
//                       type="text"
//                       name="subject"
//                       value={formData.subject}
//                       onChange={handleChange}
//                       className={`w-full pl-11 pr-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-offset-2 transition-all ${
//                         errors.subject ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       style={{ 
//                         ...(errors.subject ? {} : { borderColor: colors.lightGray }),
//                         outline: 'none'
//                       }}
//                       placeholder="What is this about?"
//                     />
//                   </div>
//                   {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
//                 </div>

//                 {/* Message */}
//                 <div>
//                   <label className="block text-sm font-bold mb-2" style={{ color: colors.darkGray }}>
//                     Message *
//                   </label>
//                   <textarea
//                     name="message"
//                     value={formData.message}
//                     onChange={handleChange}
//                     rows={6}
//                     className={`w-full px-4 py-3 border-2 rounded-md focus:ring-2 focus:ring-offset-2 transition-all resize-none ${
//                       errors.message ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     style={{ 
//                       ...(errors.message ? {} : { borderColor: colors.lightGray }),
//                       outline: 'none'
//                     }}
//                     placeholder="Tell us more about your inquiry..."
//                   />
//                   {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full py-4 rounded-md font-bold text-white text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
//                   style={{ backgroundColor: colors.saffron }}
//                 >
//                   {loading ? (
//                     <>
//                      <Loader/>
//                     </>
//                   ) : (
//                     <>
//                       <Send size={24} />
//                       <span>Send Message</span>
//                     </>
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* Map Section */}
//         <div className="mt-12">
//           <div className="bg-white rounded-xl border-2 overflow-hidden" style={{ borderColor: colors.green }}>
//             <div className="p-6 border-b-2" style={{ borderColor: colors.lightGray }}>
//               <h3 className="text-xl font-black flex items-center gap-2" style={{ color: colors.darkGray }}>
//                 <MapPinned size={24} style={{ color: colors.saffron }} />
//                 Find Us on Map
//               </h3>
//             </div>
//             <div className="h-96 bg-gray-200 flex items-center justify-center">
//               <p className="text-gray-500">Map integration placeholder - Add your preferred map service</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }