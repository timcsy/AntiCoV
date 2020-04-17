import websocket

#from websocket import create_connection

import json

#import app as alarm_manager

import config

#from configparser import ConfigParser

#config = ConfigParser()
#config.read('app.config', encoding='UTF-8')

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
    msg = {
        "username": "admin",
        "password": "AntiCoV"
    }
    msg_json = json.dumps(msg)
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp(config.webSocket['URL'], on_message=on_message, on_error=on_error, on_close=on_close)
    #ws = create_connection(config.webSocket['URL'])
    ws.run_forever()
    print("Try Connecting ...")
    ws.send(msg_json)
    result = ws.recv()
    print(result)
