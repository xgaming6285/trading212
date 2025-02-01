import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const ThemeSwitch = ({ toggleTheme }) => {
  const theme = useTheme();
  
  return (
    <IconButton 
      onClick={toggleTheme} 
      color="inherit" 
      aria-label="toggle theme"
      sx={{ ml: 1 }}
    >
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeSwitch; 