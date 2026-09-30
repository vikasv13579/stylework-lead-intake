import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../components/StatusBadge';

describe('StatusBadge', () => {
  const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'] as const;

  statuses.forEach((status) => {
    it(`renders the "${status}" badge with correct label`, () => {
      render(<StatusBadge status={status} />);
      const label = status.charAt(0) + status.slice(1).toLowerCase();
      expect(screen.getByText(label)).toBeTruthy();
    });
  });
});
