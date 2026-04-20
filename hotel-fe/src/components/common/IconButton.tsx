import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

interface IconButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: string;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ label, icon, onClick, variant = 'outline-secondary', size = 'sm', disabled, className }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip>{label}</Tooltip>}>
    <Button variant={variant} size={size} onClick={onClick} disabled={disabled} className={className}>
      {icon}
    </Button>
  </OverlayTrigger>
);

export default IconButton;
