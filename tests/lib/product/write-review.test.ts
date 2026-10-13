import {
  isWriteReviewSubmitEnabled,
  validateWriteReviewForm,
} from '@/lib/product/write-review';

jest.mock('@/config/product/product.config', () => ({
  productConfig: {
    reviews: {
      write: {
        minBodyLength: 10,
        maxBodyLength: 500,
        maxFileBytes: 10,
        acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      },
    },
  },
}));

describe('validateWriteReviewForm', () => {
  it('passes when rating and body meet limits', () => {
    expect(
      validateWriteReviewForm({
        rating: 5,
        body: 'Great product',
        image: null,
      }),
    ).toBeNull();
  });

  it('accepts a valid small jpeg', () => {
    const image = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    expect(
      validateWriteReviewForm({
        rating: 4,
        body: 'Great product',
        image,
      }),
    ).toBeNull();
  });

  it('requires a rating', () => {
    expect(
      validateWriteReviewForm({
        rating: null,
        body: 'Great product',
        image: null,
      }),
    ).toBe('ratingRequired');
  });

  it('rejects body that is too short', () => {
    expect(
      validateWriteReviewForm({
        rating: 5,
        body: 'short',
        image: null,
      }),
    ).toBe('bodyTooShort');
  });

  it('rejects body that is too long', () => {
    expect(
      validateWriteReviewForm({
        rating: 5,
        body: 'x'.repeat(501),
        image: null,
      }),
    ).toBe('bodyTooLong');
  });

  it('rejects unsupported file types', () => {
    const image = new File(['x'], 'a.gif', { type: 'image/gif' });
    expect(
      validateWriteReviewForm({
        rating: 5,
        body: 'Great product',
        image,
      }),
    ).toBe('fileType');
  });

  it('rejects oversized files', () => {
    const image = new File(['abcdefghijklmnop'], 'a.jpg', { type: 'image/jpeg' });
    expect(
      validateWriteReviewForm({
        rating: 5,
        body: 'Great product',
        image,
      }),
    ).toBe('fileTooLarge');
  });
});

describe('isWriteReviewSubmitEnabled', () => {
  it('enables when rating and min body are set', () => {
    expect(
      isWriteReviewSubmitEnabled({
        rating: 3,
        body: '1234567890',
        image: null,
      }),
    ).toBe(true);
  });

  it('disables when rating is missing', () => {
    expect(
      isWriteReviewSubmitEnabled({
        rating: null,
        body: '1234567890',
        image: null,
      }),
    ).toBe(false);
  });

  it('disables when body is too short', () => {
    expect(
      isWriteReviewSubmitEnabled({
        rating: 5,
        body: 'short',
        image: null,
      }),
    ).toBe(false);
  });
});
