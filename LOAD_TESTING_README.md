# Load Testing Guide
## Testing Application Performance with 3,000 Concurrent Users

### Prerequisites

Install required dependencies:
```bash
npm install axios p-limit
```

### Running Load Tests

```bash
# Run the load test
npm run load-test

# Or directly
node load-test.js
```

### What the Load Test Does

1. **Simulates 3,000 Concurrent Users**
   - Each user performs multiple requests
   - Tests wallpaper page loading
   - Tests collections page loading
   - Tests image loading from CDN

2. **Measures Performance**
   - Response times
   - Success rates
   - Error rates
   - Image load times

3. **Generates Report**
   - Total requests
   - Success/failure rates
   - Average response times
   - Performance assessment

### Expected Results

For 3,000 concurrent users:
- **Success Rate**: ≥ 99%
- **Average Response Time**: < 2000ms
- **Image Load Time**: < 500ms (cached), < 2000ms (uncached)

### Performance Monitoring

The application includes built-in performance monitoring:
- Tracks image load times
- Tracks PDF generation times
- Monitors cache hit rates
- Tracks error rates

### Configuration

Edit `load-test.js` to adjust:
- `CONCURRENT_USERS`: Number of concurrent users (default: 3000)
- `REQUESTS_PER_USER`: Requests per user (default: 10)
- `TIMEOUT`: Request timeout in ms (default: 30000)

### Troubleshooting

If load test fails:
1. Check API server is running
2. Verify BASE_URL in load-test.js
3. Check network connectivity
4. Review error logs in console
