#!/usr/bin/env python3
"""Quick WebSocket client to test the Realtime API connection."""

import asyncio
import json
import websockets


async def test_connection():
    uri = "ws://localhost:8000/ws/realtime?level=A1&ui_language=en&voice=alloy"
    print(f"Connecting to: {uri}")
    
    try:
        async with websockets.connect(uri) as ws:
            print("✓ Connected to backend WebSocket")
            
            timeout_seconds = 5
            print(f"Listening for {timeout_seconds} seconds...")
            
            try:
                async with asyncio.timeout(timeout_seconds):
                    async for message in ws:
                        data = json.loads(message)
                        event_type = data.get("type", "unknown")
                        print(f"Received: {event_type}")
                        
                        if event_type == "error":
                            print(f"ERROR DETAILS: {json.dumps(data, indent=2)}")
                        elif event_type in ("session.created", "session.updated"):
                            print(f"SUCCESS: {event_type}")
                            print(f"Session details: {json.dumps(data, indent=2)[:200]}...")
            except asyncio.TimeoutError:
                print(f"\n✓ Connection stable for {timeout_seconds} seconds")
                
    except websockets.exceptions.InvalidHandshake as e:
        print(f"✗ Handshake failed: {e}")
    except Exception as e:
        print(f"✗ Connection error: {e}")


if __name__ == "__main__":
    asyncio.run(test_connection())
