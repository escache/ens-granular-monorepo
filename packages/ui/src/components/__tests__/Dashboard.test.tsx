import { describe, it, expect } from 'vitest';
import { render, screen } from '../../utils/test-utils';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays overview text', () => {
    render(<Dashboard />);
    expect(screen.getByText('Overview of your ENS delegation management')).toBeInTheDocument();
  });

  it('shows stats cards', () => {
    render(<Dashboard />);
    expect(screen.getByText('Connected Wallet')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
    expect(screen.getByText('Recent Domains')).toBeInTheDocument();
    expect(screen.getByText('Favorite Projects')).toBeInTheDocument();
  });
});
