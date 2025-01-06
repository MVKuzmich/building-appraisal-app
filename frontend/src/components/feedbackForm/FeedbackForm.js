import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import { useFeedbackService } from '../../services/FeedbackService';

const FeedbackForm = ({ open, onClose }) => {
  const { sendFeedback } = useFeedbackService();
  const [formData, setFormData] = useState({
    message: '',
    email: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendFeedback({
        ...formData,
        date: new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: 'Спасибо за ваше сообщение!',
        severity: 'success'
      });
      
      setFormData({ message: '', email: '' });
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при отправке сообщения',
        severity: 'error'
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Обратная связь
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="message"
                label="Ваше сообщение"
                multiline
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email (необязательно)"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                helperText="Оставьте email, если хотите получить ответ"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              Отправить
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FeedbackForm; 