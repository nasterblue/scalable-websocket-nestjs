import * as WebSocket from 'ws';
import {INestApplicationContext, WebSocketAdapter, Logger} from '@nestjs/common';
import {MessageMappingProperties} from '@nestjs/websockets';
import {EMPTY, fromEvent, Observable} from 'rxjs';
import {filter, mergeMap} from 'rxjs/operators';

export class WebsocketAdapter implements WebSocketAdapter {
  logger = new Logger(WebsocketAdapter.name);

  constructor(private app: INestApplicationContext) {
  }

  create(port: number, options: any = {}): any {
    this.logger.log(['create', port, options]);
    return new WebSocket.Server({port, ...options});
  }

  bindClientConnect(server, callback: Function) {
    this.logger.log(['bindClientConnect', server]);
    server.on('connection', callback);
  }

  bindMessageHandlers(client: WebSocket,
                      handlers: MessageMappingProperties[],
                      process: (data: any) => Observable<any>) {
    fromEvent(client, 'message')
    .pipe(
      mergeMap(data => this.bindMessageHandler(data, handlers, process)),
      filter(result => result),
    )
    .subscribe(response => client.send(JSON.stringify(response)));
  }

  bindMessageHandler(buffer,
                     handlers: MessageMappingProperties[],
                     process: (data: any) => Observable<any>,): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlers.find(
      handler => handler.message === message.event,
    );
    if (!messageHandler) {
      return EMPTY;
    }
    this.logger.log(['bindMessageHandler', message]);
    return process(messageHandler.callback(message.data));
  }

  close(server) {
    server.close();
  }
}