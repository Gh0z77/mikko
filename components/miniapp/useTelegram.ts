'use client';

import { useEffect, useState } from 'react';
import { TELEGRAM_READY, telegramApp, type WebApp } from '@/components/providers/TelegramWebApp';

/** Telegram Mini App handle (null in a normal browser) — re-renders once the SDK is ready. */
export function useTelegram(): WebApp | null {
  const [app, setApp] = useState<WebApp | null>(null);
  useEffect(() => {
    const sync = () => setApp(telegramApp());
    sync();
    window.addEventListener(TELEGRAM_READY, sync);
    return () => window.removeEventListener(TELEGRAM_READY, sync);
  }, []);
  return app;
}

export function haptic(kind: 'tap' | 'select' | 'success' | 'error') {
  const h = telegramApp()?.HapticFeedback;
  if (!h) {
    if (kind !== 'select' && typeof navigator !== 'undefined') navigator.vibrate?.(kind === 'tap' ? 8 : 20);
    return;
  }
  if (kind === 'tap') h.impactOccurred('light');
  else if (kind === 'select') h.selectionChanged();
  else h.notificationOccurred(kind);
}

/**
 * Drives Telegram's native bottom MainButton. Returns false when not inside Telegram,
 * so the caller renders its own look-alike button instead.
 */
export function useMainButton(
  app: WebApp | null,
  main: { text: string; onClick: () => void; active?: boolean; progress?: boolean } | null,
) {
  useEffect(() => {
    if (!app) return;
    const button = app.MainButton;
    if (!main) {
      button.setParams({ is_visible: false });
      return;
    }
    button.setParams({
      text: main.text,
      color: '#FE6700',
      text_color: '#FFFFFF',
      is_active: main.active !== false,
      is_visible: true,
    });
    if (main.progress) button.showProgress(false);
    else button.hideProgress();
    button.onClick(main.onClick);
    return () => button.offClick(main.onClick);
  }, [app, main]);
  return Boolean(app);
}

export function useBackButton(app: WebApp | null, onBack: (() => void) | null) {
  useEffect(() => {
    if (!app) return;
    if (!onBack) {
      app.BackButton.hide();
      return;
    }
    app.BackButton.show();
    app.BackButton.onClick(onBack);
    return () => app.BackButton.offClick(onBack);
  }, [app, onBack]);
}
