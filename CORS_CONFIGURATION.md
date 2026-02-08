# AWS S3 CORS Configuration Guide

## Required CORS Configuration for Image Loading

To ensure images load correctly in the PDF generation, your AWS S3 bucket must have the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "Content-Length",
            "Content-Type"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## Key Points:

1. **AllowedOrigins**: Set to `["*"]` for public access, or specify your domain(s)
2. **AllowedMethods**: Must include `GET` and `HEAD`
3. **AllowedHeaders**: Can be `["*"]` or specific headers
4. **ExposeHeaders**: Important for CORS preflight requests

## CloudFront Configuration (if using CDN):

If using CloudFront in front of S3:

1. Enable CORS in CloudFront behaviors
2. Add CORS headers in CloudFront response headers policy
3. Ensure CloudFront forwards the `Origin` header

## Testing CORS:

You can test CORS configuration using:

```bash
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-s3-bucket.s3.amazonaws.com/image.jpg
```

Expected response headers:
- `Access-Control-Allow-Origin: *` (or your domain)
- `Access-Control-Allow-Methods: GET, HEAD`
- `Access-Control-Allow-Headers: *`

## Application Code:

The application already includes:
- ✅ `crossOrigin = "anonymous"` on all Image objects
- ✅ `credentials: 'omit'` in fetch requests
- ✅ Proper CORS headers in fetch requests
- ✅ WEBP to JPEG conversion fallback
- ✅ PDF abort on image load failure

## Troubleshooting:

If images fail to load:
1. Check browser console for CORS errors
2. Verify S3 bucket CORS configuration
3. Check CloudFront settings (if applicable)
4. Verify image URLs are accessible
5. Check network tab for failed requests
