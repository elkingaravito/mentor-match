import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupApiStore } from '../../utils/test-utils';
import { wsApi, wsService } from '../websocket';

describe('WebSocket Service', () => {
    const storeRef = setupApiStore(wsApi);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        wsService.disconnect();
    });

    it('should connect to WebSocket server', () => {
        wsService.connect();
        expect(wsService['socket']).toBeTruthy();
    });

    it('should handle subscription and unsubscription', () => {
        const callback = jest.fn();
        const unsubscribe = wsService.subscribe('test_event', callback);

        // Simulate message
        wsService['notifyListeners']('test_event', { data: 'test' });
        expect(callback).toHaveBeenCalledWith({ data: 'test' });

        unsubscribe();
        wsService['notifyListeners']('test_event', { data: 'test2' });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple subscribers', () => {
        const callback1 = jest.fn();
        const callback2 = jest.fn();

        wsService.subscribe('test_event', callback1);
        wsService.subscribe('test_event', callback2);

        wsService['notifyListeners']('test_event', { data: 'test' });

        expect(callback1).toHaveBeenCalledWith({ data: 'test' });
        expect(callback2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle disconnection', () => {
        wsService.connect();
        wsService.disconnect();
        expect(wsService['socket']).toBeNull();
    });
});