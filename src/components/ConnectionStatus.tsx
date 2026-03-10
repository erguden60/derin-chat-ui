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
                    icon: '🟢',
                    label: 'Connected',
                    color: '#10b981',
                    className: 'connected',
                };
            case 'connecting':
                return {
                    icon: '🟡',
                    label: 'Connecting...',
                    color: '#f59e0b',
                    className: 'connecting',
                };
            case 'reconnecting':
                return {
                    icon: '🟡',
                    label: 'Reconnecting...',
                    color: '#f59e0b',
                    className: 'reconnecting',
                };
            case 'disconnected':
                return {
                    icon: '🔴',
                    label: 'Disconnected',
                    color: '#ef4444',
                    className: 'disconnected',
                };
            case 'failed':
                return {
                    icon: '🔴',
                    label: 'Connection Failed',
                    color: '#dc2626',
                    className: 'failed',
                };
            default:
                return {
                    icon: '⚪',
                    label: 'Idle',
                    color: '#9ca3af',
                    className: 'idle',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`connection-status ${config.className}`} title={config.label}>
            <span className="status-dot" style={{ color: config.color }}>
                {config.icon}
            </span>
            {showLabel && <span className="status-label">{config.label}</span>}
        </div>
    );
}
