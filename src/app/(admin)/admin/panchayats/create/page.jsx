'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { createPanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
import { fetchDistricts } from "@/redux/slices/districtSlice.js"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Stack,
  Container
} from '@mui/material'
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import Loader from "@/components/ui/Loader"

export default function CreatePanchayatPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { loading, error, success } = useSelector((state) => state.panchayat)
  const { districts } = useSelector((state) => state.district)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    district: "",
    block: "",
    coordinates: { lat: "", lng: "" },
    establishmentYear: "",
    historicalBackground: "",
    population: "",
    localArt: "",
    localCuisine: "",
    traditions: "",
    status: "pending",
  })

  useEffect(() => {
    dispatch(fetchDistricts({ limit: 100 }))
  }, [])

  useEffect(() => {
    if (success) {
      toast.success("Panchayat created successfully!")
      dispatch(clearSuccess())
      router.push("/admin/panchayats")
    }
    if (error) {
      toast.error(error.message || "Something went wrong")
      dispatch(clearError())
    }
  }, [success, error])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes("coordinates")) {
      const key = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [key]: parseFloat(value) || value },
      }))
    } else {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: name === "population" || name === "establishmentYear" 
          ? parseInt(value) || value 
          : value 
      }))
    }
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.district || !formData.block || !formData.coordinates.lat || !formData.coordinates.lng) {
      toast.error("Please fill all required fields")
      return
    }

    const submitData = {
      ...formData,
      coordinates: {
        lat: parseFloat(formData.coordinates.lat),
        lng: parseFloat(formData.coordinates.lng)
      },
      population: formData.population ? parseInt(formData.population) : undefined,
      establishmentYear: formData.establishmentYear ? parseInt(formData.establishmentYear) : undefined
    }

    try {
      await dispatch(createPanchayat(submitData)).unwrap()
    } catch (err) {
      console.error(err)
    }
  }

  const districtOptions = [
    { value: "", label: "Select a district" },
    ...districts.map((district) => ({
      value: district._id,
      label: district.name
    }))
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "verified", label: "Verified" }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 4,
        maxWidth: '1000px',
        mx: 'auto'
      }}>
        <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
          <Button 
            variant="outlined" 
            sx={{ 
              minWidth: 'auto', 
              p: 1.5,
              borderColor: '#144ae9',
              color: '#144ae9',
              '&:hover': {
                borderColor: '#0d3ec7',
                backgroundColor: '#144ae910'
              }
            }}
          >
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Create New Panchayat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Add a new gram panchayat to the system
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
        <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  Basic Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Panchayat Name"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g., Gram Panchayat..."
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="auto-generated-slug"
                      InputProps={{
                        readOnly: true,
                      }}
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input': {
                          backgroundColor: '#144ae905',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  Location Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <SelectField
                      label="District"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      options={districtOptions}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Block"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      placeholder="e.g., Indore Block"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Latitude"
                      name="coordinates.lat"
                      type="number"
                      value={formData.coordinates.lat}
                      onChange={handleChange}
                      placeholder="e.g., 22.7196"
                      inputProps={{ step: "0.0001" }}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Longitude"
                      name="coordinates.lng"
                      type="number"
                      value={formData.coordinates.lng}
                      onChange={handleChange}
                      placeholder="e.g., 75.8577"
                      inputProps={{ step: "0.0001" }}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  Detailed Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Population"
                      name="population"
                      type="number"
                      value={formData.population}
                      onChange={handleChange}
                      placeholder="e.g., 5000"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Establishment Year"
                      name="establishmentYear"
                      type="number"
                      value={formData.establishmentYear}
                      onChange={handleChange}
                      placeholder="e.g., 1952"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Historical Background"
                      name="historicalBackground"
                      value={formData.historicalBackground}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      placeholder="Write about the historical significance..."
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Local Art"
                      name="localArt"
                      value={formData.localArt}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Traditional art forms..."
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Local Cuisine"
                      name="localCuisine"
                      value={formData.localCuisine}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Traditional dishes and cuisine..."
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Traditions"
                      name="traditions"
                      value={formData.traditions}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Cultural traditions..."
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  Status
                </Typography>
                <SelectField
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                  fullWidth
                />
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                pt: 3, 
                borderTop: '1px solid #144ae920',
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
                <Button
                  type="submit"
                  disabled={loading}
                  startIcon={loading ? <Loader size={20} /> : <Plus size={20} />}
                  size="large"
                  sx={{ 
                    flex: 1,
                    backgroundColor: '#144ae9',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#0d3ec7'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#144ae950'
                    }
                  }}
                >
                  {loading ? 'Creating...' : 'Create Panchayat'}
                </Button>
                <Link href="/admin/panchayats" style={{ textDecoration: 'none', flex: 1 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      width: '100%',
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
            </Stack>
          </Box>
        </Card>
      </Box>
    </Container>
  )
}// 'use client'
// import { useEffect, useState } from "react"
// import { useDispatch, useSelector } from "react-redux"
// import { createPanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
// import { fetchDistricts } from "@/redux/slices/districtSlice.js"
// import { toast } from "react-toastify"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import { ArrowLeft, Plus } from "lucide-react"
// import {
//   Box,
//   Typography,
//   Grid,
//   Stack,
//   Container
// } from '@mui/material'

