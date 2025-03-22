import React from 'react';
import { DataObject as DataObjectIcon } from '@mui/icons-material';
import EmptyState from '../EmptyState';

interface NoDataProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'card';
}

const NoData: React.FC<NoDataProps> = ({
  title = 'No Data Available',
  description = 'There\'s no data to display at the moment.',
  actionLabel,
  onAction,
  variant,
}) => {
  return (
    <EmptyState
      icon={DataObjectIcon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant={variant}
      color="warning"
    />
  );
};

export default NoData;