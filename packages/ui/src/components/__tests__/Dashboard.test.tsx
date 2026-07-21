import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('ENS Management Overview')).toBeInTheDocument();
  });

  it('displays stat cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Domains')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('shows recent activity sections', () => {
    render(<Dashboard />);
    expect(screen.getByText('Recent Domains')).toBeInTheDocument();
    expect(screen.getByText('Favorite Projects')).toBeInTheDocument();
  });
});
