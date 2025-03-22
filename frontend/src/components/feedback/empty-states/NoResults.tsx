import React from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
import EmptyState from '../EmptyState';

interface NoResultsProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'card';
}

const NoResults: React.FC<NoResultsProps> = ({
  title = 'No Results Found',
  description = 'We couldn\'t find any items matching your criteria. Try adjusting your search or filters.',
  actionLabel = 'Clear Filters',
  onAction,
  variant,
}) => {
  return (
    <EmptyState
      icon={SearchIcon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      variant={variant}
      color="info"
    />
  );
};

export default NoResults;