interface PumpIconProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'inline' | 'bottom-right';
}
  
export const PumpIcon: React.FC<PumpIconProps> = ({ 
  status, 
  className = '',
  size = 'lg',
  position = 'top-right'
}) => {
    const getColor = () => {
      switch (status) {
        case 'Completed':
          return '#67c28d';
        case 'Contributing':
          return '#ffd700';
        case 'Voting':
          return '#ff6b6b';
        default:
          return '#bdd1d2';
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case 'sm':
          return 'w-3 h-3';
        case 'lg':
          return 'w-6 h-6';
        default:
          return 'w-4 h-4';
      }
    };
  
    const getPositionClass = () => {
      switch (position) {
        case 'top-right':
          return 'absolute top-2 right-2';
        case 'bottom-right':
          return 'absolute bottom-2 right-2';
        case 'inline':
          return 'inline-block';
        default:
          return '';
      }
    };
  
    const iconClassName = `${getSizeClass()} ${getPositionClass()} ${className}`;
  
    return (
      <svg 
        viewBox="0 0 7.63 5.74" 
        className={iconClassName}
        role="img"
        aria-label={`Status: ${status}`}
      >
        <path d="M1.31,3.58A1.7,1.7,0,0,1,.48,1.31h0A1.71,1.71,0,0,1,2.75.49l1.58.73L2.89,4.32Z" fill={getColor()}/>
        <path d="M7.15,4.42a1.71,1.71,0,0,1-2.27.83L3.23,4.48l1.45-3.1,1.64.77a1.71,1.71,0,0,1,.83,2.27Z" fill="#fff"/>
        <path d="M.94,1.8h0a.09.09,0,0,1,0-.11,1.78,1.78,0,0,1,.17-.27.07.07,0,0,1,.11,0,.08.08,0,0,1,0,.11,1.48,1.48,0,0,0-.14.25A.09.09,0,0,1,.94,1.8Z" fill="#fff"/>
        <path d="M1.26,1.35h0a.08.08,0,0,1,0-.12,1,1,0,0,1,.7-.28A.08.08,0,0,1,2,1a.07.07,0,0,1-.08.08.82.82,0,0,0-.59.24A.08.08,0,0,1,1.26,1.35Z" fill="#fff"/>
        <path d="M2.16,1.12a.08.08,0,0,1,0-.09A.07.07,0,0,1,2.21,1a.87.87,0,0,1,.24.09.07.07,0,0,1,0,.1.08.08,0,0,1-.11,0,1.07,1.07,0,0,0-.2-.07Z" fill="#fff"/>
        <path d="M7.19,4.33l0,0v0a.64.64,0,0,0,0-.07V4a.13.13,0,0,0,0-.06l-.09.2a1.5,1.5,0,0,1-2,.73L3.44,4l-.21.44.29.14,1.36.63a1.51,1.51,0,0,0,.58.15,1.59,1.59,0,0,0,.65-.07l.08,0A1.51,1.51,0,0,0,6.68,5a.18.18,0,0,0,.07,0l.17-.18a1.54,1.54,0,0,0,.23-.37h0l0-.07Z" fill="#bdd1d2"/>
        <path d="M3.09,3.88,1.56,3.16a1.5,1.5,0,0,1-.73-2L1.09.61h0l0,0H1l0,0H1L.92.73l0,0,0,0,0,0,0,0,0,0,0,0,0,0V1L.66,1V1l0,0,0,0,0,.07h0l0,.05v0l0,.07h0a1.62,1.62,0,0,0-.13.41A1.13,1.13,0,0,0,.32,2v.09a1.78,1.78,0,0,0,.1.56l0,.08a1.79,1.79,0,0,0,.37.54,1.54,1.54,0,0,0,.49.34l1.58.74Z" fill="#268d62"/>
        <path d="M6.45,1.85,2.9.19a2,2,0,0,0-2.71,1h0a2,2,0,0,0,1,2.71L4.73,5.55a2,2,0,0,0,2.71-1h0A2,2,0,0,0,6.45,1.85ZM1.31,3.58A1.7,1.7,0,0,1,.48,1.31h0A1.71,1.71,0,0,1,2.75.49l1.58.73L2.89,4.32Zm5.84.84a1.71,1.71,0,0,1-2.27.83L3.23,4.48l1.45-3.1,1.64.77a1.71,1.71,0,0,1,.83,2.27Z"/>
      </svg>
    );
  };