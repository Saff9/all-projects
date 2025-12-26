import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Free Online Web Utilities & SEO Suite';
    const category = searchParams.get('category') || 'Developer & SEO Tools';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0f1d',
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)',
            padding: '60px 80px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              🛠️
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', letterSpacing: '-0.5px' }}>
                ToolForge
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Free Client-Side Web Utilities &amp; SEO Engine
              </span>
            </div>
          </div>

          {/* Main Title Block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '950px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '9999px',
                padding: '6px 18px',
                color: '#818cf8',
                fontSize: '14px',
                fontWeight: 600,
                alignSelf: 'flex-start',
              }}
            >
              ✦ {category}
            </div>

            <div
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Highlights */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
              paddingTop: '24px',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', gap: '30px' }}>
              <span>🔒 100% Private (No Server Data)</span>
              <span>⚡ Zero Latency</span>
              <span>🌟 Free Forever</span>
            </div>
            <span style={{ color: '#818cf8', fontWeight: 600 }}>toolforge-dusky.vercel.app</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
