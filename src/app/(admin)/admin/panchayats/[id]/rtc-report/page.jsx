'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPanchayatById, addRTCReport, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
import { toast } from "react-toastify"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, MapPin, FileText, Calendar, User, MessageSquare } from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Stack,
  IconButton
} from '@mui/material'

// Import your custom components
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import TextField from "@/components/ui/TextField"
import Loader from "@/components/ui/Loader"

export default function RTCReportsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    coordinator: "",
    submissionDate: "",
    reportContent: "",
    achievements: "",
    challenges: "",
    recommendations: "",
  })

  // FETCH PANCHAYAT
  useEffect(() => {
    if (params.id) {
      dispatch(fetchPanchayatById(params.id))
    }
  }, [params.id])

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success("RTC Report added successfully!")
      dispatch(clearSuccess())
      setShowForm(false)
      setFormData({
        coordinator: "",
        submissionDate: "",
        reportContent: "",
        achievements: "",
        challenges: "",
        recommendations: "",
      })
      dispatch(fetchPanchayatById(params.id))
    }
    if (error) {
      toast.error(error.message || "Something went wrong")
      dispatch(clearError())
    }
  }, [success, error])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(addRTCReport({ id: params.id, reportData: formData })).unwrap()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
        <Loader />
    )
  }

  if (!selectedPanchayat) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <MapPin size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Panchayat not found
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href={`/admin/panchayats/${params.id}`} style={{ textDecoration: 'none' }}>
            <IconButton sx={{ color: '#144ae9', p: 1.5 }}>
              <ArrowLeft size={20} />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              RTC Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedPanchayat.name}
            </Typography>
          </Box>
        </Box>
        
        <Button
          onClick={() => setShowForm(!showForm)}
          startIcon={<Plus size={20} />} 
          sx={{ fontWeight: 'bold', backgroundColor: '#144ae9' }}
        >
          Add Report
        </Button>
      </Box>

      {/* ADD REPORT FORM */}
      {showForm && (
        <Card sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Add New RTC Report
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Coordinator"
                  name="coordinator"
                  value={formData.coordinator}
                  onChange={handleChange}
                  placeholder="Coordinator name or ID"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Submission Date"
                  name="submissionDate"
                  type="date"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Report Content"
                  name="reportContent"
                  value={formData.reportContent}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Main report content..."
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Key achievements..."
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Challenges"
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Challenges faced..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Recommendations"
                  name="recommendations"
                  value={formData.recommendations}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  placeholder="Recommendations for improvement..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, pt: 2, borderTop: '1px solid #144ae920' }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    startIcon={<Plus size={18} />}
                    sx={{ flex: 1, backgroundColor: '#144ae9', }}
                  >
                    Submit Report
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outlined"
                    sx={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}

      {/* REPORTS LIST */}
      <Card>
        {selectedPanchayat.rtcReport && selectedPanchayat.rtcReport.length > 0 ? (
          <Stack spacing={3} sx={{ p: 3 }}>
            {selectedPanchayat.rtcReport.map((report, index) => (
              <Card 
                key={index} 
                elevation={1}
                sx={{ 
                  p: 3,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: '#144ae9'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <User size={18} color="#144ae9" />
                      <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {report.coordinator?.name || "Unknown Coordinator"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={16} color="#144ae9" />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(report.submissionDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <MessageSquare size={16} color="#144ae9" />
                      <Typography variant="body2" fontWeight="bold" color="text.primary">
                        Report Content
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {report.reportContent}
                    </Typography>
                  </Box>

                  {report.achievements && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="#10b981" sx={{ mb: 0.5 }}>
                        ✓ Achievements
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.achievements}
                      </Typography>
                    </Box>
                  )}

                  {report.challenges && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="#f59e0b" sx={{ mb: 0.5 }}>
                        ⚠ Challenges
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.challenges}
                      </Typography>
                    </Box>
                  )}

                  {report.recommendations && (
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="#144ae9" sx={{ mb: 0.5 }}>
                        💡 Recommendations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.recommendations}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FileText size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No RTC reports yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start by creating the first RTC report for this panchayat
            </Typography>
            <Button
              onClick={() => setShowForm(true)}
              startIcon={<Plus size={20} />}
              sx={{ fontWeight: 'bold', backgroundColor: '#144ae9' }}
            >
              Create First Report
            </Button>
          </Box>
        )}
      </Card>

      {/* BACK LINK */}
      <Link
        href={`/admin/panchayats/${params.id}`}
        style={{ textDecoration: 'none', display: 'inline-block', marginTop: 16 }}
      >
        <Button
          variant="text"
          startIcon={<ArrowLeft size={16} />}
          sx={{ mt: 2 }}
        >
          Back to Panchayat Details
        </Button>
      </Link>
    </Box>
  )
}

// "use client"
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { fetchPanchayatById, addRTCReport, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { toast } from "react-toastify"
// import { useParams, useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Plus, Loader2, MapPin, FileText, Calendar, User, MessageSquare } from "lucide-react"
// import Loader from "@/components/ui/Loader"

// export default function RTCReportsPage() {
//   const params = useParams()
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { selectedPanchayat, loading, error, success } = useSelector((state) => state.panchayat)

//   const [showForm, setShowForm] = useState(false)
//   const [formData, setFormData] = useState({
//     coordinator: "",
//     submissionDate: "",
//     reportContent: "",
//     achievements: "",
//     challenges: "",
//     recommendations: "",
//   })

//   // FETCH PANCHAYAT
//   useEffect(() => {
//     if (params.id) {
//       dispatch(fetchPanchayatById(params.id))
//     }
//   }, [params.id])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("RTC Report added successfully!")
//       dispatch(clearSuccess())
//       setShowForm(false)
//       setFormData({
//         coordinator: "",
//         submissionDate: "",
//         reportContent: "",
//         achievements: "",
//         challenges: "",
//         recommendations: "",
//       })
//       dispatch(fetchPanchayatById(params.id))
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       await dispatch(addRTCReport({ id: params.id, reportData: formData })).unwrap()
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   if (loading) {
//     return (
//       <Loader/>
//     )
//   }

//   if (!selectedPanchayat) {
//     return (
//       <div className="text-center py-12">
//         <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//         <p className="text-gray-500">Panchayat not found</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
//             <ArrowLeft className="h-6 w-6 text-gray-600" />
//           </button>
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">RTC Reports</h1>
//             <p className="text-gray-600 mt-1">{selectedPanchayat.name}</p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//         >
//           <Plus className="h-5 w-5" />
//           Add Report
//         </button>
//       </div>

//       {/* ADD REPORT FORM */}
//       {showForm && (
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New RTC Report</h3>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Coordinator</label>
//                 <input
//                   type="text"
//                   name="coordinator"
//                   value={formData.coordinator}
//                   onChange={handleChange}
//                   placeholder="Coordinator name or ID"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date</label>
//                 <input
//                   type="date"
//                   name="submissionDate"
//                   value={formData.submissionDate}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Report Content</label>
//               <textarea
//                 name="reportContent"
//                 value={formData.reportContent}
//                 onChange={handleChange}
//                 rows={1}
//                 placeholder="Main report content..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Achievements</label>
//                 <textarea
//                   name="achievements"
//                   value={formData.achievements}
//                   onChange={handleChange}
//                   rows={1}
//                   placeholder="Key achievements..."
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Challenges</label>
//                 <textarea
//                   name="challenges"
//                   value={formData.challenges}
//                   onChange={handleChange}
//                   rows={1}
//                   placeholder="Challenges faced..."
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
//               <textarea
//                 name="recommendations"
//                 value={formData.recommendations}
//                 onChange={handleChange}
//                 rows={1}
//                 placeholder="Recommendations for improvement..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               />
//             </div>

//             <div className="flex gap-3 pt-4 border-t border-gray-200">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
//               >
//                 <Plus className="h-4 w-4" />
//                 Submit Report
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* REPORTS LIST */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         {selectedPanchayat.rtcReport && selectedPanchayat.rtcReport.length > 0 ? (
//           <div className="space-y-4">
//             {selectedPanchayat.rtcReport.map((report, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
//                 <div className="flex items-start justify-between mb-4">
//                   <div>
//                     <h4 className="font-semibold text-gray-900 flex items-center gap-2">
//                       <User className="h-4 w-4" />
//                       {report.coordinator?.name || "Unknown Coordinator"}
//                     </h4>
//                     <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
//                       <Calendar className="h-4 w-4" />
//                       {new Date(report.submissionDate).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   <div>
//                     <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
//                       <MessageSquare className="h-4 w-4" />
//                       Report Content
//                     </p>
//                     <p className="text-gray-600 text-sm mt-1">{report.reportContent}</p>
//                   </div>

//                   {report.achievements && (
//                     <div>
//                       <p className="text-sm font-medium text-green-700">✓ Achievements</p>
//                       <p className="text-gray-600 text-sm">{report.achievements}</p>
//                     </div>
//                   )}

//                   {report.challenges && (
//                     <div>
//                       <p className="text-sm font-medium text-yellow-700">⚠ Challenges</p>
//                       <p className="text-gray-600 text-sm">{report.challenges}</p>
//                     </div>
//                   )}

//                   {report.recommendations && (
//                     <div>
//                       <p className="text-sm font-medium text-blue-700">💡 Recommendations</p>
//                       <p className="text-gray-600 text-sm">{report.recommendations}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//             <p className="text-gray-500">No RTC reports yet</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Create First Report
//             </button>
//           </div>
//         )}
//       </div>

//       {/* BACK LINK */}
//       <Link
//         href={`/admin/panchayats/${params.id}`}
//         className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
//       >
//         <ArrowLeft className="h-4 w-4" />
//         Back to Panchayat
//       </Link>
//     </div>
//   )
// }
