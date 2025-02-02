import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 } from '@mui/icons-material';

const ThemeSwitch = ({ toggleTheme }) => {
  return (
    <Tooltip title="Toggle light/dark theme">
      <IconButton onClick={toggleTheme} color="inherit">
        <Brightness4 />
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitch; 