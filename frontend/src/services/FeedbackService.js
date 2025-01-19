// FeedbackService.js
import { useHttp } from '../hooks/http.hook';

export const useFeedbackService = () => {
    const { request } = useHttp();

    const uploadFile = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            return await request('/api/files/upload', 'POST', formData);
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    };

    const uploadFiles = async (files) => {
        try {
            const uploadPromises = Array.from(files).map(uploadFile);
            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading files:', error);
            throw error;
        }
    };

    const sendFeedback = async (feedbackData) => {
        try {
            return await request('/api/feedback', 'POST', feedbackData);
        } catch (error) {
            console.error('Error sending feedback:', error);
            throw error;
        }
    };

    return { sendFeedback, uploadFiles };
};