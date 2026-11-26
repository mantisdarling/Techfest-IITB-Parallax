import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalFocus<T extends HTMLElement>(onClose?: () => void) {
  const dialogRef = useRef<T | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const inerted: Element[] = [];
    let node: HTMLElement | null = dialog;
    while (node && node !== document.body) {
      const parent: HTMLElement | null = node.parentElement;
      if (parent) {
        for (const sibling of Array.from(parent.children)) {
          if (sibling !== node && !sibling.hasAttribute('inert')) {
            sibling.setAttribute('inert', '');
            inerted.push(sibling);
          }
        }
      }
      node = parent;
    }

    dialog.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialog.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', onKeyDown);

    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      inerted.forEach((el) => el.removeAttribute('inert'));
      opener?.focus();
    };
  }, [onClose]);

  return dialogRef;
}
