import { ImageResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#004B2E',
            borderRadius: '50%',
            flexDirection: 'column',
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
          }}
        >
          IM
        </div>
      ),
      {
        width: 32,
        height: 32,
      }
    );
  } catch (error) {
    console.error('Error generating favicon:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}