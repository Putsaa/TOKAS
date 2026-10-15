import React from 'react';
import StatusBadge from './StatusBadge';

const StatusChip = ({ status, ...props }) => {
  return <StatusBadge status={status} {...props} />;
};

export default StatusChip;
