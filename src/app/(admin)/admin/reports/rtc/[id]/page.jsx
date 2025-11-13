'use client'

import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { fetchAdminById, updateAdmin, updateAdminStatus, clearError, clearSuccess } from '@/redux/slices/adminSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Shield,
  Activity
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
];

export default function RTCDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedAdmin: rtc, loading, error, success } = useSelector((state) => state.admin);

  const [editMode, setEditMode] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      dispatch(fetchAdminById(params.id));
    }
  }, [dispatch, params.id]);

  useEffect(() => {
    if (rtc) {
      setFormData({
        name: rtc.name || '',
        email: rtc.email || '',
        phone: rtc.phone || '',
        status: rtc.status || 'active'
      });
    }
  }, [rtc]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully');
      dispatch(clearSuccess());
      setEditMode(false);
      setSaving(false);
      if (params.id) {
        dispatch(fetchAdminById(params.id));
      }
    }
  }, [success, dispatch, params.id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await dispatch(updateAdmin({ 
        id: params.id, 
        adminData: formData 
      })).unwrap();
    } catch (error) {
      console.error('Update failed:', error);
      setSaving(false);
    }
  }, [formData, params.id, dispatch]);

  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      await dispatch(updateAdminStatus({ 
        id: params.id, 
        status: newStatus 
      })).unwrap();
      setStatusDialog(false);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  }, [params.id, dispatch]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'inactive':
        return { backgroundColor: '#6b7280', color: 'white' };
      case 'suspended':
        return { backgroundColor: '#ef4444', color: 'white' };
      default:
        return { backgroundColor: '#f59e0b', color: 'white' };
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={18} />;
      case 'inactive':
        return <Clock size={18} />;
      case 'suspended':
        return <XCircle size={18} />;
      default:
        return <Clock size={18} />;
    }
  }, []);

  if (loading && !rtc) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Loader />
      </Box>
    );
  }

  if (!rtc) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            RTC not found
          </Typography>
          <Link href="/admin/rtc" style={{ textDecoration: 'none' }}>
            <Button sx={{ mt: 2 }}>Back to RTC List</Button>
          </Link>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 2, md: 3 }, maxWidth: 1200, margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: { xs: 3, sm: 4 }, 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/rtc" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outlined" 
              sx={{ 
                minWidth: 'auto', 
                p: { xs: 1, sm: 1.5 },
                borderColor: '#144ae9',
                color: '#144ae9',
                '&:hover': {
                  borderColor: '#0d3ec7',
                  backgroundColor: '#144ae910'
                }
              }}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </Button>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '2rem' } }}>
              RTC Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              View and manage RTC information
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          {!editMode ? (
            <>
              <Button
                startIcon={<Activity size={16} />}
                onClick={() => setStatusDialog(true)}
                variant="outlined"
                fullWidth={false}
                sx={{
                  borderColor: '#144ae9',
                  color: '#144ae9',
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': {
                    borderColor: '#0d3ec7',
                    backgroundColor: '#144ae910'
                  }
                }}
              >
                Change Status
              </Button>
              <Button
                startIcon={<Edit size={16} />}
                onClick={() => setEditMode(true)}
                fullWidth={false}
                sx={{
                  backgroundColor: '#144ae9',
                  color: 'white',
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': { backgroundColor: '#0d3ec7' }
                }}
              >
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={saving ? null : <Save size={16} />}
                onClick={handleSave}
                disabled={saving}
                fullWidth={false}
                sx={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': { backgroundColor: '#059669' }
                }}
              >
                {saving ? <Loader /> : 'Save'}
              </Button>
              <Button
                startIcon={<X size={16} />}
                onClick={() => setEditMode(false)}
                variant="outlined"
                fullWidth={false}
                sx={{
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  flex: { xs: 1, sm: 'unset' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': {
                    borderColor: '#374151',
                    backgroundColor: '#6b728010'
                  }
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* PROFILE CARD */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', textAlign: 'center' }}>
            <Avatar 
              src={rtc.avatar} 
              sx={{ 
                width: { xs: 80, sm: 100 }, 
                height: { xs: 80, sm: 100 }, 
                margin: '0 auto',
                mb: 2,
                backgroundColor: '#144ae9',
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              {rtc.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              {rtc.name}
            </Typography>

            <Chip
              icon={getStatusIcon(rtc.status)}
              label={rtc.status}
              sx={{
                ...getStatusColor(rtc.status),
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                mb: 2,
                textTransform: 'capitalize'
              }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Shield size={18} color="#144ae9" className="sm:w-5 sm:h-5" />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Role
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                    Rural Tourism Coordinator
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Calendar size={18} color="#144ae9" className="sm:w-5 sm:h-5" />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Joined
                  </Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}>
                    {new Date(rtc.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* DETAILS CARD */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {editMode ? 'Edit Information' : 'Contact Information'}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editMode}
                  startIcon={<User size={18} color="#144ae9" />}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email Address"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editMode}
                  type="email"
                  startIcon={<Mail size={18} color="#144ae9" />}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editMode}
                  startIcon={<Phone size={18} color="#144ae9" />}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  backgroundColor: '#144ae905', 
                  borderRadius: 2,
                  border: '1px solid #144ae920'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <MapPin size={18} color="#144ae9" className="sm:w-5 sm:h-5" />
                    <Typography variant="body1" fontWeight={600} sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Assigned District
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="#144ae9" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    {rtc.district?.name || 'Not assigned'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Primary coverage area
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* ACTIVITY STATS */}
          <Card sx={{ p: { xs: 2, sm: 3 }, border: '1px solid #144ae920', mt: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Activity Statistics
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: '#144ae905', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="#144ae9" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {rtc.stats?.panchayats || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Panchayats
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: '#10b98105', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="#10b981" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {rtc.stats?.media || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Media
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: '#f59e0b05', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="#f59e0b" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {rtc.stats?.reports || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Reports
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, backgroundColor: '#8b5cf605', borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight={700} color="#8b5cf6" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {rtc.stats?.updates || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Updates
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* STATUS CHANGE DIALOG */}
      <Dialog 
        open={statusDialog} 
        onClose={() => setStatusDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2, m: 2 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Change RTC Status
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Select new status for {rtc.name}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                variant={rtc.status === option.value ? 'contained' : 'outlined'}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: { xs: '0.85rem', sm: '1rem' },
                  ...(rtc.status === option.value ? {
                    backgroundColor: '#144ae9',
                    '&:hover': { backgroundColor: '#0d3ec7' }
                  } : {
                    borderColor: '#144ae920',
                    color: 'text.primary',
                    '&:hover': { borderColor: '#144ae9', backgroundColor: '#144ae910' }
                  })
                }}
              >
                {option.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => setStatusDialog(false)}
            sx={{
              color: '#6b7280',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}