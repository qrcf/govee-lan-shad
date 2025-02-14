import React from "react";
import { LightbulbIcon } from "lucide-react";

export function LightPreview({ state }: { state: {on: boolean, color: {r: number, g: number, b: number}, brightness: number, temperature: number}}) {
    const { on, color, brightness, temperature } = state;

    // Adjust color based on temperature (warm to cool)
    const tempAdjustedColor = {
        r: Math.min(255, color.r + (temperature - 50) * 2),
        g: Math.min(255, color.g + (temperature - 50)),
        b: Math.min(255, color.b - (temperature - 50) * 2),
    };

    // Calculate brightness-adjusted color
    const brightnessMultiplier = brightness / 100;
    const finalColor = {
        r: Math.round(tempAdjustedColor.r * brightnessMultiplier),
        g: Math.round(tempAdjustedColor.g * brightnessMultiplier),
        b: Math.round(tempAdjustedColor.b * brightnessMultiplier),
    };

    const rgbaColor = `rgba(${finalColor.r}, ${finalColor.g}, ${finalColor.b}, ${
        on ? 0.2 : 0.05
    })`;

    return (
        <div
            className="relative h-48 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden"
        >
            <div
                className="absolute inset-0 blur-3xl transition-all duration-500"
                style={{
                    backgroundColor: rgbaColor,
                    opacity: on ? brightness / 100 : 0.2,
                }}
            />

            <LightbulbIcon
                className="w-20 h-20 transition-all duration-500"
                style={{
                    color: on
                        ? `rgb(${finalColor.r}, ${finalColor.g}, ${finalColor.b})`
                        : "currentColor",
                    opacity: on ? brightness / 100 : 0.5,
                    transform: `scale(${0.8 + (brightness / 100) * 0.4})`,
                }}
            />
        </div>
    );
}
