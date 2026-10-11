'use client';

import { useEffect } from 'react';

export function useEnterToSubmitAuthForm() {
  useEffect(() => {
    function handleEnter(event: KeyboardEvent) {
      if (
        event.key !== 'Enter' ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      ) return;

      const activeElement = document.activeElement;
      if (activeElement !== document.body && activeElement !== document.documentElement) return;

      const dialogForm = document.querySelector<HTMLFormElement>('[role="dialog"] form');
      const authForm = document.querySelector<HTMLFormElement>('.auth-page form');
      const form = dialogForm ?? authForm;
      if (!form || !form.getClientRects().length) return;

      event.preventDefault();
      form.requestSubmit();
    }

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, []);
}
