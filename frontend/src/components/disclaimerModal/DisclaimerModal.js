import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

const DisclaimerModal = ({ open, onAccept }) => {
  return (
    <Dialog 
      open={open} 
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" align="center">
          Важное уведомление
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" paragraph>
            Уважаемый пользователь! Данное приложение находится в стадии разработки и тестирования.
          </Typography>
          <Typography variant="body1" paragraph>
            Обратите внимание на следующие важные моменты:
          </Typography>
          <Typography component="div" variant="body1">
            <ul>
              <li>Приложение предоставляется по принципу "как есть" и находится в стадии активной разработки</li>
              <li>Разработчики не несут ответственности за точность и достоверность результатов расчетов</li>
              <li>Все результаты следует рассматривать как предварительные и требующие профессиональной проверки</li>
              <li>Рекомендуется перепроверять все полученные результаты</li>
            </ul>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            Продолжая использование приложения, вы подтверждаете, что понимаете его текущий статус и ограничения.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          onClick={onAccept}
          fullWidth
          sx={{ m: 2 }}
        >
          Я понимаю и согласен продолжить работу
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DisclaimerModal; 