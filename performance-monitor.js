/**
 * Performance Monitoring Script
 * Monitors application performance metrics in real-time
 * 
 * Usage: node performance-monitor.js
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      imageLoadTimes: [],
      pdfGenerationTimes: [],
      apiResponseTimes: [],
      cacheHitRate: 0,
      errorRate: 0,
    };
  }

  // Monitor image loading performance
  trackImageLoad(url, loadTime) {
    this.metrics.imageLoadTimes.push({
      url,
      loadTime,
      timestamp: Date.now(),
    });
    
    // Keep only last 1000 entries
    if (this.metrics.imageLoadTimes.length > 1000) {
      this.metrics.imageLoadTimes.shift();
    }
  }

  // Monitor PDF generation performance
  trackPDFGeneration(sizeKB, generationTime) {
    this.metrics.pdfGenerationTimes.push({
      sizeKB,
      generationTime,
      timestamp: Date.now(),
    });
    
    // Keep only last 100 entries
    if (this.metrics.pdfGenerationTimes.length > 100) {
      this.metrics.pdfGenerationTimes.shift();
    }
  }

  // Get performance statistics
  getStats() {
    const imageTimes = this.metrics.imageLoadTimes.map(m => m.loadTime);
    const pdfTimes = this.metrics.pdfGenerationTimes.map(m => m.generationTime);
    const pdfSizes = this.metrics.pdfGenerationTimes.map(m => m.sizeKB);

    return {
      images: {
        total: imageTimes.length,
        avgLoadTime: imageTimes.length > 0 
          ? (imageTimes.reduce((a, b) => a + b, 0) / imageTimes.length).toFixed(2)
          : 0,
        minLoadTime: imageTimes.length > 0 ? Math.min(...imageTimes) : 0,
        maxLoadTime: imageTimes.length > 0 ? Math.max(...imageTimes) : 0,
      },
      pdfs: {
        total: pdfTimes.length,
        avgGenerationTime: pdfTimes.length > 0
          ? (pdfTimes.reduce((a, b) => a + b, 0) / pdfTimes.length).toFixed(2)
          : 0,
        avgSizeKB: pdfSizes.length > 0
          ? (pdfSizes.reduce((a, b) => a + b, 0) / pdfSizes.length).toFixed(2)
          : 0,
        minSizeKB: pdfSizes.length > 0 ? Math.min(...pdfSizes).toFixed(2) : 0,
        maxSizeKB: pdfSizes.length > 0 ? Math.max(...pdfSizes).toFixed(2) : 0,
      },
      cacheHitRate: this.metrics.cacheHitRate,
      errorRate: this.metrics.errorRate,
    };
  }

  // Log performance report
  logReport() {
    const stats = this.getStats();
    console.log('\n📊 Performance Report');
    console.log('='.repeat(50));
    console.log('Images:');
    console.log(`  Total Loaded: ${stats.images.total}`);
    console.log(`  Avg Load Time: ${stats.images.avgLoadTime}ms`);
    console.log(`  Min/Max: ${stats.images.minLoadTime}ms / ${stats.images.maxLoadTime}ms`);
    console.log('\nPDFs:');
    console.log(`  Total Generated: ${stats.pdfs.total}`);
    console.log(`  Avg Generation Time: ${stats.pdfs.avgGenerationTime}ms`);
    console.log(`  Avg Size: ${stats.pdfs.avgSizeKB} KB`);
    console.log(`  Size Range: ${stats.pdfs.minSizeKB} KB - ${stats.pdfs.maxSizeKB} KB`);
    console.log('='.repeat(50) + '\n');
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

if (typeof window !== 'undefined') {
  window.performanceMonitor = performanceMonitor;
}

module.exports = performanceMonitor;
