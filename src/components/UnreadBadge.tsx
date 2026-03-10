// Unread Badge Component

import type { UnreadBadgeConfig } from '../types';

interface UnreadBadgeProps {
    count: number;
    config?: UnreadBadgeConfig;
}

export function UnreadBadge({ count, config }: UnreadBadgeProps) {
    // Don't render if disabled or count is 0
    if (config?.enabled === false || count === 0) {
        return null;
    }

    const maxCount = config?.maxCount || 99;
    const displayCount = count > maxCount ? `${maxCount}+` : count;
    const position = config?.position || 'top-right';
    const backgroundColor = config?.backgroundColor || '#EF4444';
    const textColor = config?.textColor || '#FFFFFF';
    const animate = config?.animate !== false;

    return (
        <div
            class={`unread-badge ${position} ${animate ? 'pulse' : ''}`}
            style={{
                backgroundColor,
                color: textColor,
            }}
            aria-label={`${count} unread message${count !== 1 ? 's' : ''}`}
        >
            {displayCount}
        </div>
    );
}
