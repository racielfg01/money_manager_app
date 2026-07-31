import React from 'react';
import * as LucideIcons from 'lucide-react';

const toPascal = (name) => name.replace(/(?:^|-|_)(\w)/g, (_, c) => c.toUpperCase());

const Icon = ({ name, size = 20, className = "", strokeWidth = 2 }) => {
  const IconComponent = LucideIcons[name] || LucideIcons[toPascal(name)];
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
};

export default Icon;
