import React, { useEffect, useMemo, useRef } from "react"


function resolveImageSrc(value) {
    if (!value) return ""
    if (typeof value === "string") return value
    if (typeof value === "object" && value.src) return value.src
    return ""
}

export default function WanderingElements({
    images = [],
    elementCount = images.length,
    minSize = 60,
    maxSize = 140,
    minDuration = 90,
    maxDuration = 150,
    verticalRangeStart = 5,
    verticalRangeEnd = 95,
    wobbleAmplitude = 28,
    wobbleSpeed = 0.25,
    rotationAmount = 6,
    direction = "topToBottom",
    fadeEdge = 10,
    backgroundColor = "transparent",
}) {
    const containerRef = useRef(null)
    const itemRefs = useRef([])
    const startTime = useRef(null)
    const rafId = useRef(undefined)

    const isCanvas = false

    const validSrcs = [...new Set(images.map(resolveImageSrc).filter(Boolean))]
    const srcsKey = validSrcs.join("|")

    // Each wanderer gets its own randomized lane, speed, size, and phase so
    // the group never reads as a single synchronized row — closer to the
    // scattered, independent drift of strom.cafe's floating letters.
    const wanderers = useMemo(() => {
        if (validSrcs.length === 0) return []
        const count = Math.min(validSrcs.length, Math.max(0, Math.round(elementCount)))
        const list = []
        for (let i = 0; i < count; i++) {
            list.push({
                src: validSrcs[i],
                laneY:
                    (verticalRangeStart +
                        Math.random() *
                            Math.max(
                                0,
                                verticalRangeEnd - verticalRangeStart
                            )) /
                    100,
                phase: Math.random() * Math.PI * 2,
                duration:
                    minDuration +
                    Math.random() * Math.max(0, maxDuration - minDuration),
                startOffset: Math.random(),
                size: minSize + Math.random() * Math.max(0, maxSize - minSize),
                rotationPhase: Math.random() * Math.PI * 2,
            })
        }
        return list
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        srcsKey,
        elementCount,
        minSize,
        maxSize,
        minDuration,
        maxDuration,
        verticalRangeStart,
        verticalRangeEnd,
    ])

    useEffect(() => {
        if (wanderers.length === 0) return
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

        const dir = direction === "rightToLeft" ? -1 : 1
        const vertical = direction === "topToBottom"
        let pointer = null
        let previousTime = null
        const offsets = wanderers.map(() => ({ y: 0, side: 0 }))
        const trackPointer = (event) => {
            pointer = event.pointerType === "touch" ? null : { x: event.clientX, y: event.clientY }
        }
        const clearPointer = () => { pointer = null }
        const leaveWindow = (event) => {
            if (!event.relatedTarget) clearPointer()
        }
        window.addEventListener("pointermove", trackPointer)
        window.addEventListener("pointerout", leaveWindow)
        window.addEventListener("blur", clearPointer)

        const loop = (t) => {
            if (startTime.current === null) startTime.current = t
            const elapsed = (t - startTime.current) / 1000

            const container = containerRef.current
            const width = container?.clientWidth ?? 0
            const height = container?.clientHeight ?? 0
            const bounds = container?.getBoundingClientRect()
            const delta = previousTime === null ? 1 / 60 : Math.min((t - previousTime) / 1000, 0.05)
            previousTime = t
            const easing = 1 - Math.exp(-0.65 * delta)

            wanderers.forEach((w, i) => {
                const el = itemRefs.current[i]
                if (!el) return

                const imageWidth = el.offsetWidth || w.size
                const travel = (vertical ? height : width) + w.size * 2
                const progress = (elapsed / w.duration + w.startOffset) % 1
                const drift =
                    dir === 1
                        ? progress * travel - w.size
                        : width - progress * travel + w.size

                const wobble =
                    Math.sin(elapsed * wobbleSpeed + w.phase) * wobbleAmplitude
                const crossLimit = Math.max(0, vertical ? width - imageWidth : height - w.size)
                const lane = Math.max(0, Math.min(crossLimit, w.laneY * crossLimit + wobble))
                const x = vertical ? lane : drift
                const y = vertical ? drift : lane
                const rotation =
                    Math.sin(elapsed * wobbleSpeed * 0.6 + w.rotationPhase) *
                    rotationAmount

                let opacity = 1
                if (fadeEdge > 0) {
                    const distFromStart = progress * travel
                    const distFromEnd = travel - distFromStart
                    opacity = Math.min(
                        1,
                        distFromStart / fadeEdge,
                        distFromEnd / fadeEdge
                    )
                }

                let avoidY = 0
                const offset = offsets[i]
                if (pointer && bounds && !reducedMotion.matches) {
                    const dx = bounds.left + x + imageWidth / 2 - pointer.x
                    const dy = bounds.top + y + w.size / 2 - pointer.y
                    const distance = Math.hypot(dx, dy)
                    const radius = Math.max(imageWidth, w.size) / 2 + 100
                    if (distance < radius) {
                        // Hold one bend direction throughout an encounter;
                        // forward drift continues without orbiting the cursor.
                        if (offset.side === 0) offset.side = (vertical ? dx : dy) < 0 ? -1 : 1
                        const proximity = 1 - distance / radius
                        const strength = proximity * proximity * (3 - 2 * proximity)
                        avoidY = offset.side * strength * 36
                    } else offset.side = 0
                } else offset.side = 0
                offset.y += (avoidY - offset.y) * easing
                const displacedLane = Math.max(0, Math.min(crossLimit, lane + offset.y))
                el.style.transform = `translate(${vertical ? displacedLane : x}px, ${vertical ? y : displacedLane}px) rotate(${rotation}deg)`
                el.style.opacity = String(Math.max(0, opacity))
            })

            if (!reducedMotion.matches) rafId.current = requestAnimationFrame(loop)
        }

        rafId.current = requestAnimationFrame(loop)
        return () => {
            window.removeEventListener("pointermove", trackPointer)
            window.removeEventListener("pointerout", leaveWindow)
            window.removeEventListener("blur", clearPointer)
            if (rafId.current !== undefined) cancelAnimationFrame(rafId.current)
            startTime.current = null
        }
    }, [
        isCanvas,
        wanderers,
        direction,
        wobbleAmplitude,
        wobbleSpeed,
        rotationAmount,
        fadeEdge,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                backgroundColor,
            }}
        >
            {wanderers.length === 0 && isCanvas && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#888",
                        fontSize: 13,
                        textAlign: "center",
                        padding: 16,
                    }}
                >
                    Add images →
                </div>
            )}

            {wanderers.map((w, i) => (
                <img
                    key={i}
                    ref={(el) => (itemRefs.current[i] = el)}
                    src={w.src}
                    alt=""
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: w.size,
                        width: "auto",
                        objectFit: "contain",
                        willChange: "transform, opacity",
                        pointerEvents: "none",
                        transform: isCanvas
                            ? `translate(${(i / wanderers.length) * 80}%, ${w.laneY * 100}%)`
                            : undefined,
                    }}
                />
            ))}
        </div>
    )
}
