import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 20, className = "", strokeWidth = 2 }) => {
  const IconComponent = LucideIcons[name];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};

export default Icon;