// // Import your custom components
// import Button from "@/components/ui/Button"
// import Card from "@/components/ui/Card"
// import TextField from "@/components/ui/TextField"
// import SelectField from "@/components/ui/SelectField"
// import Loader from "@/components/ui/Loader"

// export default function CreatePanchayatPage() {
//   const router = useRouter()
//   const dispatch = useDispatch()
//   const { loading, error, success } = useSelector((state) => state.panchayat)
//   const { districts } = useSelector((state) => state.district)

//   const [formData, setFormData] = useState({
//     name: "",
//     slug: "",
//     district: "",
//     block: "",
//     coordinates: { lat: "", lng: "" },
//     establishmentYear: "",
//     historicalBackground: "",
//     population: "",
//     // religiousPlaces: "",
//     // waterBodies: "",
//     localArt: "",
//     localCuisine: "",
//     traditions: "",
//     status: "pending",
//   })

//   // FETCH DISTRICTS
//   useEffect(() => {
//     dispatch(fetchDistricts({ limit: 100 }))
//   }, [])

//   // HANDLE SUCCESS/ERROR
//   useEffect(() => {
//     if (success) {
//       toast.success("Panchayat created successfully!")
//       dispatch(clearSuccess())
//       router.push("/admin/panchayats")
//     }
//     if (error) {
//       toast.error(error.message || "Something went wrong")
//       dispatch(clearError())
//     }
//   }, [success, error])

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     if (name.includes("coordinates")) {
//       const key = name.split(".")[1]
//       setFormData((prev) => ({
//         ...prev,
//         coordinates: { ...prev.coordinates, [key]: value },
//       }))
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }))
//     }
//   }

//   const generateSlug = (name) => {
//     return name
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-")
//   }

//   const handleNameChange = (e) => {
//     const name = e.target.value
//     setFormData((prev) => ({
//       ...prev,
//       name,
//       slug: generateSlug(name),
//     }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     if (
//       !formData.name ||
//       !formData.district ||
//       !formData.block ||
//       !formData.coordinates.lat ||
//       !formData.coordinates.lng
//     ) {
//       toast.error("Please fill all required fields")
//       return
//     }

//     try {
//       await dispatch(createPanchayat(formData)).unwrap()
//     } catch (err) {
//       console.error(err)
//     }
//   }

//   const districtOptions = [
//     { value: "", label: "Select a district" },
//     ...districts.map((district) => ({
//       value: district._id,
//       label: district.name
//     }))
//   ]

//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "pending", label: "Pending" },
//     { value: "verified", label: "Verified" }
//   ]

//   return (
//     <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
//       {/* HEADER */}
//       <Box sx={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         gap: 2, 
//         mb: 4,
//         maxWidth: '1000px',
//         mx: 'auto'
//       }}>
//         <Link href="/admin/panchayats" style={{ textDecoration: 'none' }}>
//           <Button 
//             variant="outlined" 
//             sx={{ 
//               minWidth: 'auto', 
//               p: 1.5,
//               borderColor: '#144ae9',
//               color: '#144ae9',
//               '&:hover': {
//                 borderColor: '#0d3ec7',
//                 backgroundColor: '#144ae910'
//               }
//             }}
//           >
//             <ArrowLeft size={20} />
//           </Button>
//         </Link>
//         <Box>
//           <Typography variant="h4" fontWeight="bold" color="text.primary">
//             Create New Panchayat
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
//             Add a new gram panchayat to the system
//           </Typography>
//         </Box>
//       </Box>

//       {/* FORM */}
//       <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
//         <Card sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
//           <Box component="form" onSubmit={handleSubmit}>
//             <Stack spacing={4}>
//               {/* BASIC INFO */}
//               <Box>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
//                   Basic Information
//                 </Typography>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Panchayat Name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleNameChange}
//                       placeholder="e.g., Gram Panchayat..."
//                       required
//                       fullWidth
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Slug (Auto-generated)"
//                       name="slug"
//                       value={formData.slug}
//                       onChange={handleChange}
//                       placeholder="auto-generated-slug"
//                       InputProps={{
//                         readOnly: true,
//                       }}
//                       fullWidth
//                       sx={{
//                         '& .MuiInputBase-input': {
//                           backgroundColor: '#144ae905',
//                         }
//                       }}
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>

