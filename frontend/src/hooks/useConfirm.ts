import { useCallback } from 'react';
import { useConfirmDialog } from '../components/feedback/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  description?: string;
}

export const useConfirm = () => {
  const { confirm } = useConfirmDialog();

  const deleteConfirm = useCallback(async (options?: ConfirmOptions) => {
    return confirm({
      title: options?.title || 'Confirm Delete',
      message: options?.message || 'Are you sure you want to delete this item?',
      description: options?.description || 'This action cannot be undone.',
      confirmLabel: options?.confirmLabel || 'Delete',
      cancelLabel: options?.cancelLabel || 'Cancel',
      severity: 'error',
      confirmButtonProps: {
        color: 'error',
        variant: 'contained',
      },
    });
  }, [confirm]);

  const warningConfirm = useCallback(async (options?: ConfirmOptions) => {
    return confirm({
      title: options?.title || 'Warning',
      message: options?.message || 'Are you sure you want to proceed?',
      description: options?.description,
      confirmLabel: options?.confirmLabel || 'Proceed',
      cancelLabel: options?.cancelLabel || 'Cancel',
      severity: 'warning',
      confirmButtonProps: {
        color: 'warning',
        variant: 'contained',
      },
    });
  }, [confirm]);

  const actionConfirm = useCallback(async (options?: ConfirmOptions) => {
    return confirm({
      title: options?.title || 'Confirm Action',
      message: options?.message || 'Are you sure you want to perform this action?',
      description: options?.description,
      confirmLabel: options?.confirmLabel || 'Continue',
      cancelLabel: options?.cancelLabel || 'Cancel',
      severity: 'question',
      confirmButtonProps: {
        color: 'primary',
        variant: 'contained',
      },
    });
  }, [confirm]);

  const infoConfirm = useCallback(async (options?: ConfirmOptions) => {
    return confirm({
      title: options?.title || 'Information',
      message: options?.message || 'Please confirm to continue',
      description: options?.description,
      confirmLabel: options?.confirmLabel || 'OK',
      cancelLabel: options?.cancelLabel || 'Cancel',
      severity: 'info',
      confirmButtonProps: {
        color: 'info',
        variant: 'contained',
      },
    });
  }, [confirm]);

  return {
    deleteConfirm,
    warningConfirm,
    actionConfirm,
    infoConfirm,
    confirm,
  };
};