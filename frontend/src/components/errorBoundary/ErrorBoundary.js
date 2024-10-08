import {Component} from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <h2>Что-то пошло не так.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;