//               {/* LOCATION INFO */}
//               <Box>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
//                   Location Information
//                 </Typography>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={6}>
//                     <SelectField
//                       label="District"
//                       name="district"
//                       value={formData.district}
//                       onChange={handleChange}
//                       options={districtOptions}
//                       required
//                       fullWidth
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Block"
//                       name="block"
//                       value={formData.block}
//                       onChange={handleChange}
//                       placeholder="e.g., Indore Block"
//                       required
//                       fullWidth
//                     />
//                   </Grid>

//                   {/* COORDINATES */}
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Latitude"
//                       name="coordinates.lat"
//                       type="number"
//                       value={formData.coordinates.lat}
//                       onChange={handleChange}
//                       placeholder="e.g., 22.7196"
//                       inputProps={{ step: "0.0001" }}
//                       required
//                       fullWidth
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Longitude"
//                       name="coordinates.lng"
//                       type="number"
//                       value={formData.coordinates.lng}
//                       onChange={handleChange}
//                       placeholder="e.g., 75.8577"
//                       inputProps={{ step: "0.0001" }}
//                       required
//                       fullWidth
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>

//               {/* DETAILED INFO */}
//               <Box>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
//                   Detailed Information
//                 </Typography>
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Population"
//                       name="population"
//                       type="number"
//                       value={formData.population}
//                       onChange={handleChange}
//                       placeholder="e.g., 5000"
//                       fullWidth
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Establishment Year"
//                       name="establishmentYear"
//                       type="number"
//                       value={formData.establishmentYear}
//                       onChange={handleChange}
//                       placeholder="e.g., 1952"
//                       fullWidth
//                     />
//                   </Grid>


//                   <Grid item xs={12}>
//                     <TextField
//                       label="Historical Background"
//                       name="historicalBackground"
//                       value={formData.historicalBackground}
//                       onChange={handleChange}
//                       multiline
//                       rows={4}
//                       placeholder="Write about the historical significance..."
//                       fullWidth
//                     />
//                   </Grid>

//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Local Art"
//                       name="localArt"
//                       value={formData.localArt}
//                       onChange={handleChange}
//                       multiline
//                       rows={3}
//                       placeholder="Traditional art forms..."
//                       fullWidth
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       label="Local Cuisine"
//                       name="localCuisine"
//                       value={formData.localCuisine}
//                       onChange={handleChange}
//                       multiline
//                       rows={3}
//                       placeholder="Traditional dishes..."
//                       fullWidth
//                     />
//                   </Grid>

//                   <Grid item xs={12}>
//                     <TextField
//                       label="Traditions"
//                       name="traditions"
//                       value={formData.traditions}
//                       onChange={handleChange}
//                       multiline
//                       rows={3}
//                       placeholder="Cultural traditions..."
//                       fullWidth
//                     />
//                   </Grid>
//                 </Grid>
//               </Box>

//               {/* STATUS */}
//               <Box>
//                 <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
//                   Status
//                 </Typography>
//                 <SelectField
//                   label="Status"
//                   name="status"
//                   value={formData.status}
//                   onChange={handleChange}
//                   options={statusOptions}
//                   fullWidth
//                 />
//               </Box>

//               {/* SUBMIT BUTTONS */}
//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: 2, 
//                 pt: 3, 
//                 borderTop: '1px solid #144ae920',
//                 flexDirection: { xs: 'column', sm: 'row' }
//               }}>
//                 <Button
//                   type="submit"
//                   disabled={loading}
//                   startIcon={loading ? <Loader size={20} /> : <Plus size={20} />}
//                   size="large"
//                   sx={{ 
//                     flex: 1,
//                     backgroundColor: '#144ae9',
//                     color: 'white',
//                     '&:hover': {
//                       backgroundColor: '#0d3ec7'
//                     },
//                     '&.Mui-disabled': {
//                       backgroundColor: '#144ae950'
//                     }
//                   }}
//                 >
//                   {loading ? 'Creating...' : 'Create Panchayat'}
//                 </Button>
//                 <Link href="/admin/panchayats" style={{ textDecoration: 'none', flex: 1 }}>
//                   <Button
//                     variant="outlined"
//                     size="large"
//                     sx={{ 
//                       width: '100%',
//                       borderColor: '#144ae9',
//                       color: '#144ae9',
//                       '&:hover': {
//                         borderColor: '#0d3ec7',
//                         backgroundColor: '#144ae910'
//                       }
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                 </Link>
//               </Box>
//             </Stack>
//           </Box>
//         </Card>
//       </Box>
//     </Container>
//   )
// }