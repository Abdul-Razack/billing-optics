import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 20,
          background: 'linear-gradient(to bottom right, #6366f1, #4f46e5)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 900,
          borderRadius: 8,
          fontFamily: 'sans-serif',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
        }}
      >
        O
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
