import { afterEach, describe, expect, it } from 'vitest';
import DerinChat from './index';

describe('DerinChat multi-instance support', () => {
  afterEach(() => {
    DerinChat.destroy('default');
    DerinChat.destroy('support');
    DerinChat.destroy('sales');
    document.body.innerHTML = '';
  });

  it('mounts multiple isolated instances at the same time', () => {
    const supportTarget = document.createElement('div');
    supportTarget.id = 'support-root';
    document.body.appendChild(supportTarget);

    const salesTarget = document.createElement('div');
    salesTarget.id = 'sales-root';
    document.body.appendChild(salesTarget);

    DerinChat.init({
      instanceId: 'support',
      target: '#support-root',
      mock: true,
      ui: {
        texts: {
          title: 'Support',
        },
      },
    });

    DerinChat.init({
      instanceId: 'sales',
      target: '#sales-root',
      mock: true,
      ui: {
        texts: {
          title: 'Sales',
        },
      },
    });

    expect(document.getElementById('derin-chat-host-support')).toBeInTheDocument();
    expect(document.getElementById('derin-chat-host-sales')).toBeInTheDocument();
    expect(DerinChat.isActive('support')).toBe(true);
    expect(DerinChat.isActive('sales')).toBe(true);
  });

  it('destroys only the requested instance', () => {
    DerinChat.init({
      instanceId: 'support',
      mock: true,
    });

    DerinChat.init({
      instanceId: 'sales',
      mock: true,
      target: document.body,
    });

    DerinChat.destroy('support');

    expect(document.getElementById('derin-chat-host-support')).not.toBeInTheDocument();
    expect(document.getElementById('derin-chat-host-sales')).toBeInTheDocument();
    expect(DerinChat.isActive('support')).toBe(false);
    expect(DerinChat.isActive('sales')).toBe(true);
  });
});
