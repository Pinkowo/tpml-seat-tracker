import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ClosingWarning } from '@/components/library-detail/ClosingWarning';

describe('ClosingWarning', () => {
  it('renders critical warning when closing in <= 15 minutes', () => {
    render(<ClosingWarning closingInMinutes={10} />);
    const message = screen.getByText('即將閉館（10 分鐘）');
    expect(message).toBeInTheDocument();
    expect(message.className).toContain('text-[#D45251]');
  });

  it('renders reminder when closing in <= 60 minutes', () => {
    render(<ClosingWarning closingInMinutes={45} />);
    const message = screen.getByText('距離閉館 45 分鐘');
    expect(message).toBeInTheDocument();
    expect(message.className).toContain('text-[#FD853A]');
  });

  it('renders nothing when closing is more than 60 minutes away', () => {
    const { container } = render(<ClosingWarning closingInMinutes={120} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when closing time is not provided', () => {
    const { container } = render(<ClosingWarning closingInMinutes={undefined} />);
    expect(container.firstChild).toBeNull();
  });
});
