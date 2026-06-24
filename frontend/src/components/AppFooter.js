import React from 'react';
import { Box, Button, Container, Divider, Typography } from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';

const AppFooter = ({ onOpenFeedback }) => (
  <Box component="footer" sx={{ mt: 4, py: 3, bgcolor: 'grey.100', borderTop: 1, borderColor: 'divider' }}>
    <Container maxWidth="xl">
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Контакты
          </Typography>
          <Typography variant="body2" color="text.secondary">
            По вопросам работы приложения используйте форму обратной связи.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FeedbackIcon />}
          onClick={onOpenFeedback}
        >
          Обратная связь
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary">
        Страховой оценочный листок — расчёт по нормам оценки строений
      </Typography>
    </Container>
  </Box>
);

export default AppFooter;
