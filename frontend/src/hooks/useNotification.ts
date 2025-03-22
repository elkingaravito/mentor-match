import { useCallback } from 'react';
import { useToast } from '../components/feedback/Toast';
import { Button } from '@mui/material';

interface NotificationOptions {
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  persistent?: boolean;
}

export const useNotification = () => {
  const { showToast, hideToast } = useToast();

  const success = useCallback((message: string, options?: NotificationOptions) => {
    return showToast(message, {
      severity: 'success',
      action: options?.action && (
        <Button
          color="inherit"
          size="small"
          onClick={options.action.onClick}
        >
          {options.action.label}
        </Button>
      ),
      autoHideDuration: options?.duration,
      persistent: options?.persistent,
    });
  }, [showToast]);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    return showToast(message, {
      severity: 'error',
      action: options?.action && (
        <Button
          color="inherit"
          size="small"
          onClick={options.action.onClick}
        >
          {options.action.label}
        </Button>
      ),
      autoHideDuration: options?.duration || 8000, // Errores duran más por defecto
      persistent: options?.persistent,
    });
  }, [showToast]);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    return showToast(message, {
      severity: 'warning',
      action: options?.action && (
        <Button
          color="inherit"
          size="small"
          onClick={options.action.onClick}
        >
          {options.action.label}
        </Button>
      ),
      autoHideDuration: options?.duration || 6000,
      persistent: options?.persistent,
    });
  }, [showToast]);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    return showToast(message, {
      severity: 'info',
      action: options?.action && (
        <Button
          color="inherit"
          size="small"
          onClick={options.action.onClick}
        >
          {options.action.label}
        </Button>
      ),
      autoHideDuration: options?.duration,
      persistent: options?.persistent,
    });
  }, [showToast]);

  const dismiss = useCallback((id: string) => {
    hideToast(id);
  }, [hideToast]);

  return {
    success,
    error,
    warning,
    info,
    dismiss,
  };
};