interface StatusBadgeProps {
  status: 'on-time' | 'delayed' | 'overcrowded' | 'low' | 'medium' | 'high' | 'ok' | 'needs-service';
  type?: 'bus' | 'pollution' | 'maintenance';
}

export function StatusBadge({ status, type = 'bus' }: StatusBadgeProps) {
  const getStyles = () => {
    if (type === 'bus') {
      switch (status) {
        case 'on-time':
          return 'bg-green-100 text-green-700';
        case 'delayed':
          return 'bg-yellow-100 text-yellow-700';
        case 'overcrowded':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    } else if (type === 'pollution') {
      switch (status) {
        case 'low':
          return 'bg-green-100 text-green-700';
        case 'medium':
          return 'bg-yellow-100 text-yellow-700';
        case 'high':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    } else {
      switch (status) {
        case 'ok':
          return 'bg-green-100 text-green-700';
        case 'needs-service':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    }
  };

  const getLabel = () => {
    if (type === 'bus') {
      return status === 'on-time' ? 'On Time' : status === 'overcrowded' ? 'Overcrowded' : 'Delayed';
    } else if (type === 'pollution') {
      return status.charAt(0).toUpperCase() + status.slice(1);
    } else {
      return status === 'ok' ? 'OK' : 'Needs Service';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStyles()}`}>
      {getLabel()}
    </span>
  );
}
