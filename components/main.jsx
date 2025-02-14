"use client"
import { useEffect, useState } from 'react';
import {Button} from "@/components/ui/button";
import {ColorPicker} from "@/components/ui/color-picker";
import {Slider} from "@/components/ui/slider";
import {clsx} from "clsx";

const buildCommand = (command, data) => {
    return {
        "msg": {
            "cmd": command,
            "data": data
        }
    }
}
export default function MainClient() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);

    const [status, setStatus] = useState(null)

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
                setStatus({
                    on: dict.msg.data['onOff'] === 1,
                    brightness: dict.msg.data['brightness'],
                    color: dict.msg.data.color,
                    temp: dict.msg.data.colorTemInKelvin
                })

            }

            setMessages((prev) => [...prev, event.data]);
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

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            // socket.send(JSON.stringify(buildCommand('turn', {value: 0})));

            setInput('');
        } else {
            console.error('WebSocket is not open');
        }
    };

    useEffect(() => {
        console.log(status)
    }, [status]);

    return (
        <div
            className={clsx(
                'flex flex-col items-center justify-center p-6 space-y-6', // Center everything
                'min-h-screen bg-gray-100' // Mobile-friendly padding + background
            )}
        >
            {/* Turn On/Off Button */}
            <Button
                className="px-4 py-3 text-sm font-medium"
                onClick={() => {
                    socket.send(
                        JSON.stringify(buildCommand('turn', { value: status?.on ? 0 : 1 }))
                    );
                    setTimeout(() => {
                        socket.send(JSON.stringify(buildCommand('devStatus', {})));
                    }, 400);
                }}
            >
                Turn {status?.on ? 'Off' : 'On'}
            </Button>

            {/* Color Picker */}
            <div className="w-full max-w-xs sm:max-w-sm space-y-4">
                <ColorPicker
                    value={status?.color ?? { r: 0, g: 0, b: 0 }}
                    onChange={(color) => {
                        socket.send(
                            JSON.stringify(
                                buildCommand('colorwc', {
                                    color: color,
                                    colorTemInKelvin: status.colorTemInKelvin
                                })
                            )
                        );
                        setStatus({
                            ...status,
                            color: color
                        });
                    }}
                />
            </div>

            {/* Slider */}
            <Slider
                className="w-full max-w-xs sm:max-w-sm"
                value={[status?.brightness ?? 50]}
                max={100}
                step={1}
                onValueChange={(value) => {
                    socket.send(
                        JSON.stringify(buildCommand('brightness', { value: value[0] }))
                    );
                    setStatus({
                        ...status,
                        brightness: value[0]
                    });
                }}
            />
        </div>

        // <div style={{ padding: '20px' }}>
        //
        //     <div>
        //         <Button onClick={() => {
        //             socket.send(JSON.stringify(buildCommand('turn', {value: status?.on ? 0 : 1})));
        //             setTimeout(() => {
        //
        //                 socket.send(JSON.stringify(buildCommand('devStatus', {})));
        //             }, 400)
        //         }}>Turn {status?.on ? "Off" : "On"}</Button>
        //     </div>
        //     <ColorPicker value={status?.color ?? {r: 0, g: 0, b:0}} onChange={(color) => {
        //         socket.send(JSON.stringify(buildCommand('colorwc', {color: color, colorTemInKelvin: status.colorTemInKelvin})));
        //
        //         setStatus({
        //             ...status,
        //             color: color
        //         })
        //     }}/>
        //     <Slider value={[status?.brightness]} max={100} step={1} onValueChange={(value) => {
        //         socket.send(JSON.stringify(buildCommand('brightness', {value: value[0]})));
        //
        //         setStatus({
        //             ...status,
        //             brightness: value[0]
        //         })
        //     }} />
        //     <div style={{ marginTop: '20px' }}>
        //         <h2>Received Messages:</h2>
        //         <ul>
        //             {messages.map((msg, index) => (
        //                 <li key={index}>{msg}</li>
        //             ))}
        //         </ul>
        //     </div>
        // </div>
    );
}