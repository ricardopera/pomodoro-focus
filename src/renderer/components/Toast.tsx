import { useEffect } from 'react';

export interface ToastMessage {
  id: number;
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

/** One quiet line at the top of the app. Never more than one at a time. */
export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(onDismiss, 4000);
    return () => window.clearTimeout(id);
  }, [toast, onDismiss]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" onClick={onDismiss}>
      {toast.text}
    </div>
  );
}
