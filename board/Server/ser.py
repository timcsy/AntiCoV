from websocket_server import WebsocketServer


def new_client(client, server):
    # print("New client connected and was given id %d" % client['id'])
    print("New client connect")
    server.send_message_to_all("Hey all, a new client has joined us")


def client_left(client, server):
    # print("Client(%d) disconnected" % client['id'])
    print("Client disconnected")
    pass


def message_received(client, server, message):
    if len(message) > 200:
        message = message[:200]+'..'
    print("Client(%d) said: %s" % (client['id'], message))
    server.send_message_to_all("on")


PORT=9001
server = WebsocketServer(PORT, host="192.168.50.134")
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)
server.set_fn_message_received(message_received)
server.run_forever()
