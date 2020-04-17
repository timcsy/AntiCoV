import websocket

import app as alarm_manager

from configparser import ConfigParser

config = ConfigParser()
config.read('app.config', encoding='UTF-8')

def on_message(ws, message):
    print(ws)
    print(message)

def on_error(ws, error):
    print(ws)
    print(error)

def on_close(ws):
    print(ws)
    print("### closed ###")

if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(config['WebSocket']['URL'], on_message=on_message, on_error=on_error, on_close=on_close)
    ws.run_forever()
    if ws.on_message[0] == "line":
        alarm_manager()
