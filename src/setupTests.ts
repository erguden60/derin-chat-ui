import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/preact';
import { afterEach } from 'vitest';

// Automatically cleanup after each test
afterEach(() => {
    cleanup();
});
