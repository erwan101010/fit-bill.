import { ImageResponse } from 'next/og'

export const alt = 'Demos - Coaching Premium'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui',
          fontWeight: 'bold',
        }}
      >
        <div style={{ fontSize: 180, marginBottom: 40 }}>🏋️</div>
        <div style={{ fontSize: 80, marginBottom: 20 }}>Demos</div>
        <div style={{ fontSize: 40, opacity: 0.9 }}>Coaching Premium</div>
      </div>
    ),
    {
      ...size,
    }
  )
}

