// Connection Status Indicator Component

import type { ConnectionStatus } from '../types';

interface ConnectionStatusProps {
    status: ConnectionStatus;
    showLabel?: boolean;
}

export function ConnectionStatusIndicator({ status, showLabel = false }: ConnectionStatusProps) {
    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    label: 'Connected',
                    color: '#10b981',
                    className: 'connected',
                };
            case 'connecting':
                return {
                    label: 'Connecting...',
                    color: '#f59e0b',
                    className: 'connecting',
                };
            case 'reconnecting':
                return {
                    label: 'Reconnecting...',
                    color: '#f59e0b',
                    className: 'reconnecting',
                };
            case 'disconnected':
                return {
                    label: 'Disconnected',
                    color: '#ef4444',
                    className: 'disconnected',
                };
            case 'failed':
                return {
                    label: 'Connection Failed',
                    color: '#dc2626',
                    className: 'failed',
                };
            default:
                return {
                    label: 'Idle',
                    color: '#9ca3af',
                    className: 'idle',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`connection-status ${config.className}`} title={config.label}>
            <span className="status-dot" style={{ backgroundColor: config.color }} />
            {showLabel && <span className="status-label">{config.label}</span>}
        </div>
    );
}
