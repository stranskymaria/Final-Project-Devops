import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '../../../components/Spinner';

describe('Spinner', () => {
  it('renders spinner component', () => {
    render(<Spinner />);
    
    // Check if the spinner div is rendered
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct CSS classes', () => {
    render(<Spinner />);
    
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toHaveClass('w-12', 'h-12', 'border-4', 'border-brand-light', 'border-t-brand-primary', 'rounded-full', 'animate-spin');
  });
});