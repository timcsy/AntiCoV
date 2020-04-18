import requests
import websocket

#from websocket import create_connection

import json

#import app as alarm_manager

def on_message(ws, message):
    print(ws)
    print(message)

def on_error(ws, error):
    print(ws)
    print(error)

def on_close(ws):
    print(ws)
    print("### closed ###")

def on_open(ws):
    req = {
        "cmd": "temperature",
        "device": "board",
        "temperature": 1
    }
    msg_json = json.dumps(req)
    ws.send(msg_json)
    #result = ws.recv()
    #print(result)
    
if __name__ == "__main__":
    access_key = {
        "username": "admin",
        "password": "AntiCoV"
    }
    r = requests.post('https://anticov.tew.tw/api/v1/login', data=access_key)
    print(r.text)
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp('wss://anticov.tew.tw/data?token=' + r.text, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.on_open = on_open
    #ws = create_connection(config.webSocket['URL'])
    ws.run_forever(ping_timeout=30)
    print("Running ...")
