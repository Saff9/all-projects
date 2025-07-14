from fastapi import WebSocket
from typing import Dict, Any, Set, List
import json
import asyncio


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.subscriptions: Dict[str, set] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.subscriptions[client_id] = set()

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)
        self.subscriptions.pop(client_id, None)

    async def send_to_client(self, client_id: str, message: Dict[str, Any]):
        ws = self.active_connections.get(client_id)
        if ws:
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(client_id)

    async def broadcast_task_update(self, task_id: str, update: Dict[str, Any]):
        for client_id, subs in self.subscriptions.items():
            if task_id in subs:
                await self.send_to_client(client_id, {
                    "type": "task_update",
                    "task_id": task_id,
                    **update,
                })

    async def stream_llm_response(self, client_id: str, task_id: str, chunk: str):
        await self.send_to_client(client_id, {
            "type": "llm_stream",
            "task_id": task_id,
            "chunk": chunk,
        })

    async def broadcast(self, message: Dict[str, Any]):
        for client_id, ws in self.active_connections.items():
            try:
                await ws.send_json(message)
            except Exception:
                self.disconnect(client_id)

    def get_active_clients(self) -> List[str]:
        return list(self.active_connections.keys())

    def subscribe_to_task(self, client_id: str, task_id: str):
        if client_id in self.subscriptions:
            self.subscriptions[client_id].add(task_id)

    def unsubscribe_from_task(self, client_id: str, task_id: str):
        if client_id in self.subscriptions:
            self.subscriptions[client_id].discard(task_id)
