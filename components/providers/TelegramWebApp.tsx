'use client';

import { useEffect } from 'react';

interface BottomButton {
  setParams: (params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_active?: boolean;
    is_visible?: boolean;
  }) => void;
  onClick: (cb: () => void) => void;
  offClick: (cb: () => void) => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
}

export interface WebApp {
  initData: string;
  initDataUnsafe: {
    user?: { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string };
  };
  version: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (version: string) => boolean;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  disableVerticalSwipes?: () => void;
  MainButton: BottomButton;
  BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'success' | 'error' | 'warning') => void;
    selectionChanged: () => void;
  };
  requestContact?: (cb?: (shared: boolean) => void) => void;
  onEvent: (event: string, cb: (payload: never) => void) => void;
  offEvent: (event: string, cb: (payload: never) => void) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

const FLAG = 'mikko:tg';
export const TELEGRAM_READY = 'mikko:telegram-ready';

/** The Mini App object when the site runs inside Telegram, otherwise null. */
export function telegramApp(): WebApp | null {
  const app = typeof window === 'undefined' ? undefined : window.Telegram?.WebApp;
  return app?.initData ? app : null;
}

// Loads Telegram's SDK only for the Mini App route or visitors who came from the bot,
// so regular web visitors never download a third-party script.
export function TelegramWebApp() {
  useEffect(() => {
    const fromTelegram =
      window.location.hash.includes('tgWebAppData') ||
      window.location.pathname.startsWith('/app') ||
      sessionStorage.getItem(FLAG) === '1';
    if (!fromTelegram || document.getElementById('tg-sdk')) return;
    const script = document.createElement('script');
    script.id = 'tg-sdk';
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.onload = () => {
      const app = telegramApp();
      if (!app) return;
      sessionStorage.setItem(FLAG, '1');
      app.ready();
      app.expand();
      app.setHeaderColor('#FFF8F3');
      app.setBackgroundColor('#FFF8F3');
      if (app.isVersionAtLeast('7.7')) app.disableVerticalSwipes?.();
      window.dispatchEvent(new Event(TELEGRAM_READY));
    };
    document.head.appendChild(script);
  }, []);
  return null;
}
