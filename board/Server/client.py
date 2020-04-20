import asyncio
import websockets
import sys

async def hello(msg):
    uri = "ws://192.168.50.134:9001"
    async with websockets.connect(uri) as websocket:
        await websocket.send(msg)
        msg = await websocket.recv()
        print(msg)

asyncio.get_event_loop().run_until_complete(hello("Hello "))
# asyncio.get_event_loop().run_forever()
