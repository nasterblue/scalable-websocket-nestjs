import {UseInterceptors} from '@nestjs/common';
import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';

import {RedisPropagatorInterceptor} from '@app/shared/redis-propagator/redis-propagator.interceptor';

const reconnect_error = 'reconnect_error';
const reconnect = 'reconnect';
const disconnect = 'disconnect';
const stoptyping = 'stop typing';
const typing = 'typing';
const userleft = 'user left';
const userjoined = 'user joined';
const newmessage = 'new message';
const login = 'login';
const adduser = 'add user';
const roomId = "nasterblue-room-007";

@UseInterceptors(RedisPropagatorInterceptor)
@WebSocketGateway()
export class EventsGateway {

  @WebSocketServer() server;
  connectedUsers = new Map<string, string>();

  constructor() {

  }

  @SubscribeMessage(newmessage)
  async newmessage(@MessageBody() data: any,
                   @ConnectedSocket() socket: any): Promise<any> {
    socket.broadcast.to(roomId).emit(newmessage, {
      username: socket.username,
      message: data
    });
    return data;
  }

  @SubscribeMessage(adduser)
  async adduser(@MessageBody() data: any,
          @ConnectedSocket() socket: any): Promise<any> {

    this.connectedUsers.set(data, data);

    socket.join(roomId, async () => {
      // we store the username in the socket session for this client
      socket.username = data;
      await socket.broadcast.to(roomId).emit('login', {
        numUsers: this.connectedUsers.size
      });
      // echo globally (all clients) that a person has connected
      await socket.broadcast.to(roomId).emit(userjoined, {
        username: socket.username,
        numUsers: this.connectedUsers.size
      });
      return data;
    });

  }

  @SubscribeMessage(typing)
  typing(@MessageBody() data: any,
         @ConnectedSocket() socket: any): any {

    socket.broadcast.to(roomId).emit(typing, {
      username: socket.username
    });
    return data;
  }

  @SubscribeMessage(stoptyping)
  stoptyping(@MessageBody() data: any,
             @ConnectedSocket() socket: any): any {

    socket.broadcast.to(roomId).emit(stoptyping, {
      username: socket.username
    });

    return data;
  }


  @SubscribeMessage(disconnect)
  disconnect(@MessageBody() data: any,
             @ConnectedSocket() socket: any): any {
    // echo globally that this client has left
    this.connectedUsers.delete(socket.username);
    socket.broadcast.to(roomId).emit(userleft, {
      username: socket.username,
      numUsers: this.connectedUsers.size
    });
    return data;
  }


}
