import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';

interface Option {
  label: string;
  value: string;
}

interface StyledDropdownProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const itemVariants = {
  hover: { x: 3 },
  tap: { scale: 0.98 }
};

export const StyledDropdown: React.FC<StyledDropdownProps> = ({ label, options, value, onChange }) => {
  const selectedLabel = options.find(opt => opt.value === value)?.label || label;

  return (
    <Dropdown>
      <Dropdown.Toggle
        as={motion.button}
        type="button"
        whileHover={{ scale: 1.02 }}
        className="styled-dropdown-toggle"
      >
        <span>{selectedLabel}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="styled-dropdown-menu">
        {options.map(option => (
          <Dropdown.Item
            key={option.value}
            as={motion.div}
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
            className="styled-dropdown-item"
            active={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};