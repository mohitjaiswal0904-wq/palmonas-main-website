import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from '@/lib/toast/app-toast';

describe('app-toast helpers', () => {
  it('delegates typed variants to show()', () => {
    const show = jest.fn(() => 'toast-id');

    showSuccessToast(show, 'Saved');
    showErrorToast(show, 'Failed');
    showWarningToast(show, 'Soon');
    showInfoToast(show, 'Note');

    expect(show).toHaveBeenNthCalledWith(1, 'Saved', { type: 'success' });
    expect(show).toHaveBeenNthCalledWith(2, 'Failed', { type: 'danger' });
    expect(show).toHaveBeenNthCalledWith(3, 'Soon', { type: 'warning' });
    expect(show).toHaveBeenNthCalledWith(4, 'Note', { type: 'normal' });
  });
});
