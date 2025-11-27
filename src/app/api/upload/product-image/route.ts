// src/app/api/upload/product-image/route.ts
import { NextRequest } from 'next/server';
import { secureImageUpload } from '@/lib/fileUpload';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user first
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this is a multipart/form-data request (file upload)
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Get boundary from content-type header
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      return Response.json({ error: 'Invalid multipart format' }, { status: 400 });
    }

    // For file uploads, we'll need to handle the raw stream or use a library like busboy
    // Since Next.js doesn't have built-in multipart parsing, we'll handle it differently
    // In a real implementation, you'd use a library or the new Next.js 13+ approach
    
    // For now, let's expect the upload to come through request body as blob
    // In a real application, you might want to use a service like UploadThing
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert File to Buffer (in a real Next.js app, you'd need to handle this differently)
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process the uploaded file securely
    const result = await secureImageUpload(
      buffer,
      file.name,
      file.type
    );

    if (result.success && result.url) {
      return Response.json({ 
        success: true, 
        url: result.url,
        message: 'File uploaded successfully'
      });
    } else {
      return Response.json({ 
        success: false, 
        error: result.error || 'Upload failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('File upload error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}