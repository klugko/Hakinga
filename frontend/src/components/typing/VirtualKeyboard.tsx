import { memo } from 'react';
import { cn } from '@/lib/utils';

interface KeyState {
  pressed: boolean;
  error: boolean;
}

interface VirtualKeyboardProps {
  pressedKey: string | null;
  isError: boolean;
  className?: string;
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Ctrl'],
];

const KEY_WIDTHS: Record<string, string> = {
  Backspace: 'w-20',
  Tab: 'w-14',
  Caps: 'w-16',
  Enter: 'w-18',
  Shift: 'w-20',
  Ctrl: 'w-12',
  Win: 'w-10',
  Alt: 'w-10',
  Space: 'w-64',
};

/**
 * Maps a pressed key to the corresponding keyboard key label.
 */
function normalizeKey(key: string): string {
  if (key === ' ') return 'Space';
  if (key === 'Control') return 'Ctrl';
  if (key === 'Meta') return 'Win';
  return key.toLowerCase();
}

/**
 * Renders a single keyboard key.
 */
const KeyboardKey = memo(function KeyboardKey({
  keyLabel,
  state,
}: {
  keyLabel: string;
  state: KeyState;
}) {
  const width = KEY_WIDTHS[keyLabel] || 'w-10';
  const displayLabel = keyLabel === 'Space' ? '' : keyLabel;

  return (
    <div
      className={cn(
        'h-10 flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-100',
        'border border-[#2a2a2a] bg-[#1a1a1a]',
        width,
        state.pressed && state.error && 'bg-[#ef4444] border-[#ef4444] text-white scale-95',
        state.pressed && !state.error && 'bg-[#8b5cf6] border-[#8b5cf6] text-white scale-95',
        !state.pressed && 'text-[#71717a] hover:bg-[#252525]'
      )}
    >
      {displayLabel}
    </div>
  );
});

/**
 * Virtual keyboard component that displays pressed keys and errors.
 * Highlights the currently pressed key and shows errors in red.
 */
function VirtualKeyboard({ pressedKey, isError, className }: VirtualKeyboardProps) {
  const normalizedPressedKey = pressedKey ? normalizeKey(pressedKey) : null;

  const getKeyState = (keyLabel: string): KeyState => {
    const keyLower = keyLabel.toLowerCase();
    const isPressed = normalizedPressedKey === keyLower ||
                      normalizedPressedKey === keyLabel ||
                      (keyLabel === 'Shift' && normalizedPressedKey === 'shift') ||
                      (keyLabel === 'Space' && normalizedPressedKey === 'space');

    return {
      pressed: isPressed,
      error: isPressed && isError,
    };
  };

  return (
    <div className={cn('flex flex-col items-center gap-1.5 p-4 bg-[#0f0f0f] rounded-xl', className)}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {row.map((key, keyIndex) => (
            <KeyboardKey key={`${rowIndex}-${keyIndex}`} keyLabel={key} state={getKeyState(key)} />
          ))}
        </div>
      ))}
    </div>
  );
}

export { VirtualKeyboard };
