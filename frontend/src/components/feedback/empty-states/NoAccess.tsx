import React from 'react';
import { Lock as LockIcon } from '@mui/icons-material';
import EmptyState from '../EmptyState';

interface NoAccessProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'card';
}

const NoAccess: React.FC<NoAccessProps> = ({
  title = 'Access Denied',
  description = 'You don\'t have permission to access this resource.',
  actionLabel = 'Go Back',
  onAction,
  variant,
}) => {
  return (
    <EmptyState
      icon={LockIcon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant={variant}
      color="error"
    />
  );
};

export default NoAccess;