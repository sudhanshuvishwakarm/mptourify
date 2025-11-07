'use client'
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchPanchayats, deletePanchayat, clearError, clearSuccess } from "@/redux/slices/panchayatSlice.js"
import { toast } from "react-toastify"
import Link from "next/link"
import { MapPin, Plus, Search, Filter, Trash2, Eye } from "lucide-react"
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'
import Loader from "@/components/ui/Loader"
import TextField from "@/components/ui/TextField"
import SelectField from "@/components/ui/SelectField"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

export default function AllPanchayatsPage() {
  const dispatch = useDispatch()
  const { panchayats, loading, error, success, totalPanchayats } = useSelector((state) => state.panchayat)

  const [filters, setFilters] = useState({
    status: "",
    block: "",
    search: "",
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // INITIAL LOAD
  useEffect(() => {
    dispatch(fetchPanchayats({ limit: 100 }))
  }, [])

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success("Action completed successfully!")
      dispatch(clearSuccess())
      handleSearch()
    }
    if (error) {
      toast.error(error.message || "Something went wrong")
      dispatch(clearError())
    }
  }, [success, error])

  const handleSearch = () => {
    const params = { limit: 100 }
    if (filters.status) params.status = filters.status
    if (filters.block) params.block = filters.block
    if (filters.search) params.search = filters.search
    dispatch(fetchPanchayats(params))
  }

  const handleReset = () => {
    setFilters({ status: "", block: "", search: "" })
    dispatch(fetchPanchayats({ limit: 100 }))
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deletePanchayat(id)).unwrap()
      setDeleteConfirm(null)
    } catch (err) {
      console.error(err)
    }
  }

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "verified", label: "Verified" },
    { value: "pending", label: "Pending" },
    { value: "draft", label: "Draft" }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return { backgroundColor: '#144ae9', color: 'white' }
      case "pending":
        return { backgroundColor: '#f59e0b', color: 'white' }
      default:
        return { backgroundColor: '#6b7280', color: 'white' }
    }
  }

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
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <MapPin size={32} color="#144ae9" />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Gram Panchayats ({totalPanchayats || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage all gram panchayats and their information
          </Typography>
        </Box>
        <Link href="/admin/panchayats/create" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<Plus size={20} />}
            sx={{
              backgroundColor: '#144ae9',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0d3ec7'
              }
            }}
          >
            Add Panchayat
          </Button>
        </Link>
      </Box>

      {/* STATS & FILTERS IN ONE ROW */}
      <Box sx={{
        display: 'flex',
        gap: 3,
        mb: 4,
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* FILTERS CARD - Full width since stats card is removed */}
        <Box sx={{ width: { xs: '100%', md: '100%' } }}>
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
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by panchayat name..."
                  startIcon={<Search size={20} color="#144ae9" />}
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

              {/* BLOCK FILTER */}
              <Box sx={{
                width: { xs: '100%', sm: '180px', md: '180px' },
                display: 'flex',
                alignItems: 'center'
              }}>
                <TextField
                  label="Block"
                  value={filters.block}
                  onChange={(e) => setFilters({ ...filters, block: e.target.value })}
                  placeholder="Filter by block..."
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
                    startIcon={<Filter size={18} />}
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

      {/* PANCHAYATS TABLE */}
      <Card sx={{ border: '1px solid #144ae920' }}>
        {loading ? (
          <Loader />
        ) : panchayats.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <MapPin size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              No panchayats found
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="panchayats table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#144ae905' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Block</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9', display: { xs: 'none', sm: 'table-cell' } }}>Population</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9', display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {panchayats.map((panchayat) => (
                  <TableRow
                    key={panchayat._id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { backgroundColor: '#144ae905' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{panchayat.name}</TableCell>
                    <TableCell>{panchayat.block}</TableCell>
                    <TableCell>
                      <Chip
                        label={panchayat.status}
                        size="small"
                        sx={getStatusColor(panchayat.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {panchayat.population?.toLocaleString() || "N/A"}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {new Date(panchayat.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Link href={`/admin/panchayats/${panchayat._id}`} style={{ textDecoration: 'none' }}>
                          <Button
                            size="small"
                            startIcon={<Eye size={16} />}
                            sx={{
                              backgroundColor: '#144ae910',
                              color: '#144ae9',
                              '&:hover': {
                                backgroundColor: '#144ae920'
                              }
                            }}
                          >
                            View
                          </Button>
                        </Link>
                        <Button
                          size="small"
                          startIcon={<Trash2 size={16} />}
                          onClick={() => setDeleteConfirm(panchayat._id)}
                          sx={{
                            backgroundColor: '#d32f2f10',
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: '#d32f2f20'
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete Panchayat"
        message="Are you sure you want to delete this panchayat? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
      />
    </Box>
  )
}