import { Sidebar } from '@/components/layout/sidebar';

export const metadata = {
  title: 'Charon Dashboard',
  description: 'Solana Trading Bot Control Panel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      surface: {
                        50: '#f0f0f8',
                        100: '#e0e0f0',
                        800: '#1a1a2e',
                        900: '#12121e',
                        950: '#0e0e16',
                      },
                    },
                  },
                },
              }
            `,
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          * { box-sizing: border-box; }
          body { margin: 0; background: #0e0e16; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: #12121e; }
          ::-webkit-scrollbar-thumb { background: #2d2d4e; border-radius: 3px; }
          ::-webkit-scrollbar-thumb:hover { background: #4444aa; }
        `}} />
      </head>
      <body className="flex h-screen overflow-hidden" style={{background: '#0e0e16'}}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
