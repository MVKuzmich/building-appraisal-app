import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const ContactsPage = () => {
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Контакты
        </Typography>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="body1">
            Свяжитесь с нами через следующие каналы:
          </Typography>
          <ul>
            <li>Email: example@example.com</li>
            <li>Телефон: +7 (123) 456-78-90</li>
          </ul>
          {/* Здесь можно добавить форму обратной связи */}
        </Paper>
      </Box>
    </Container>
  );
};

export default ContactsPage;