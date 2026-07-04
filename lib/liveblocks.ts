import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export type Element = {
  id: string;
  type: "rectangle" | "circle" | "line" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color: string;
  [key: string]: any;
};

export type Presence = {
  cursor: { x: number; y: number } | null;
  name?: string;
  avatar?: string;
};

export type Storage = {
  canvasElements: any; // LiveMap<string, Element>
};

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useOthers,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage>(client);

export { LiveblocksProvider } from "@liveblocks/react";
