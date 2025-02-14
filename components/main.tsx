"use client"
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2, PowerIcon, SunIcon, ThermometerIcon} from "lucide-react";
import {LightPreview} from "@/components/light-preview";
import {ColorValues} from "@/components/color-values";
import {HexColorInput, HexColorPicker} from "react-colorful";
import {Slider} from "@/components/ui/slider";
import React, {useEffect, useState} from "react";

const buildCommand = (command: string, data: {[key: string]: number|string|{r: number, g: number, b: number}}) => {
    return {
        "msg": {
            "cmd": command,
            "data": data
        }
    }
}
export default function MainClient() {
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({
        on: true,
        color: { r: 183, g: 38, b: 88 },
        brightness: 75,
        temperature: 50,
    });

    // const [messages, setMessages] = useState([]);
    // const [input, setInput] = useState('');
    const [socket, setSocket] = useState<WebSocket|null>(null);

    useEffect(() => {
        // Connect to WebSocket server
        const ws = new WebSocket('ws://localhost:8080');
        setSocket(ws);

        ws.onmessage = (event) => {

            const data = event.data
            const dict = JSON.parse(data)
            const cmd = dict.msg.cmd
            if (cmd === 'devStatus') {
                console.log(dict.msg)
                setLoading(false)
                setState({
                    on: dict.msg.data['onOff'] === 1,
                    brightness: dict.msg.data['brightness'],
                    color: dict.msg.data.color,
                    temperature: dict.msg.data.colorTemInKelvin
                })

            }

            // setMessages((prev) => [...prev, event.data]);
        };

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            ws.send(JSON.stringify(buildCommand('devStatus', {})));

        }
        ws.onclose = () => console.log('WebSocket connection closed');
        ws.onerror = (error) => console.error('WebSocket error:', error);

        // Cleanup on unmount
        return () => {
            ws.close();
        };
    }, []);

    const sendMessage = (command: string, data: {[key: string]: number|string|{r: number, g: number, b: number}}) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(buildCommand(command, data)));

        } else {
            console.error('WebSocket is not open');
        }
    };

    useEffect(() => {
        console.log(state)

    }, [state]);

    const handleColorChange = (hexColor: string) => {
        // Convert hex to RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        const color = result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : state.color;

        sendMessage('colorwc', {
            color: color,
            colorTemInKelvin: state.temperature
        })
        setState((prev) => ({ ...prev, color }));
    };

    const handleToggle = () => {
        sendMessage('turn', { value: state.on ? 0 : 1 });
        setState((prev) => ({ ...prev, on: !prev.on }));
    };

    // Convert RGB to Hex for the color picker
    const rgbToHex = (r: number, g: number, b: number) =>
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("");

    if (loading) {
        return <div className={"flex flex-col items-center justify-center"} style={{height: "100vh"}}>
            <Loader2 className={"animate-spin h-16 w-16 mx-auto my-16"}/>
        </div>
    }

    return (
    <div
        className="min-h-screen bg-gradient-to-b from-background to-muted p-8"
    >
        <div className="max-w-2xl mx-auto space-y-8">
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">
                        Desk Light
                    </h1>
                    <Button
                        variant={state.on ? "outline" : "destructive"}
                        onClick={handleToggle}
                        size="icon"
                        className="w-10 h-10 rounded-full"
                    >
                        <PowerIcon
                            className={`h-5 w-5 ${state.on ? "text-primary" : "text-white"}`}
                        />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <LightPreview state={state} />
                        <ColorValues
                            color={state.color}
                            brightness={state.brightness}
                            temperature={state.temperature}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <HexColorPicker
                                color={rgbToHex(state.color.r, state.color.g, state.color.b)}
                                onChange={handleColorChange}
                                className={`w-full !h-40 rounded-lg ${!state.on && "opacity-50 pointer-events-none"}`}
                            />

                            <HexColorInput
                                color={rgbToHex(state.color.r, state.color.g, state.color.b)}
                                onChange={handleColorChange}
                                className="w-full px-3 py-2 bg-muted rounded-md text-sm"
                                prefixed
                                disabled={!state.on}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <SunIcon className="w-5 h-5" />
                                        <span className="font-medium">
                        Brightness
                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                      {state.brightness}%
                    </span>
                                </div>
                                <Slider
                                    value={[state.brightness]}
                                    onValueChange={([brightness]) => {
                                        sendMessage('brightness', { value: brightness });
                                        setState((prev) => ({ ...prev, brightness }))
                                    }}
                                    min={0}
                                    max={100}
                                    step={1}
                                    disabled={!state.on}
                                    className="py-4"
                                />
                            </div>

                            <div className="space-y-2">
                                <div
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <ThermometerIcon className="w-5 h-5" />
                                        <span className="font-medium">
                        Temperature
                      </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                      {state.temperature}%
                    </span>
                                </div>
                                <Slider
                                    value={[state.temperature]}
                                    onValueChange={([temperature]) => {
                                        sendMessage('colorwc', {
                                            color: state.color,
                                            colorTemInKelvin: temperature
                                        })
                                        setState((prev) => ({ ...prev, temperature }))
                                    }}
                                    min={0}
                                    max={100}
                                    step={1}
                                    disabled={!state.on}
                                    className="py-4"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    </div>
    );
}