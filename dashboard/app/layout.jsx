import { Sidebar } from '@/components/layout/sidebar';

export const metadata = {
  title: 'Charon Dashboard',
  description: 'Solana Trading Bot Control Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      bg: { DEFAULT: '#0f0f13', card: '#17171d', hover: '#1e1e27', border: '#2a2a38' },
                    },
                    fontFamily: { mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'] },
                  },
                },
              }
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{__html: `
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; }
          body { background: #0f0f13; color: #e4e4f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
          ::-webkit-scrollbar { width: 4px; height: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #3a3a50; border-radius: 99px; }
          ::-webkit-scrollbar-thumb:hover { background: #5a5a80; }
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          input[type=number] { -moz-appearance: textfield; }
        `}} />
      </head>
      <body className="flex h-screen overflow-hidden" style={{background:'#0f0f13'}}>
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
