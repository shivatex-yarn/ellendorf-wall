'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Star, Image as ImageIcon, Video, Trash2, User, Calendar,
  Loader2, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from '../../layout/authcontent.jsx';

export default function TestimonialsList() {
  const { user, loadingUser } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    } catch (err) {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`w-5 h-5 ${i <= (rating || 0) ? 'text-blue-500 fill-blue-500' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  const totalPages = Math.ceil(testimonials.length / itemsPerPage);
  const paginated = testimonials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading || loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex items-center justify-center sm:ml-64">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white mb-6 md:mb-8 shadow-2xl">
            <User className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight">Customer Testimonials</h1>
          <p className="text-gray-600 mt-3 md:mt-4 text-base md:text-lg">Hear from our satisfied customers</p>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex justify-center">
            <Card className="p-10 md:p-16 lg:p-20 text-center border-0 shadow-2xl rounded-3xl w-full max-w-xl md:max-w-2xl">
              <AlertCircle className="w-20 h-20 md:w-24 md:h-24 text-gray-400 mx-auto mb-6" />
              <p className="text-xl md:text-2xl text-gray-500 font-medium">No testimonials yet</p>
              <p className="text-gray-400 mt-2 text-sm md:text-base">Start collecting customer stories!</p>
            </Card>
          </div>
        ) : (
          <>
            <div className="space-y-10 md:space-y-12 lg:space-y-16">
              {paginated.map((t) => (
                <Card key={t.id} className="overflow-hidden border-0 shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-8 md:py-10 px-6 md:px-10">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-light flex items-center gap-3 md:gap-4">
                          <User className="w-8 h-8 md:w-10 md:h-10" />
                          {t.customer?.name || 'Anonymous Customer'}
                        </CardTitle>
                        {t.title && (
                          <p className="text-blue-100 text-lg md:text-xl mt-2 md:mt-3 italic font-medium">{t.title}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {renderStars(t.rating)}
                        <p className="text-blue-200 mt-3 md:mt-4 flex items-center gap-2 justify-end text-sm md:text-base">
                          <Calendar className="w-4 h-4 md:w-5 md:h-5" />
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-8 md:pt-10 lg:pt-12 pb-10 md:pb-12 px-6 md:px-10 lg:px-12">
                    <p className="text-gray-700 text-base md:text-lg lg:text-xl leading-relaxed italic text-center mb-10 md:mb-12 max-w-4xl mx-auto">
                      {t.content}
                    </p>

                    {/* Photos */}
                    {t.photos?.length > 0 && (
                      <div className="mb-10 md:mb-12">
                        <h3 className="text-xl md:text-2xl font-semibold text-blue-800 mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3">
                          <ImageIcon className="w-6 h-6 md:w-8 md:h-8" /> Photos ({t.photos.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                          {t.photos.map((p) => (
                            <a key={p.id} href={p.imageUrl} target="_blank" rel="noopener noreferrer" className="block group">
                              <img
                                src={p.imageUrl}
                                alt="Installation"
                                className="w-full aspect-square md:aspect-[4/3] object-cover rounded-xl md:rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-blue-100"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {t.videos?.length > 0 && (
                      <div className="mb-10 md:mb-12">
                        <h3 className="text-xl md:text-2xl font-semibold text-blue-800 mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3">
                          <Video className="w-6 h-6 md:w-8 md:h-8" /> Videos ({t.videos.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                          {t.videos.map((v) => (
                            <video
                              key={v.id}
                              controls
                              className="w-full rounded-xl md:rounded-2xl shadow-2xl border-4 border-blue-100 aspect-video"
                              preload="metadata"
                            >
                              <source src={v.videoUrl} type="video/mp4" />
                            </video>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    {['superadmin', 'admin'].includes(user?.role) && (
                      <div className="flex justify-end pt-6 md:pt-8 border-t border-gray-200">
                        <Button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          variant="destructive"
                          size="lg"
                          className="px-6 md:px-8 py-4 md:py-5 text-base md:text-lg shadow-lg"
                        >
                          {deletingId === t.id ? (
                            <>Deleting...</>
                          ) : (
                            <>
                              <Trash2 className="w-5 h-5 mr-2" />
                              Delete Testimonial
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mt-12 md:mt-16">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 md:px-8 py-4 md:py-5"
                >
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </Button>

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="lg"
                      className={currentPage === page 
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0 shadow-lg px-4 md:px-6 py-3 md:py-4" 
                        : "border-blue-300 text-blue-700 hover:bg-blue-50 px-4 md:px-6 py-3 md:py-4"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="lg"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 md:px-8 py-4 md:py-5"
                >
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
            )}

            <p className="text-center mt-8 md:mt-10 text-gray-600 text-sm md:text-base lg:text-lg">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, testimonials.length)} of {testimonials.length} testimonials
            </p>
          </>
        )}
      </div>
    </div>
  );
}