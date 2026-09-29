import React, { useState, useEffect } from 'react';

export const Footer: React.FC = () => {
  const [logTimestamp, setLogTimestamp] = useState<number>(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setLogTimestamp(Math.floor(Date.now() / 1000));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-[#18181a] text-white px-6 md:px-12 py-3.5 flex flex-col sm:flex-row items-center justify-between font-mono-tech text-[11px] tracking-[0.1em] border-t-2 border-[#18181a] shrink-0 gap-2">
      <div>© 2026 AUTHSHIELD INDUSTRIAL CORE</div>
      <div className="opacity-80">ST_LOG: {logTimestamp}</div>
      <div className="text-[#0047ff] font-bold">ENCRYPTION: AES_256_GCM</div>
    </footer>
  );
};
