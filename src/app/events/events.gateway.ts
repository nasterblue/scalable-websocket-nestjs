import {UseInterceptors, Logger} from '@nestjs/common';
import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {RedisPropagatorInterceptor} from '@app/shared/redis-propagator/redis-propagator.interceptor';
import * as faker from 'faker';

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

  logger = new Logger(EventsGateway.name);

  @WebSocketServer() server;
  connectedUsers = new Map<string, string>();

  constructor() {

  }

  @SubscribeMessage(newmessage)
  async newmessage(@MessageBody() data: any,
                   @ConnectedSocket() socket: any): Promise<any> {


    await this.triggerGetSocketClients();
    // await this.triggerCountUsers();
    socket.broadcast.to(roomId).emit(newmessage, {
      username: socket.username,
      message: data
    });

    // await this.triggerIntervalMsg(socket);
    this.logger.log(['newmessage', data, new Date().toString()]);
    return data;
  }

  async triggerGetSocketClients(): Promise<any> {
    console.log(['triggerGetSocketClients', this.server]);
    console.log(['triggerGetSocketClients.engine', this.server.engine]);
    console.log(['triggerGetSocketClients.engine.clients', this.server.engine.clients]);
    console.log(['triggerGetSocketClients.engine.clientsCount', this.server.engine.clientsCount]);
  }

  async triggerCountUsers(): Promise<any> {
    for (let [key, value] of this.connectedUsers.entries()) {
      this.logger.log(['connectedUsers', key, value]);
    }
  }

  async triggerIntervalMsg(socket): Promise<any> {
    setInterval(() => {
      const msg = [
        faker.lorem.sentence(),
        faker.lorem.sentences(),
        faker.lorem.paragraph(),
        faker.lorem.paragraphs(),
        faker.lorem.text(),
        faker.lorem.words(),
      ];
      socket.broadcast.to(roomId).emit(newmessage, {
        username: socket.username,
        message: msg[Math.floor(Math.random() * 5) + 0]
      });
    }, 5 * 1000);
  }

  @SubscribeMessage(adduser)
  async adduser(@MessageBody() data: any,
                @ConnectedSocket() socket: any): Promise<any> {

    this.connectedUsers.set(data, data);

    socket.join(roomId, async () => {
      // we store the username in the socket session for this client
      socket.username = data;

      // echo globally (all clients) that a person has connected
      await socket.broadcast.to(roomId).emit(login, {
        numUsers: this.connectedUsers.size,
        username: data
      });

      await socket.broadcast.to(roomId).emit(userjoined, {
        username: socket.username,
        numUsers: this.connectedUsers.size
      });

      this.logger.log(['adduser', data, new Date().toString()]);
      return data;
    });

  }

  @SubscribeMessage(typing)
  typing(@MessageBody() data: any,
         @ConnectedSocket() socket: any): any {
    this.logger.log(['typing', data, new Date().toString()]);

    socket.broadcast.to(roomId).emit(typing, {
      username: socket.username
    });
    return data;
  }

  @SubscribeMessage(stoptyping)
  stoptyping(@MessageBody() data: any,
             @ConnectedSocket() socket: any): any {
    this.logger.log(['stoptyping', data, new Date().toString()]);
    socket.broadcast.to(roomId).emit(stoptyping, {
      username: socket.username
    });

    return data;
  }


  @SubscribeMessage(disconnect)
  disconnect(@MessageBody() data: any,
             @ConnectedSocket() socket: any): any {
    // echo globally that this client has left
    this.logger.log(['disconnect', data, new Date().toString()]);
    this.connectedUsers.delete(socket.username);
    socket.broadcast.to(roomId).emit(userleft, {
      username: socket.username,
      numUsers: this.connectedUsers.size
    });
    return data;
  }

}
