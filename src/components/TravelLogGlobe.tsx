import createGlobe from "cobe";
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { z } from "astro/zod"
import { useSpring } from "react-spring"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from "./ui";
import { format } from 'date-fns'
import { useMediaQuery } from "../lib/use-media-query"

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { getCollection } from "astro:content";

const travels = await getCollection("travel");

const locationCoordinates = travels.map((travel) => {
    return {
        location: travel.data.location,
        size: 0.1,
    }
})


export default function TravelLogGlobe() {
    const canvasRef = useRef()

    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);
    const [{ r }, api] = useSpring(() => ({
        r: 0,
        config: {
            mass: 1,
            tension: 280,
            friction: 40,
            precision: 0.001,
        },
    }));

    const locationToAngles = (lat: number, long: number) => {
        return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
    }
    const focusRef = useRef(locationToAngles(
        locationCoordinates[1].location[0],
        locationCoordinates[1].location[1],
    ))
    useEffect(() => {
        let phi = 0;
        let width = 0;
        let currentPhi = 0;
        let currentTheta = 0;
        const doublePi = Math.PI * 2;
        //@ts-ignore
        const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
        window.addEventListener('resize', onResize)
        onResize()
        //@ts-ignore
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: width * 2,
            height: width * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 3,
            mapSamples: 16000,
            mapBrightness: 1.2,
            baseColor: [1, 1, 1],
            markerColor: [164 / 255, 174 / 255, 244 / 255],
            glowColor: [164 / 255, 174 / 255, 244 / 255],
            markers: locationCoordinates.map((location) => {
                return {
                    location: [
                        location.location[1],
                        location.location[0]
                    ],
                    size: location.size,
                }
            }),
            onRender: (state) => {
                // This prevents rotation while dragging
                if (!pointerInteracting.current) {
                    // Called on every animation frame.
                    // `state` will be an empty object, return updated params.
                    phi += 0.003
                }
                state.phi = phi + r.get()
                state.width = width * 2
                state.height = width * 2
            }
        });
        // @ts-ignore
        setTimeout(() => canvasRef.current.style.opacity = '1')
        return () => {
            globe.destroy();
            window.removeEventListener('resize', onResize)
        };
    }, []);
    return (
        <div className="font-sans grid gap-2 px-6 md:px-6 w-full md:max-w-2xl">
            <canvas
                // @ts-ignore
                ref={canvasRef}
                className="w-[600px] h-[400px] md:h-[600px]"
                style={{ maxWidth: "100%", aspectRatio: 1 }}
                onPointerDown={(e) => {
                    // @ts-ignore
                    pointerInteracting.current =
                        e.clientX - pointerInteractionMovement.current;
                    // @ts-ignore
                    canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    // @ts-ignore
                    canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    // @ts-ignore
                    canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        api.start({
                            r: delta / 200,
                        });
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta;
                        api.start({
                            r: delta / 100,
                        });
                    }
                }}
            />
        </div >
    )
}