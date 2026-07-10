"use client";
import React from "react";

import { Element } from "@/app/whiteboard/page";

interface WhiteboardCanvasProps {
  elements: Element[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  tool: "select" | "pen" | "rectangle" | "circle" | "line" | "eraser" | "text";
  setTool: (t: "select" | "pen" | "rectangle" | "circle" | "line" | "eraser" | "text") => void;
  drawingColor: string;
  isDrawing: boolean;
  setIsDrawing: (b: boolean) => void;
  startPos: { x: number; y: number };
  setStartPos: (p: { x: number; y: number }) => void;
  tempElement: Element | null;
  setTempElement: (el: Element | null) => void;
  isDragging: boolean;
  setIsDragging: (b: boolean) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (o: { x: number; y: number }) => void;
  saveCanvasElementsMutation: (updated: Element[]) => void;
  updateElementMutation: (id: string, x: number, y: number) => void;
  deleteElementMutation: (id: string) => void;
  others: readonly any[];
  updateMyPresence: (pres: any) => void;
  drawingColorList: string[];
  setDrawingColor: (hex: string) => void;
  loadPredefinedTemplate: (type: "flowchart" | "mindmap") => void;
}

export function WhiteboardCanvas({
  elements,
  selectedId,
  setSelectedId,
  tool,
  setTool,
  drawingColor,
  isDrawing,
  setIsDrawing,
  startPos,
  setStartPos,
  tempElement,
  setTempElement,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
  saveCanvasElementsMutation,
  updateElementMutation,
  deleteElementMutation,
  others,
  updateMyPresence,
  drawingColorList,
  setDrawingColor,
  loadPredefinedTemplate,
}: WhiteboardCanvasProps) {
  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    if (tool === "select") {
      const hit = [...elements].reverse().find((el) => {
        const minX = Math.min(el.x, el.x + el.width);
        const maxX = Math.max(el.x, el.x + el.width);
        const minY = Math.min(el.y, el.y + el.height);
        const maxY = Math.max(el.y, el.y + el.height);
        return (
          coords.x >= minX &&
          coords.x <= maxX &&
          coords.y >= minY &&
          coords.y <= maxY
        );
      });

      if (hit) {
        setSelectedId(hit.id);
        setIsDragging(true);
        setDragOffset({
          x: coords.x - hit.x,
          y: coords.y - hit.y,
        });
      } else {
        setSelectedId(null);
      }
      return;
    }

    if (tool === "eraser") {
      setIsDrawing(true);
      const hit = elements.find((el) => {
        const minX = Math.min(el.x, el.x + el.width);
        const maxX = Math.max(el.x, el.x + el.width);
        const minY = Math.min(el.y, el.y + el.height);
        const maxY = Math.max(el.y, el.y + el.height);
        return (
          coords.x >= minX &&
          coords.x <= maxX &&
          coords.y >= minY &&
          coords.y <= maxY
        );
      });
      if (hit) {
        deleteElementMutation(hit.id);
      }
      return;
    }

    setIsDrawing(true);
    setStartPos(coords);

    if (tool === "pen") {
      setTempElement({
        id: "temp",
        type: "path",
        x: coords.x,
        y: coords.y,
        width: 1,
        height: 1,
        color: drawingColor,
        points: [{ x: 0, y: 0 }],
        absolutePoints: [coords],
      } as any);
    } else if (tool === "text") {
      const textVal = prompt("Enter shape label:");
      if (textVal) {
        const newEl = {
          id: "el_" + crypto.randomUUID(),
          type: "text" as const,
          x: coords.x,
          y: coords.y,
          width: 140,
          height: 35,
          text: textVal,
          color: drawingColor,
        };
        saveCanvasElementsMutation([...elements, newEl]);
      }
      setIsDrawing(false);
      setTool("select");
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getCoordinates(e);

    updateMyPresence({ cursor: coords });

    if (isDragging && selectedId && tool === "select") {
      const nx = coords.x - dragOffset.x;
      const ny = coords.y - dragOffset.y;
      updateElementMutation(selectedId, nx, ny);
      return;
    }

    if (!isDrawing) return;

    if (tool === "eraser") {
      const hit = elements.find((el) => {
        const minX = Math.min(el.x, el.x + el.width);
        const maxX = Math.max(el.x, el.x + el.width);
        const minY = Math.min(el.y, el.y + el.height);
        const maxY = Math.max(el.y, el.y + el.height);
        return (
          coords.x >= minX &&
          coords.x <= maxX &&
          coords.y >= minY &&
          coords.y <= maxY
        );
      });
      if (hit) {
        deleteElementMutation(hit.id);
      }
      return;
    }

    const width = coords.x - startPos.x;
    const height = coords.y - startPos.y;

    if (tool === "pen") {
      const newAbsPoints = [...(tempElement?.absolutePoints || [startPos]), coords];
      const minX = Math.min(...newAbsPoints.map((p) => p.x));
      const maxX = Math.max(...newAbsPoints.map((p) => p.x));
      const minY = Math.min(...newAbsPoints.map((p) => p.y));
      const maxY = Math.max(...newAbsPoints.map((p) => p.y));

      const relativePoints = newAbsPoints.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
      }));

