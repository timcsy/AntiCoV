import requests
import websocket
import json
import app


def on_message(ws, message):
    #print(ws)
    print(message)

def on_error(ws, error):
    #print(ws)
    print(error)

def on_close(ws):
    #print(ws)
    print("### Websocket Closed ###")

def on_open(ws):
    req = {
        "cmd": "temperature",
        "device": "board",
        "temperature": 36
    }
    msg_json = json.dumps(req)
    ws.send(msg_json)
    
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
    msg = ws.on_message
    #print(msg)
    '''if msg['alarm'] == "bad":
        app.location_send_message("118", "1")
        app.broadcast_message("有人沒量體溫呢~~")
        app.broadcast_message(msg)
    elif msg['alarm'] == "fever":
        app.location.send_message("3", "1")
        app.broadcast_message("哇...發燒了!!")
        app.broadcast_message(msg)'''
    ws.run_forever(ping_timeout=30)
    print("Running ...")
