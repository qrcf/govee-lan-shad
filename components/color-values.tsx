import React from "react";

export function ColorValues({ color }: {color: {r: number, g: number, b: number}, brightness: number, temperature: number}) {
    return (
        <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-md bg-muted">
                <div className="text-sm font-medium text-muted-foreground">
                    R
                </div>
                <div className="text-lg font-bold">
                    {color.r}
                </div>
            </div>
            <div className="p-2 rounded-md bg-muted">
                <div className="text-sm font-medium text-muted-foreground">
                    G
                </div>
                <div className="text-lg font-bold">
                    {color.g}
                </div>
            </div>
            <div className="p-2 rounded-md bg-muted">
                <div className="text-sm font-medium text-muted-foreground">
                    B
                </div>
                <div className="text-lg font-bold">
                    {color.b}
                </div>
            </div>
        </div>
    );
}
