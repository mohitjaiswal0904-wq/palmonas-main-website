import { render, screen } from '@testing-library/react';

import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('renders with the provided accessible label', () => {
    render(
      <label>
        Cover Letter
        <Textarea aria-label="Cover Letter" />
      </label>,
    );

    expect(screen.getByLabelText('Cover Letter')).toBeInTheDocument();
  });

  it('forwards ref to the underlying textarea element', () => {
    const ref = { current: null as HTMLTextAreaElement | null };

    render(<Textarea ref={ref} aria-label="Notes" />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('merges custom class names', () => {
    render(<Textarea aria-label="Notes" className="custom-class" />);
    expect(screen.getByLabelText('Notes')).toHaveClass('custom-class');
  });

  it('defaults to text-base to avoid iOS Safari focus zoom', () => {
    render(<Textarea aria-label="Bio" />);
    expect(screen.getByLabelText('Bio').className).toContain('text-base');
    expect(screen.getByLabelText('Bio').className).not.toContain('text-sm');
  });

  it('supports the disabled attribute', () => {
    render(<Textarea aria-label="Notes" disabled />);
    expect(screen.getByLabelText('Notes')).toBeDisabled();
  });
});
