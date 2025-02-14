'use client';

import { forwardRef } from 'react';
import { RgbColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import { useForwardedRef } from '@/lib/use-forwarded-ref';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
    value: { r: number; g: number; b: number };
    onChange: (value: { r: number; g: number; b: number }) => void;
    onBlur?: () => void;
    disabled?: boolean; // Add disabled property
}

const ColorPicker = forwardRef<
    HTMLInputElement,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange' | 'onBlur' | 'disabled'> & ColorPickerProps
>(
    ({ disabled, value, onChange, onBlur, className, ...props }, forwardedRef) => {
        const ref = useForwardedRef(forwardedRef);

        return (
            <div
                {...props}
                className={cn(
                    'flex flex-col items-center space-y-4 w-full max-w-xs sm:max-w-sm', // Aligns content properly
                    disabled ? 'opacity-50 pointer-events-none' : '',
                    className
                )}
                // name={name}
            >
                {/* Inline RGB Color Picker */}
                <RgbColorPicker color={value} onChange={onChange} />

                {/* Inline RGB Inputs */}
                <div className="flex justify-between w-full space-x-2">
                    <Input
                        maxLength={3}
                        value={value.r}
                        onChange={(e) =>
                            onChange({ ...value, r: Math.min(Number(e.target.value), 255) })
                        }
                        onBlur={onBlur}
                        ref={ref}
                        placeholder="R"
                        className="text-center"
                    />
                    <Input
                        maxLength={3}
                        value={value.g}
                        onChange={(e) =>
                            onChange({ ...value, g: Math.min(Number(e.target.value), 255) })
                        }
                        onBlur={onBlur}
                        ref={ref}
                        placeholder="G"
                        className="text-center"
                    />
                    <Input
                        maxLength={3}
                        value={value.b}
                        onChange={(e) =>
                            onChange({ ...value, b: Math.min(Number(e.target.value), 255) })
                        }
                        onBlur={onBlur}
                        ref={ref}
                        placeholder="B"
                        className="text-center"
                    />
                </div>
            </div>
        );
    }
);

ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };