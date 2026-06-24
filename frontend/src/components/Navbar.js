import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';

const Navbar = () => (
  <AppBar position="static" color="default" elevation={1}>
    <Toolbar>
      <HomeWorkIcon sx={{ mr: 1.5, color: 'primary.main' }} />
      <Typography variant="h6" component="h1" color="text.primary" sx={{ fontWeight: 600 }}>
        Оценка строений
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}>
        Поиск типа → заполнение → оценочный лист
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;
