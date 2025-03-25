import React from 'react';

export const Dashboard = React.lazy(() => 
  import('./Dashboard')
    .then(module => ({ default: module.default }))
    .catch(error => {
      console.error('Error loading Dashboard:', error);
      return import('./NotFound');
    })
);