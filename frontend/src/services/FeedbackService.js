import { useHttp } from '../hooks/http.hook';

export const useFeedbackService = () => {
  const { request } = useHttp();

  const sendFeedback = async (feedbackData) => {
    try {
      return await request('/api/feedback', 'POST', feedbackData);
    } catch (error) {
      console.error('Error sending feedback:', error);
      throw error;
    }
  };

  return { sendFeedback };
}; 