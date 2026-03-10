import { Component, type ComponentChildren } from 'preact';

interface Props {
    children: ComponentChildren;
    onError?: (error: Error) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('DerinChat Error:', error, errorInfo);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#EF4444', // Red-500
                    textAlign: 'center',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    margin: '10px'
                }}>
                    <h3>Widget Error</h3>
                    <p style={{ fontSize: '12px' }}>Something went wrong in the chat widget.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