      setTempElement({
        id: "temp",
        type: "path",
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
        color: drawingColor,
        points: relativePoints,
        absolutePoints: newAbsPoints,
      } as any);
    } else if (tool === "rectangle") {
      setTempElement({
        id: "temp",
        type: "rectangle",
        x: width < 0 ? coords.x : startPos.x,
        y: height < 0 ? coords.y : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
        color: drawingColor,
      });
    } else if (tool === "circle") {
      setTempElement({
        id: "temp",
        type: "circle",
        x: width < 0 ? coords.x : startPos.x,
        y: height < 0 ? coords.y : startPos.y,
        width: Math.abs(width),
        height: Math.abs(height),
        color: drawingColor,
      });
    } else if (tool === "line") {
      setTempElement({
        id: "temp",
        type: "line",
        x: startPos.x,
        y: startPos.y,
        width: width,
        height: height,
        color: drawingColor,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (tool === "eraser") {
      setIsDrawing(false);
      return;
    }

    if (!tempElement) {
      setIsDrawing(false);
      setTempElement(null);
      return;
    }

    const newEl = {
      ...tempElement,
      id: "el_" + crypto.randomUUID(),
    };

    delete (newEl as any).absolutePoints;

    saveCanvasElementsMutation([...elements, newEl]);
    setIsDrawing(false);
    setTempElement(null);
  };

  const handleMouseLeave = () => {
    updateMyPresence({ cursor: null });
  };

  return (
    <div className="flex-grow relative overflow-hidden bg-surface">
      <svg
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full bg-surface text-foreground select-none cursor-crosshair"
      >
        <defs>
          {drawingColorList.map((color) => (
            <marker
              key={color}
              id={`arrow-${color.replace("#", "")}`}
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
          ))}
        </defs>
        {elements.map((el) => {
          const isSelected = el.id === selectedId;
          if (el.type === "rectangle") {
            return (
              <g key={el.id}>
                <rect
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  fill="none"
                  stroke={el.color}
                  strokeWidth={isSelected ? 3 : 2}
                  rx={4}
                />
                {el.text && (
                  <text
                    x={el.x + 10}
                    y={el.y + el.height / 2 + 4}
                    fontSize={11}
                    fontFamily="var(--font-sans)"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    {el.text}
                  </text>
                )}
              </g>
            );
          } else if (el.type === "circle") {
            const rx = el.width / 2;
            const ry = el.height / 2;
            const cx = el.x + rx;
            const cy = el.y + ry;
            return (
              <g key={el.id}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke={el.color}
                  strokeWidth={isSelected ? 3 : 2}
                />
                {el.text && (
                  <text
                    x={cx - el.text.length * 3}
                    y={cy + 4}
                    fontSize={11}
                    fontFamily="var(--font-sans)"
                    fontWeight="bold"
                    fill="currentColor"
                  >
                    {el.text}
                  </text>
                )}
              </g>
            );
          } else if (el.type === "text") {
            return (
              <text
                key={el.id}
                x={el.x}
                y={el.y}
                fill={el.color}
                fontSize={12}
                fontFamily="var(--font-sans)"
                fontWeight="bold"
              >
                {el.text}
              </text>
            );
          } else if (el.type === "line") {
            return (
              <line
                key={el.id}
                x1={el.x}
                y1={el.y}
                x2={el.x + el.width}
                y2={el.y + el.height}
                stroke={el.color}
                strokeWidth={isSelected ? 4 : 2}
                markerEnd={`url(#arrow-${el.color.replace("#", "")})`}
              />
            );
          } else if (el.type === "path") {
            const pointsString = el.points
              ? el.points.map((p: any) => `${el.x + p.x},${el.y + p.y}`).join(" ")
              : "";
            return (
              <polyline
                key={el.id}
                points={pointsString}
                fill="none"
                stroke={el.color}
                strokeWidth={isSelected ? 4 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          }
          return null;
        })}

        {/* Rendering temp element while drawing */}
        {tempElement && tempElement.type === "rectangle" && (
          <rect
            x={tempElement.x}
            y={tempElement.y}
            width={tempElement.width}
            height={tempElement.height}
            fill="none"
            stroke={tempElement.color}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        {tempElement && tempElement.type === "circle" && (
          <ellipse
            cx={tempElement.x + tempElement.width / 2}
            cy={tempElement.y + tempElement.height / 2}
            rx={tempElement.width / 2}
            ry={tempElement.height / 2}
            fill="none"
            stroke={tempElement.color}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
        )}
        {tempElement && tempElement.type === "line" && (
          <line
            x1={tempElement.x}
            y1={tempElement.y}
            x2={tempElement.x + tempElement.width}
            y2={tempElement.y + tempElement.height}
            stroke={tempElement.color}
            strokeWidth={2}
            strokeDasharray="4 4"
            markerEnd={`url(#arrow-${tempElement.color.replace("#", "")})`}
          />
        )}
        {tempElement && tempElement.type === "path" && tempElement.points && (
          <polyline
            points={tempElement.points.map((p: any) => `${tempElement.x + p.x},${tempElement.y + p.y}`).join(" ")}
            fill="none"
            stroke={tempElement.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Live pointers of other online collaborators */}
        {others.map(({ connectionId, presence, info }) => {
          if (!presence?.cursor) return null;
          const name = info?.name || presence.name || "Guest";
          const avatar = info?.avatar || presence.avatar || "";
          return (
            <g key={connectionId} style={{ pointerEvents: "none" }} className="z-50 select-none">
              <path
                d="M0,0 L0,16 L4,12 L8,20 L11,19 L7,11 L13,11 Z"
                fill="var(--secondary)"
                stroke="white"
                strokeWidth={1}
                transform={`translate(${presence.cursor.x}, ${presence.cursor.y})`}
              />
              <foreignObject
                x={presence.cursor.x + 12}
                y={presence.cursor.y + 12}
                width={150}
                height={32}
              >
                <div className="flex items-center gap-1.5 bg-surface/95 border border-border px-2 py-0.5.5 rounded-full shadow-[var(--shadow-md)] text-[9px] font-bold text-foreground transition-all duration-200 animate-fade-in">
                  {avatar && <img src={avatar} alt={name} className="size-4.5 rounded-full object-cover border border-white" />}
                  <span className="truncate max-w-[100px]">{name}</span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Left floating color tag select */}
      <div className="absolute left-4 top-4 bg-surface border border-border rounded-xl p-2 shadow-sm space-y-1.5 flex flex-col z-20">
        {drawingColorList.map((hex) => (
          <button
            key={hex}
            onClick={() => setDrawingColor(hex)}
            className={`size-4 rounded-full border border-white shrink-0 ${
              drawingColor === hex ? "ring-2 ring-primary" : ""
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      {/* Bottom template quick presets loaders */}
      <div className="absolute bottom-4 left-4 right-4 bg-surface border border-border rounded-xl p-3 shadow-md z-20 flex items-center justify-between">
        <span className="text-overline text-muted block">Canvas templates</span>
        <div className="flex gap-2">
          <button onClick={() => loadPredefinedTemplate("flowchart")} className="btn-secondary text-caption hover:bg-primary hover:text-white px-2.5 py-1">
            Flowchart Presets
          </button>
          <button onClick={() => loadPredefinedTemplate("mindmap")} className="btn-secondary text-caption hover:bg-primary hover:text-white px-2.5 py-1">
            Mindmap Canvas
          </button>
        </div>
      </div>
    </div>
  );
}
