import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WriteReviewForm } from '@/components/product/WriteReviewForm';

const mockIsProductFeatureEnabled = jest.fn((_feature: string) => true);

jest.mock('@/config/product/product.config', () => ({
  productConfig: {
    reviews: {
      write: {
        minBodyLength: 10,
        maxBodyLength: 500,
        maxFileBytes: 10485760,
        acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        acceptedExtensions: '.jpg,.jpeg,.png',
      },
    },
  },
  productMessages: {
    reviews: {
      ratingLabel: 'Rating',
      yourReviewLabel: 'Your Review',
      reviewPlaceholder: 'Share your thoughts…',
      uploadFileLabel: 'Upload File (Optional)',
      chooseFile: 'Choose File',
      noFileChosen: 'No file chosen',
      fileFormatsHint: 'Supported formats: JPG, PNG, JPEG (Max 10MB)',
      cancel: 'Cancel',
      submitReview: 'Submit Review',
      writeReviewComingSoon: 'Submitting reviews will be enabled soon.',
      errorToast: 'Could not submit',
      formatMinCharactersHint: (min: number) => `Minimum ${min} characters`,
      formatCharacterCount: (count: number, max: number) => `${count}/${max}`,
      formatRateStarsLabel: (stars: number) => `Rate ${stars} star`,
      formatBodyTooShort: (min: number) => `Review must be at least ${min} characters`,
      formatBodyTooLong: (max: number) => `Review must be at most ${max} characters`,
      validation: {
        ratingRequired: 'Please select a rating',
        fileType: 'Only JPG and PNG images are supported',
        fileTooLarge: 'Image must be 10MB or smaller',
      },
      a11y: {
        chooseReviewImage: 'Choose review image file',
        writeReviewComingSoon: 'Why submit is unavailable',
      },
    },
  },
  isProductFeatureEnabled: (feature: string) => mockIsProductFeatureEnabled(feature),
}));

jest.mock('@/config/theme/product.tokens', () => ({
  productTokens: { ink: '#151515', eddTooltipBg: '#E1E1E1' },
}));

describe('WriteReviewForm', () => {
  beforeEach(() => {
    mockIsProductFeatureEnabled.mockImplementation((_feature: string) => true);
  });

  it('submits rating and body when valid', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onCancel = jest.fn();

    render(<WriteReviewForm isSubmitting={false} onCancel={onCancel} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /rate 5 star/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/share your thoughts/i),
      'Great product yes',
    );
    await userEvent.click(screen.getByRole('button', { name: /submit review/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      rating: 5,
      body: 'Great product yes',
      image: undefined,
    });
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<WriteReviewForm isSubmitting={false} onCancel={onCancel} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks submit when rating is missing', async () => {
    const onSubmit = jest.fn();

    render(
      <WriteReviewForm isSubmitting={false} onCancel={jest.fn()} onSubmit={onSubmit} />,
    );

    await userEvent.type(
      screen.getByPlaceholderText(/share your thoughts/i),
      'Great product yes',
    );

    expect(screen.getByRole('button', { name: /submit review/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows validation when submit is forced with short body after rating', async () => {
    const onSubmit = jest.fn();

    render(
      <WriteReviewForm isSubmitting={false} onCancel={jest.fn()} onSubmit={onSubmit} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /rate 4 star/i }));
    expect(screen.getByRole('button', { name: /submit review/i })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps submit disabled and shows coming-soon tip when writeProductReview is off', async () => {
    mockIsProductFeatureEnabled.mockImplementation(
      (feature: string) => feature !== 'writeProductReview',
    );
    const onSubmit = jest.fn();

    render(
      <WriteReviewForm isSubmitting={false} onCancel={jest.fn()} onSubmit={onSubmit} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /rate 5 star/i }));
    await userEvent.type(
      screen.getByPlaceholderText(/share your thoughts/i),
      'Great product yes',
    );

    expect(screen.getByRole('button', { name: /submit review/i })).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /why submit is unavailable/i }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Submitting reviews will be enabled soon.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('hides coming-soon tip when writeProductReview is on', () => {
    render(
      <WriteReviewForm isSubmitting={false} onCancel={jest.fn()} onSubmit={jest.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: /why submit is unavailable/i }),
    ).not.toBeInTheDocument();
  });
});
