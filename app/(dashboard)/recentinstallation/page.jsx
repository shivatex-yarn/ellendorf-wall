'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Star, Image as ImageIcon, Video, Trash2, User, Calendar,
  Loader2, AlertCircle, ChevronLeft, ChevronRight, Sparkles,
  Quote, Heart, Award, MessageSquare, ExternalLink, X, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../layout/authcontent.jsx';

export default function TestimonialsList() {
  const { user, loadingUser } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const itemsPerPage = 4;

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/testimonials`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTestimonials(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingUser && user) fetchTestimonials();
  }, [user, loadingUser]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial permanently?')) return;
    try {
      setDeletingId(id);
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE}/api/testimonials/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Testimonial deleted');
      setTestimonials(prev => prev.filter(t => t.id !== id));
      setSelectedTestimonial(null);
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= (rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const paginated = testimonials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading || loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin mb-6 mx-auto" />
          <p className="text-2xl font-light text-blue-700">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            color: '#374151',
            border: '1px solid #e5e7eb'
          }
        }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-30 rounded-full"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-blue-400 ml-4" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Customer Testimonials
          </h1>
          
          <p className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto">
            Stories of excellence from our valued customers
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-sm text-blue-600">{testimonials.length} Reviews</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-blue-600">Premium Quality</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
              <Star className="w-4 h-4 text-green-500" />
              <span className="text-sm text-blue-600">100% Satisfaction</span>
            </div>
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-600/10 blur-xl rounded-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 mb-6">
                  <AlertCircle className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Testimonials Yet</h3>
                <p className="text-slate-500">Start collecting customer stories to see them here</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {paginated.map((t, index) => (
                <div
                  key={t.id}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-2xl">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200/50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-20 rounded-full"></div>
                            <div className="relative w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">
                              {t.customer?.name || 'Anonymous Customer'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(t.rating)}
                              <span className="text-sm text-slate-500">{t.rating}.0</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(t.createdAt)}
                          </div>
                          {t.title && (
                            <p className="text-blue-600 text-sm mt-2 italic">{t.title}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-6">
                        <Quote className="w-8 h-8 text-blue-500/50 mb-4" />
                        <p className="text-slate-700 leading-relaxed line-clamp-3">
                          {t.content}
                        </p>
                      </div>

                      {/* Media Preview */}
                      {(t.photos?.length > 0 || t.videos?.length > 0) && (
                        <div className="flex gap-3 mb-6">
                          {t.photos?.slice(0, 2).map((p, idx) => (
                            <div key={p.id} className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-lg"></div>
                              <img
                                src={p.imageUrl}
                                alt="Preview"
                                className="w-16 h-16 rounded-lg object-cover relative border border-slate-200"
                              />
                              {idx === 1 && t.photos.length > 2 && (
                                <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                                  <span className="text-xs text-white">+{t.photos.length - 2}</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {t.videos?.slice(0, 1).map((v, idx) => (
                            <div key={v.id} className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-lg"></div>
                              <div className="w-16 h-16 rounded-lg bg-blue-50 border border-slate-200 flex items-center justify-center relative">
                                <Video className="w-6 h-6 text-blue-600" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            <span>{t.photos?.length || 0} photos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            <span>{t.videos?.length || 0} videos</span>
                          </div>
                        </div>
                        <div 
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer"
                          onClick={() => setSelectedTestimonial(t)}
                        >
                          <span>Read Full Story</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 mb-8">
                <div className="text-slate-600">
                  Showing <span className="font-semibold text-blue-600">{(currentPage - 1) * itemsPerPage + 1}</span>–<span className="font-semibold text-blue-600">{Math.min(currentPage * itemsPerPage, testimonials.length)}</span> of <span className="font-semibold text-blue-600">{testimonials.length}</span> testimonials
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          className={`rounded-xl w-10 h-10 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                              : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Right Side Modal */}
        {selectedTestimonial && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setSelectedTestimonial(null)}
            />
            
            {/* Slide-in Modal from Right */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 z-50">
              <div className="h-full bg-white shadow-2xl overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-br from-white to-blue-50 border-b border-slate-200/50 px-6 py-4 z-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md opacity-20 rounded-full"></div>
                        <div className="relative w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {selectedTestimonial.customer?.name || 'Anonymous Customer'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(selectedTestimonial.rating)}
                          <span className="text-sm text-slate-500">{selectedTestimonial.rating}.0</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedTestimonial(null)}
                      variant="ghost"
                      size="icon"
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {selectedTestimonial.title && (
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-blue-600 italic">{selectedTestimonial.title}</h3>
                      <div className="flex items-center gap-4 mt-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(selectedTestimonial.createdAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          <span>{selectedTestimonial.photos?.length || 0} photos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4" />
                          <span>{selectedTestimonial.videos?.length || 0} videos</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="mb-8">
                    <Quote className="w-10 h-10 text-blue-500/50 mb-4" />
                    <p className="text-slate-700 text-lg leading-relaxed">
                      {selectedTestimonial.content}
                    </p>
                  </div>

                  {/* Photos */}
                  {selectedTestimonial.photos?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6" /> Photos ({selectedTestimonial.photos.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedTestimonial.photos.map((p) => (
                          <a
                            key={p.id}
                            href={p.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <div className="relative overflow-hidden rounded-xl border border-slate-200">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 group-hover:opacity-0 transition-opacity z-10"></div>
                              <img
                                src={p.imageUrl}
                                alt="Installation"
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {selectedTestimonial.videos?.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Video className="w-6 h-6" /> Videos ({selectedTestimonial.videos.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {selectedTestimonial.videos.map((v) => (
                          <div key={v.id} className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 rounded-2xl"></div>
                            <video
                              controls
                              className="w-full rounded-2xl shadow-xl border border-slate-200 relative"
                              preload="metadata"
                            >
                              <source src={v.videoUrl} type="video/mp4" />
                            </video>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {['superadmin', 'admin'].includes(user?.role) && (
                    <div className="mt-8 pt-8 border-t border-slate-200/50">
                      <Button
                        onClick={() => handleDelete(selectedTestimonial.id)}
                        disabled={deletingId === selectedTestimonial.id}
                        variant="destructive"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-5"
                      >
                        {deletingId === selectedTestimonial.id ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Deleting Testimonial...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5 mr-3" />
                            Delete Testimonial
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}