"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { 
  Loader2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Grid, 
  Filter, 
  Search, 
  List, 
  Download, 
  Eye, 
  LayoutGrid, 
  LayoutList, 
  Star,
  FileText
} from 'lucide-react';

export default function Wallpaper() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const cardsPerPage = viewMode === 'grid' ? 9 : 6;

  const quotes = [
    "Your walls deserve art, not just paint.",
    "Where luxury meets living.",
    "Design is a feeling you live in.",
    "Every room tells a story. Make yours unforgettable.",
    "Crafted for those who appreciate true elegance.",
  ];

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:4500/api/wallpaper');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const activeOnly = data.filter(w => w.status === 'active');
        setWallpapers(activeOnly || []);
      } catch (err) {
        setError('Unable to load collection. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallpapers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(wallpapers.map(w => w.category?.name).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [wallpapers]);

  const filteredWallpapers = useMemo(() => {
    let filtered = [...wallpapers];
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(w => w.category?.name === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w => 
        w.name?.toLowerCase().includes(query) ||
        w.productCode?.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query)
      );
    }
    
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case 'code':
        filtered.sort((a, b) => a.productCode?.localeCompare(b.productCode));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }
    
    return filtered;
  }, [wallpapers, selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredWallpapers.length / cardsPerPage);
  const paginated = filteredWallpapers.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => setCurrentPage(1), [selectedCategory, searchQuery, viewMode]);

  const handleImageDownload = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to add luxury watermark to image
  const addLuxuryWatermarkToImage = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        // Add STRONGER luxury watermark - Center position
        ctx.save();
        
        // Calculate center position
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // STRONGER Watermark background (larger & premium)
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(centerX - 380, centerY - 110, 760, 220);

        // Main luxury branding (single line)
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
        ctx.font = "bold 78px 'Times New Roman', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Subtle shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        // Brand text
        ctx.fillText(
          "ELLENDORF – Textile Wall Coverings",
          centerX,
          centerY
        );

        // Reset shadow before drawing lines
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Decorative luxury divider
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 220, centerY + 55);
        ctx.lineTo(centerX + 220, centerY + 55);
        ctx.stroke();

        // Sub branding
        ctx.font = "italic 32px 'Times New Roman', serif";
        ctx.fillText("Textile Wall Coverings", centerX, centerY + 35);
        
        // STRONGER Divider line
        ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY + 10);
        ctx.lineTo(centerX + 120, centerY + 10);
        ctx.stroke();
        
        // STRONGER Powered by text
        ctx.font = "italic 28px 'Times New Roman', serif";
        ctx.fillText("Premium Collection", centerX, centerY + 45);
        
        // Add subtle pattern overlay (more visible)
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(centerX + (i - 2.5) * 80, centerY, 50, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        
        // STRONGER corner accents
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 3;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.lineTo(120, 40);
        ctx.lineTo(40, 120);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(canvas.width - 40, 40);
        ctx.lineTo(canvas.width - 120, 40);
        ctx.lineTo(canvas.width - 40, 120);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(40, canvas.height - 40);
        ctx.lineTo(40, canvas.height - 120);
        ctx.lineTo(120, canvas.height - 40);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(canvas.width - 40, canvas.height - 40);
        ctx.lineTo(canvas.width - 40, canvas.height - 120);
        ctx.lineTo(canvas.width - 120, canvas.height - 40);
        ctx.stroke();
        
        ctx.restore();
        
        // Convert canvas to data URL with good quality
        const watermarkedImage = canvas.toDataURL('image/jpeg', 0.9);
        resolve(watermarkedImage);
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image for watermarking"));
      };
    });
  };

  const generatePDF = async (wallpaper) => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Get current timestamp
      const currentDate = new Date();
      const timestamp = currentDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      // Page 1: Luxury Cover Page
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Add decorative border
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(2);
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40);
      
      // Add title with luxury styling
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(48);
      doc.setFont("times", "bolditalic");
      doc.text("ELLENDORF", pageWidth / 2, 120, { align: "center" });
      
      // Add decorative underline
      doc.setDrawColor(200, 180, 150);
      doc.setLineWidth(4);
      doc.line(pageWidth / 2 - 140, 140, pageWidth / 2 + 140, 140);
      
      doc.setFontSize(32);
      doc.setFont("times", "italic");
      doc.text("Textile Wall Coverings", pageWidth / 2, 180, { align: "center" });
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "normal");
      doc.text("Premium Collection", pageWidth / 2, 220, { align: "center" });
      
      // Add decorative element
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(pageWidth / 2 - 200, 250, 400, 90, 10, 10, 'F');
      
      // Add product info inside decorative box
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text(`Design: ${wallpaper.name}`, pageWidth / 2, 285, { align: "center" });
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.text(`Product Code: ${wallpaper.productCode || "N/A"}`, pageWidth / 2, 320, { align: "center" });
      
      if (wallpaper.subCategory?.name) {
        doc.text(`Collection: ${wallpaper.subCategory.name}`, pageWidth / 2, 350, { align: "center" });
      }
      
      // Add decorative divider
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(1);
      doc.setLineDash([5, 5]);
      doc.line(50, 380, pageWidth - 50, 380);
      doc.setLineDash([]);
      
      // Add generated info
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(22);
      doc.setFont("times", "italic");
      doc.text("Generated on", pageWidth / 2, 420, { align: "center" });
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text(timestamp, pageWidth / 2, 450, { align: "center" });
      
      doc.setFontSize(16);
      doc.text("Premium Quality | Timeless Elegance | Exceptional Craftsmanship", pageWidth / 2, 490, { align: "center" });
      
      // Add decorative corner accents on cover page
      doc.setDrawColor(200, 180, 150);
      doc.setLineWidth(2);
      
      // Top-left corner
      doc.line(40, 40, 100, 40);
      doc.line(40, 40, 40, 100);
      
      // Top-right corner
      doc.line(pageWidth - 40, 40, pageWidth - 100, 40);
      doc.line(pageWidth - 40, 40, pageWidth - 40, 100);
      
      // Bottom-left corner
      doc.line(40, pageHeight - 40, 100, pageHeight - 40);
      doc.line(40, pageHeight - 40, 40, pageHeight - 100);
      
      // Bottom-right corner
      doc.line(pageWidth - 40, pageHeight - 40, pageWidth - 80, pageHeight - 40);
      doc.line(pageWidth - 40, pageHeight - 40, pageWidth - 40, pageHeight - 100);
      
      // Page 2: Watermarked Image Page
      doc.addPage();
      
      // Set white background for content pages
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      
      // Add thinner decorative border to content pages
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

      try {
        // Add luxury watermark directly to the image
        const watermarkedImage = await addLuxuryWatermarkToImage(wallpaper.imageUrl);
        const img = new Image();
        img.src = watermarkedImage;
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const imgRatio = img.width / img.height;
            
            // BIGGER image area - use more of the page
            const maxImageWidth = pageWidth - 40;
            const maxImageHeight = pageHeight - 160;
            
            let drawWidth, drawHeight;
            
            if (imgRatio > 1) {
              // Landscape image
              drawWidth = maxImageWidth;
              drawHeight = maxImageWidth / imgRatio;
            } else {
              // Portrait image
              drawHeight = maxImageHeight;
              drawWidth = maxImageHeight * imgRatio;
            }
            
            // Center the larger image
            const x = (pageWidth - drawWidth) / 2;
            const y = 30;
            
            // Add the BIGGER watermarked image
            doc.addImage(img, "JPEG", x, y, drawWidth, drawHeight);
            
            // Add compact information box below image
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(40, y + drawHeight + 20, pageWidth - 80, 60, 5, 5, 'F');
            
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(1);
            doc.roundedRect(40, y + drawHeight + 20, pageWidth - 80, 60, 5, 5);
            
            // Add wallpaper details
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(wallpaper.name || "Untitled", pageWidth / 2, y + drawHeight + 45, { align: "center" });
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "normal");
            doc.text(`Product Code: ${wallpaper.productCode || "N/A"}`, pageWidth / 2, y + drawHeight + 75, { align: "center" });
            
            // Add page footer with luxury styling
            doc.setFillColor(245, 245, 245);
            doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');
            
            // Add decorative top border to footer
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(1);
            doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);
            
            // Add timestamp at bottom
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(timestamp, pageWidth / 2, pageHeight - 30, { align: "center" });
            
            // Add page number in center
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text(`Page 2 of 2`, pageWidth / 2, pageHeight - 15, { align: "center" });
            
            // Add brand footer
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(10);
            doc.text("ELLENDORF Luxury Textile Wall Coverings", pageWidth / 2, pageHeight - 5, { align: "center" });
            
            resolve();
          };
          img.onerror = reject;
        });
      } catch (err) {
        console.error("Error loading or watermarking image:", err);
        
        // Fallback: Show error message with styling
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(24);
        doc.setFont("helvetica", "italic");
        doc.text("Image unavailable", pageWidth / 2, pageHeight / 2 - 30, { align: "center" });
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.text(wallpaper.name || "Untitled", pageWidth / 2, pageHeight / 2 + 10, { align: "center" });
        doc.text(`Code: ${wallpaper.productCode || "N/A"}`, pageWidth / 2, pageHeight / 2 + 40, { align: "center" });
        
        // Still add footer for consistency
        doc.setFillColor(245, 245, 245);
        doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(1);
        doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(timestamp, pageWidth / 2, pageHeight - 30, { align: "center" });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.text(`Page 2 of 2`, pageWidth / 2, pageHeight - 15, { align: "center" });
        
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(10);
        doc.text("ELLENDORF Luxury Collection", pageWidth / 2, pageHeight - 5, { align: "center" });
      }

      // Save the PDF with luxury name
      const fileName = `Ellendorf_Luxury_${wallpaper.productCode || wallpaper.name.substring(0, 20).replace(/\s+/g, '_')}_${formattedDate}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate luxury brochure. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePDFDownload = (wallpaper) => {
    generatePDF(wallpaper);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <motion.div 
          className="text-center" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-8"
          >
            <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full" />
          </motion.div>
          <p className="text-2xl font-light text-slate-700">Curating Luxury Collection...</p>
          <p className="text-sm text-slate-500 mt-2">Loading premium designs</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-2xl max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl text-slate-700 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <header className="sticky ">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
              
                {/* <div className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Ellendorf
                </div> */}
              </div>
              {/* <div className="hidden md:block text-sm text-slate-600 font-medium border-l border-slate-200 pl-3">
                Textile Wall Coverings
              </div> */}
            </div>
          </div>
        </div>
      </header>

      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-blue-50/30"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-12 h-12 text-blue-400" />
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                  Luxury Textile
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Wall Coverings
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Premium collection of exquisite designs for your living spaces
              </p>
            </motion.div>

            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="inline-block bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 shadow-lg">
                <p className="text-xl font-light italic text-slate-600">
                  {quotes[quoteIndex]}
                </p>
              </div>
            </motion.div>

            <div className="max-w-xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search designs by name, code, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Filter className="w-4 h-4" />
                  Collections:
                </div>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    className={`rounded-full ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full pl-4 pr-10 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50"
                  >
                    <option value="default">Default Sort</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="code">Product Code</option>
                    <option value="newest">Newest First</option>
                  </select>
                  <Star className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-full p-1">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-full px-4 ${viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : ''}`}
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className={`rounded-full px-4 ${viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : ''}`}
                  >
                    <LayoutList className="w-4 h-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="pb-24">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <p className="text-slate-600">
              {/* Showing <span className="font-semibold text-blue-600">{filteredWallpapers.length}</span> designs */}
              {selectedCategory !== 'All' && (
                <span className="ml-2">
                  in <span className="font-semibold text-indigo-600">{selectedCategory}</span>
                </span>
              )}
            </p>
          </div>

          {viewMode === 'grid' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((wp, i) => (
                  <motion.div
                    key={wp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.05,
                      layout: { duration: 0.3 }
                    }}
                    className="group relative"
                  >
                    <div
                      className="relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white border border-slate-200/50"
                      onClick={() => setSelectedWallpaper(wp)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img
                          src={wp.imageUrl}
                          alt={wp.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWallpaper(wp);
                            }}
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="bg-white/90 backdrop-blur-sm hover:bg-white rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePDFDownload(wp);
                            }}
                          >
                            {isGeneratingPDF ? (
                              <Loader2 className="w-4 h-4 text-slate-600 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-600" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-slate-700 shadow-sm">
                          {wp.subCategory?.name || "Premium"}
                        </div>
                      </div>

                      <div className="p-6 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {wp.name}
                          </h3>
                          <span className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {wp.productCode}
                          </span>
                        </div>
                        
                        {wp.description && (
                          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                            {wp.description}
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            className="flex-1 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWallpaper(wp);
                            }}
                          >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="flex-1 text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePDFDownload(wp);
                            }}
                            disabled={isGeneratingPDF}
                          >
                            {isGeneratingPDF ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4 mr-2" />
                            )}
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="space-y-6 mb-16"
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((wp, i) => (
                  <motion.div
                    key={wp.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.4,
                      delay: i * 0.05
                    }}
                  >
                    <div
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/50 cursor-pointer"
                      onClick={() => setSelectedWallpaper(wp)}
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative overflow-hidden">
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                            {wp.subCategory?.name || "Premium"}
                          </div>
                        </div>
                        
                        <div className="md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                              <h3 className="text-xl font-semibold text-slate-900 mb-2 md:mb-0">
                                {wp.name}
                              </h3>
                              <span className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                {wp.productCode}
                              </span>
                            </div>
                            
                            {wp.description && (
                              <p className="text-slate-600 mb-4 line-clamp-3">
                                {wp.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                              <span>Collection: {wp.subCategory?.name || 'Premium'}</span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWallpaper(wp);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePDFDownload(wp);
                                }}
                                disabled={isGeneratingPDF}
                              >
                                {isGeneratingPDF ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <FileText className="w-4 h-4 mr-2" />
                                )}
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
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
                        className={`w-8 h-8 p-0 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} • {filteredWallpapers.length} designs
              </span>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedWallpaper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWallpaper(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8, rotateX: -10 }}
              animate={{ scale: 1, rotateX: 0 }}
              exit={{ scale: 0.8, rotateX: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full bg-gradient-to-br from-white to-slate-50 rounded-3xl overflow-hidden border border-slate-200/50 shadow-2xl"
            >
              <div className="relative h-[70vh] overflow-hidden">
                <img
                  src={selectedWallpaper.imageUrl}
                  alt={selectedWallpaper.name}
                  className="w-full h-full object-contain"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                      {selectedWallpaper.name}
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                      <span className="text-xl text-blue-600 font-mono">
                        {selectedWallpaper.productCode}
                      </span>
                      {selectedWallpaper.subCategory?.name && (
                        <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full">
                          {selectedWallpaper.subCategory.name}
                        </span>
                      )}
                    </div>
                    {selectedWallpaper.description && (
                      <p className="mt-4 text-slate-600 max-w-2xl">
                        {selectedWallpaper.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePDFDownload(selectedWallpaper)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-5 h-5 mr-2" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedWallpaper(null)}
                className="absolute top-6 right-6 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg"
                size="icon"
              >
                <X className="w-6 h-6 text-slate-700" />
              </Button>

              <Button
                onClick={() => window.open(selectedWallpaper.imageUrl, '_blank')}
                className="absolute top-6 left-6 bg-white/80 hover:bg-white backdrop-blur-sm text-slate-700"
              >
                <Maximize2 className="w-5 h-5 mr-2" />
                Full View
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-gradient-to-b from-white to-slate-100 border-t border-slate-200/50">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Ellendorf
                </div>
                <div className="h-6 w-px bg-slate-300"></div>
                <p className="text-sm text-slate-500">
                  Luxury Textile Wall Coverings
                </p>
              </div>
              <p className="text-sm text-slate-400 mt-4 max-w-md">
                Premium collection of exquisite designs for modern living spaces.
                {viewMode === 'grid' ? ' Grid view' : ' List view'} • Sorted by {
                  sortBy === 'default' ? 'default' : 
                  sortBy === 'name' ? 'name' : 
                  sortBy === 'code' ? 'product code' : 
                  'newest'
                }
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end space-y-2">
              <p className="text-sm text-slate-500">
                Showing {filteredWallpapers.length} of {wallpapers.length} designs
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-full ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewMode('list')}
                  className={`rounded-full ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-400">
                © {new Date().getFullYear()} Ellendorf. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}