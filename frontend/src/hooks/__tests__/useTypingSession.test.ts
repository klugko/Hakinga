import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingSession } from '../useTypingSession';

describe('useTypingSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello world' })
    );

    expect(result.current.userInput).toBe('');
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isActive).toBe(false);
    expect(result.current.wpm).toBe(0);
    expect(result.current.accuracy).toBe(100);
    expect(result.current.errors).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('starts the session on first keystroke', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.handleKeyPress('h');
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.userInput).toBe('h');
  });

  it('tracks correct input', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi' })
    );

    act(() => {
      result.current.handleKeyPress('h');
      result.current.handleKeyPress('i');
    });

    expect(result.current.userInput).toBe('hi');
    expect(result.current.errors).toBe(0);
    expect(result.current.accuracy).toBe(100);
  });

  it('tracks errors', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi' })
    );

    act(() => {
      result.current.handleKeyPress('x'); // Wrong key
    });

    expect(result.current.errors).toBe(1);
    expect(result.current.accuracy).toBeLessThan(100);
  });

  it('handles backspace', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.handleKeyPress('h');
      result.current.handleKeyPress('e');
      result.current.handleBackspace();
    });

    expect(result.current.userInput).toBe('h');
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.handleKeyPress('h');
      result.current.handleKeyPress('e');
    });

    expect(result.current.progress).toBe(40); // 2/5 = 40%
  });

  it('marks session as complete when text is finished', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi', onComplete })
    );

    act(() => {
      result.current.handleKeyPress('h');
      result.current.handleKeyPress('i');
    });

    expect(result.current.isComplete).toBe(true);
    expect(onComplete).toHaveBeenCalled();
  });

  it('calculates WPM over time', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello world test' })
    );

    // Start typing
    act(() => {
      result.current.handleKeyPress('h');
    });

    // Advance time by 1 minute
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Type more characters (simulate typing ~10 characters)
    act(() => {
      'ello worl'.split('').forEach(char => {
        result.current.handleKeyPress(char);
      });
    });

    // WPM should be calculated (10 chars / 5 = 2 words, over 1 minute = 2 WPM)
    // Note: actual calculation may vary based on implementation
    expect(result.current.wpm).toBeGreaterThan(0);
  });

  it('resets session correctly', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.handleKeyPress('h');
      result.current.handleKeyPress('e');
      result.current.reset();
    });

    expect(result.current.userInput).toBe('');
    expect(result.current.isActive).toBe(false);
    expect(result.current.errors).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('respects disabled state', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello', disabled: true })
    );

    act(() => {
      result.current.handleKeyPress('h');
    });

    expect(result.current.userInput).toBe('');
    expect(result.current.isActive).toBe(false);
  });
});
