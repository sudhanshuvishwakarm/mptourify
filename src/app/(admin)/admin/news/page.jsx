'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNews, deleteNews, clearError, clearSuccess } from '@/redux/slices/newsSlice';
import { toast } from 'react-toastify';
import Link from 'next/link';
import {
  Newspaper,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
} from '@mui/material';
import Loader from '@/components/ui/Loader';
import TextField from '@/components/ui/TextField';
import SelectField from '@/components/ui/SelectField';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function AdminNewsPage() {
  const dispatch = useDispatch();
  const { news, loading, error, success, totalNews, currentPage, totalPages } = useSelector((state) => state.news);

  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    featured: '',
    page: 1
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // INITIAL LOAD - ONLY ONCE
  useEffect(() => {
    if (!dataLoaded) {
      const params = { page: 1, limit: 20 };
      dispatch(fetchNews(params));
      setDataLoaded(true);
    }
  }, [dataLoaded, dispatch]);

  // HANDLE SUCCESS/ERROR
  useEffect(() => {
    if (success) {
      toast.success('Action completed successfully!');
      dispatch(clearSuccess());

      const params = { page: filters.page, limit: 20 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.featured) params.featured = filters.featured;
      dispatch(fetchNews(params));
    }
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearError());
    }
  }, [success, error]);

  const handleSearch = () => {
    const params = { page: 1, limit: 20 };
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.featured) params.featured = filters.featured;
    setFilters({ ...filters, page: 1 });
    dispatch(fetchNews(params));
  };

  const handleReset = () => {
    setFilters({ category: '', status: '', search: '', featured: '', page: 1 });
    dispatch(fetchNews({ page: 1, limit: 20 }));
  };

  const handlePageChange = (event, newPage) => {
    const params = { page: newPage, limit: 20 };
    if (filters.category) params.category = filters.category;
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.featured) params.featured = filters.featured;
    setFilters({ ...filters, page: newPage });
    dispatch(fetchNews(params));
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteNews(id)).unwrap();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'media_coverage': 'Media Coverage',
      'press_release': 'Press Release',
      'announcement': 'Announcement',
      'update': 'Update'
    };
    return labels[category] || category;
  };

  const getStatusColor = (status) => {
    const colors = {
      'published': { backgroundColor: '#10b981', color: 'white' },
      'draft': { backgroundColor: '#6b7280', color: 'white' },
    };
    return colors[status] || { backgroundColor: '#6b7280', color: 'white' };
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'media_coverage', label: 'Media Coverage' },
    { value: 'press_release', label: 'Press Release' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'update', label: 'Update' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
  ];

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
            <Newspaper size={32} color="#144ae9" />
            <Typography variant="h4" fontWeight={700} color="text.primary">
              News Management ({totalNews || 0})
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Manage news articles and press releases
          </Typography>
        </Box>
        <Link href="/admin/news/create" style={{ textDecoration: 'none' }}>
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
            Add News Article
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
        {/* STATS CARD */}
        {/* <Box sx={{ width: { xs: '100%', md: '20%' } }}>
          <Card sx={{ 
            p: 3, 
            border: '1px solid #144ae920', 
            height: '100%' 
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Articles
                </Typography>
                <Typography variant="h3" fontWeight={700} color="text.primary">
                  {totalNews || 0}
                </Typography>
              </Box>
              <Newspaper size={48} color="#144ae9" />
            </Box>
          </Card>
        </Box> */}

        {/* FILTERS CARD */}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title or content..."
                  startIcon={<Search size={20} color="#144ae9" />}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      height: { xs: '48px', sm: '56px' }
                    }
                  }}
                />
              </Box>

              {/* CATEGORY FILTER */}
              <Box sx={{
                width: { xs: '100%', sm: '180px', md: '180px' },
                display: 'flex',
                alignItems: 'center'
              }}>
                <SelectField
                  label="Category"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  options={categoryOptions}
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

      {/* NEWS TABLE */}
      <Card sx={{ border: '1px solid #144ae920' }}>
        {loading && !news.length ? (
          <Loader />
        ) : news.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Newspaper size={48} color="#144ae9" style={{ marginBottom: 16, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary">
              No news articles found
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: '#144ae905' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Article</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9' }}>Publish Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#144ae9', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {news.map((article) => (
                    <TableRow
                      key={article._id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: '#144ae905' }
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 64,
                            height: 64,
                            backgroundColor: '#144ae910',
                            borderRadius: 2,
                            overflow: 'hidden',
                            flexShrink: 0,
                            border: '1px solid #144ae920'
                          }}>
                            {article.featuredImage ? (
                              <img
                                src={article.featuredImage}
                                alt={article.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                              }}>
                                <Newspaper size={24} color="#144ae9" />
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color="text.primary"
                              noWrap
                            >
                              {article.title.split(' ').slice(0, 5).join(' ')}{article.title.split(' ').length > 5 ? '...' : ''}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ mt: 0.5 }}
                            >
                              {article.excerpt.split(' ').slice(0, 8).join(' ')}{article.excerpt.split(' ').length > 8 ? '...' : ''}
                            </Typography>

                            {article.featured && (
                              <Chip
                                label="⭐ Featured"
                                size="small"
                                sx={{
                                  mt: 1,
                                  backgroundColor: '#fbbf24',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategoryLabel(article.category)}
                          size="small"
                          icon={<Tag size={14} />}
                          sx={{
                            backgroundColor: '#144ae910',
                            color: '#144ae9',
                            border: '1px solid #144ae920',
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                          size="small"
                          icon={
                            article.status === 'published' ? <CheckCircle size={14} /> :

                              // article.status === 'scheduled' ? <Clock size={14} /> :
                              <XCircle size={14} />
                          }
                          sx={getStatusColor(article.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={16} color="#144ae9" />
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {formatDate(article.publishDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Link href={`/admin/news/${article._id}`} style={{ textDecoration: 'none' }}>
                            <IconButton
                              size="small"
                              sx={{
                                color: '#144ae9',
                                backgroundColor: '#144ae910',
                                '&:hover': {
                                  backgroundColor: '#144ae920'
                                }
                              }}
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Link>
                          <Link href={`/admin/news/${article._id}`} style={{ textDecoration: 'none' }}>
                            <IconButton
                              size="small"
                              sx={{
                                color: '#144ae9',
                                backgroundColor: '#144ae910',
                                '&:hover': {
                                  backgroundColor: '#144ae920'
                                }
                              }}
                            >
                              <Edit size={16} />
                            </IconButton>
                          </Link>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(article._id)}
                            sx={{
                              color: '#d32f2f',
                              backgroundColor: '#d32f2f10',
                              '&:hover': {
                                backgroundColor: '#d32f2f20'
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <Box sx={{
                p: 3,
                borderTop: '1px solid #144ae920',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing page <Typography component="span" fontWeight={600}>{currentPage}</Typography> of{' '}
                  <Typography component="span" fontWeight={600}>{totalPages}</Typography>
                </Typography>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#144ae9',
                      borderColor: '#144ae9',
                    },
                    '& .MuiPaginationItem-root.Mui-selected': {
                      backgroundColor: '#144ae9',
                      color: 'white',
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Card>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Delete News Article"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
        icon={<Trash2 size={24} color="#144ae9" />}
      />
    </Box>
  );
}