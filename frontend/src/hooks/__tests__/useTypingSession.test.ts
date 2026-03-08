import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTypingSession } from '../useTypingSession';

function createKeyboardEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true });
}

describe('useTypingSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello world' })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.isStarted).toBe(false);
    expect(result.current.wpm).toBe(0);
    expect(result.current.errors).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.characters).toHaveLength(11);
    expect(result.current.characters[0].status).toBe('current');
  });

  it('starts the session when start() is called', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isStarted).toBe(true);
  });

  it('tracks correct input after starting', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.characters[0].status).toBe('correct');
    expect(result.current.errors).toBe(0);
  });

  it('tracks errors on wrong input', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('x'));
    });

    expect(result.current.errors).toBe(1);
    expect(result.current.characters[0].status).toBe('incorrect');
  });

  it('handles backspace', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('e'));
    });

    expect(result.current.currentIndex).toBe(2);

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('Backspace'));
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.characters[1].status).toBe('current');
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('e'));
    });

    expect(result.current.progress).toBe(40);
  });

  it('marks session as complete when text is finished', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hi', onComplete })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('i'));
    });

    expect(result.current.isCompleted).toBe(true);
    expect(onComplete).toHaveBeenCalled();
  });

  it('resets session correctly', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('e'));
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isStarted).toBe(false);
    expect(result.current.errors).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.characters[0].status).toBe('current');
  });

  it('ignores input when not started', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isStarted).toBe(false);
  });

  it('tracks combo on consecutive correct keys', () => {
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello' })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('e'));
      result.current.handleKeyDown(createKeyboardEvent('l'));
    });

    expect(result.current.combo.current).toBe(3);
    expect(result.current.combo.isActive).toBe(true);
  });

  it('breaks combo on error', () => {
    const onComboBreak = vi.fn();
    const { result } = renderHook(() =>
      useTypingSession({ text: 'hello', onComboBreak })
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('h'));
      result.current.handleKeyDown(createKeyboardEvent('e'));
    });

    expect(result.current.combo.current).toBe(2);

    act(() => {
      result.current.handleKeyDown(createKeyboardEvent('x'));
    });

    expect(result.current.combo.current).toBe(0);
    expect(result.current.combo.isActive).toBe(false);
    expect(onComboBreak).toHaveBeenCalledWith(2, 2);
  });
});
