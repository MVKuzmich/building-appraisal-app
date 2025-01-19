// FeedbackForm.js
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
    Alert,
    LinearProgress,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction
} from '@mui/material';
import { useFeedbackService } from '../../services/FeedbackService';
import {
    Image as ImageIcon,
    Description as DocumentIcon,
    PictureAsPdf as PdfIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const FeedbackForm = ({ open, onClose }) => {
    const { sendFeedback, uploadFiles } = useFeedbackService();
    const [formData, setFormData] = useState({
        message: '',
        email: '',
    });
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
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

    const handleFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // Загрузка файлов
            let uploadedFiles = [];
            if (files.length > 0) {
                uploadedFiles = await uploadFiles(files);
            }

            // Отправка данных формы
            const feedbackData = {
                ...formData,
                date: new Date().toISOString(),
                attachments: uploadedFiles
            };

            await sendFeedback(feedbackData);

            setSnackbar({
                open: true,
                message: 'Спасибо за ваше сообщение!',
                severity: 'success'
            });
            setFormData({ message: '', email: '' });
            setFiles([]);
            onClose();
        } catch (error) {
            console.error('Error details:', error);
            setSnackbar({
                open: true,
                message: 'Произошла ошибка при отправке сообщения',
                severity: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return <PdfIcon color="error" />;
            case 'doc':
            case 'docx':
                return <DocumentIcon color="primary" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <ImageIcon color="success" />;
            default:
                return <DocumentIcon />;
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
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx"
                            />

                            {files.length > 0 && (
                                <List dense>
                                    {files.map((file, index) => (
                                        <ListItem key={index} sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                            <ListItemIcon>
                                                {getFileIcon(file.name)}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={file.name}
                                                secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton 
                                                    edge="end" 
                                                    size="small"
                                                    onClick={() => handleRemoveFile(index)}
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            )}

                            {uploading && <LinearProgress />}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose} disabled={uploading}>
                            Отмена
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={uploading}
                        >
                            {uploading ? 'Отправка...' : 'Отправить'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
            
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    severity={snackbar.severity} 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default FeedbackForm;