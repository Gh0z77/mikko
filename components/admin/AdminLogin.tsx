'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export function AdminLogin() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    setBusy(false);
    if (response.ok) return window.location.reload();
    setError(response.status === 429 ? "Ko'p urinish. 5 daqiqadan keyin qayta urining." : "Kod noto'g'ri");
    setPin('');
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-[#F6F1EC] px-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.3)]"
      >
        <Image src="/images/mikko-logo.png" alt="mikko" width={540} height={110} className="mx-auto h-9 w-auto" />
        <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-full bg-orange-soft text-orange-deep">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-[22px]">Xodimlar paneli</h1>
        <p className="mt-1 text-[13px] text-cocoa">Kirish kodini kiriting</p>
        <motion.input
          animate={error ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
          value={pin}
          onChange={(event) => {
            setPin(event.target.value.replace(/\D/g, '').slice(0, 10));
            setError('');
          }}
          inputMode="numeric"
          autoFocus
          aria-label="Kirish kodi"
          className="mt-5 h-14 w-full rounded-2xl border border-ink/10 text-center font-mono text-[24px] tracking-[0.4em] outline-none focus:border-orange"
        />
        {error && <p className="mt-2 text-[12.5px] font-semibold text-[#C0392B]">{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="mt-5 h-12 w-full rounded-2xl bg-orange text-[15px] font-bold text-white disabled:opacity-50"
        >
          Kirish
        </button>
      </motion.form>
    </div>
  );
}
