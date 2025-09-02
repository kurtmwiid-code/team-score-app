import * as React from "react";
import { Toast, type ToastProps, type ToastActionElement } from "./toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
};

const listeners: ((toasts: ToasterToast[]) => void)[] = [];
let toasts: ToasterToast[] = [];

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

export function useToast() {
  return React.useMemo(
    () => ({
      toast: (props: ToastProps) => {
        const id = genId();
        const toast: ToasterToast = { id, ...props };
        toasts = [...toasts, toast];
        listeners.forEach((l) => l(toasts));

        setTimeout(() => {
          toasts = toasts.filter((t) => t.id !== id);
          listeners.forEach((l) => l(toasts));
        }, TOAST_REMOVE_DELAY);
      },
    }),
    []
  );
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = React.useState<ToasterToast[]>([]);

  React.useEffect(() => {
    const listener = (newToasts: ToasterToast[]) => setCurrentToasts(newToasts.slice(-TOAST_LIMIT));
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {currentToasts.map(({ id, ...props }) => (
        <Toast key={id} {...props} />
      ))}
    </div>
  );
}
