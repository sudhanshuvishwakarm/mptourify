'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { fetchContactById, updateContactStatus, deleteContact, clearError, clearSuccess } from '@/redux/slices/contactSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Box,
  Typography,
  Grid,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  CalendarToday,
  CheckCircle,
  Cancel,
  Delete,
  Description,
  Person
} from '@mui/icons-material';

// Import your custom components
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Loader from '@/components/ui/Loader';

export default function ContactDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { selectedContact, loading, error, success } = useSelector((state) => state.contact);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // LOAD DATA ONLY ONCE
  useEffect(() => {
    if (params.id && !dataLoaded) {
      dispatch(fetchContactById(params.id));
      setDataLoaded(true);
    }
  }, [params.id, dataLoaded, dispatch]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());
      
      // Reload data after update
      if (!deleteConfirm) {
        dispatch(fetchContactById(params.id));
      } else {
        // Navigate to list after delete
        router.push('/admin/contacts');
      }
    }
    if (error) {
      toast.error(error.message || 'Failed to perform action');
      dispatch(clearError());
    }
  }, [success, error]);

  const handleStatusToggle = () => {
    if (selectedContact) {
      const newStatus = selectedContact.status === 'new' ? 'resolved' : 'new';
      dispatch(updateContactStatus({ id: selectedContact._id, status: newStatus }));
    }
  };

  const handleDelete = () => {
    if (selectedContact) {
      dispatch(deleteContact(selectedContact._id));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !selectedContact) {
    return (
        <Loader />
    );
  }

  if (!selectedContact) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Contact message not found
        </Typography>
        <Link href="/admin/contacts" style={{ textDecoration: 'none' }}>
          <Button variant="text" sx={{ mt: 2 }}>
            Back to Contacts
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/admin/contacts" style={{ textDecoration: 'none' }}>
            <IconButton sx={{ color: '#144ae9', p: 1.5 }}>
              <ArrowBack />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Contact Details
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage contact message
            </Typography>
          </Box>
        </Box>

        {/* ACTION BUTTONS */}
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => setDeleteConfirm(true)}
            variant="outlined"
            color="error"
            startIcon={<Delete />}
          >
            Delete Message
          </Button>
        </Stack>
      </Box>

      {/* MAIN CONTENT - ROW WISE LAYOUT */}
      <Stack spacing={3}>
        {/* USER INFO CARD */}
        <Card>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#144ae9',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mx: { xs: 'auto', md: 0 },
                    mb: 2
                  }}
                >
                  {selectedContact.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {selectedContact.name}
                </Typography>
                <Chip
                  icon={selectedContact.status === 'new' ? <Cancel /> : <CheckCircle />}
                  label={selectedContact.status === 'new' ? 'New Message' : 'Resolved'}
                  sx={{
                    backgroundColor: selectedContact.status === 'new' ? '#ff6b35' : '#10b981',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    px: 2,
                    py: 1
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Email sx={{ fontSize: 24, color: '#144ae9' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email Address
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ wordBreak: 'break-all' }}>
                        {selectedContact.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {selectedContact.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Phone sx={{ fontSize: 24, color: '#144ae9' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Phone Number
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedContact.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CalendarToday sx={{ fontSize: 24, color: '#144ae9' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Submitted On
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatDate(selectedContact.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {selectedContact.respondedAt && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <CheckCircle sx={{ fontSize: 24, color: '#10b981' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Resolved On
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {formatDate(selectedContact.respondedAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* MESSAGE CONTENT CARD */}
        <Card>
          <Stack spacing={4}>
            {/* SUBJECT AND STATUS TOGGLE */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Description sx={{ color: 'text.secondary' }} />
                  <Typography variant="body1" fontWeight="medium" color="text.secondary">
                    Subject
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {selectedContact.subject}
                </Typography>
              </Box>

              {/* STATUS TOGGLE BUTTON */}
              <Button
                onClick={handleStatusToggle}
                disabled={loading}
                variant={selectedContact.status === 'new' ? 'contained' : 'outlined'}
                startIcon={selectedContact.status === 'new' ? <CheckCircle /> : <Cancel />}
                sx={{
                  backgroundColor: selectedContact.status === 'new' ? '#10b981' : 'transparent',
                  color: selectedContact.status === 'new' ? 'white' : '#ff6b35',
                  borderColor: selectedContact.status === 'new' ? '#10b981' : '#ff6b35',
                  '&:hover': {
                    backgroundColor: selectedContact.status === 'new' ? '#0da271' : '#ff6b35',
                    color: selectedContact.status === 'new' ? 'white' : 'white',
                  }
                }}
              >
                {selectedContact.status === 'new' ? 'Mark as Resolved' : 'Mark as New'}
              </Button>
            </Box>

            <Divider />

            {/* MESSAGE CONTENT */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Description sx={{ color: 'text.secondary' }} />
                <Typography variant="h6" fontWeight="medium" color="text.secondary">
                  Message Content
                </Typography>
              </Box>
              <Card
                elevation={0}
                sx={{
                  backgroundColor: 'grey.50',
                  p: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1" color="text.primary" sx={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}>
                  {selectedContact.message}
                </Typography>
              </Card>
            </Box>

            {/* QUICK RESPONSE SECTION */}
            <Box sx={{ pt: 2 }}>
              <Card
                elevation={0}
                sx={{
                  backgroundColor: '#144ae910',
                  border: '2px solid',
                  borderColor: '#144ae920',
                  p: 3,
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Email sx={{ fontSize: 28, color: '#144ae9', flexShrink: 0, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="#144ae9" gutterBottom>
                      Quick Response
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      Send a quick email response to {selectedContact.name}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Email />}
                      href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}&body=Dear ${selectedContact.name},%0D%0A%0D%0A`}
                      component="a"
                      sx={{
                        backgroundColor: '#144ae9',
                        '&:hover': {
                          backgroundColor: '#0d3ec7'
                        }
                      }}
                    >
                      Send Email Reply
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Stack>
        </Card>

        {/* MESSAGE METADATA */}
        <Card>
          <Typography variant="h6" fontWeight="bold" color="text.primary" gutterBottom>
            Message Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message ID
                </Typography>
                <Typography variant="body2" fontFamily="monospace" color="text.primary" sx={{ 
                  wordBreak: 'break-all',
                  backgroundColor: 'grey.100',
                  p: 1,
                  borderRadius: 1
                }}>
                  {selectedContact._id}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status
                </Typography>
                <Chip
                  label={selectedContact.status === 'new' ? 'New' : 'Resolved'}
                  color={selectedContact.status === 'new' ? 'warning' : 'success'}
                  size="medium"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message Type
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="text.primary">
                  Contact Form
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Character Count
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="text.primary">
                  {selectedContact.message?.length || 0} characters
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Stack>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Contact Message"
        message={`Are you sure you want to delete this contact message from ${selectedContact.name}? This action cannot be undone.`}
        confirmText="Delete Message"
        cancelText="Keep Message"
        confirmColor="error"
        icon={<Delete />}
      />
    </Box>
  );
}