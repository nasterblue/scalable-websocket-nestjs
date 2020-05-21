import {Injectable, Logger} from '@nestjs/common'
import {Socket} from 'socket.io'

@Injectable()
export class SocketStateService {
  logger = new Logger(SocketStateService.name);
  private socketState = new Map<string, Socket[]>();

  public remove(userId: string, socket: Socket): boolean {
    this.logger.log(['remove', userId]);
    const existingSockets = this.socketState.get(userId);

    if (!existingSockets) {
      return true
    }

    const sockets = existingSockets.filter(s => s.id !== socket.id);

    if (!sockets.length) {
      this.socketState.delete(userId)
    } else {
      this.socketState.set(userId, sockets)
    }

    return true
  }

  public add(userId: string, socket: Socket): boolean {
    this.logger.log(['add', userId]);
    const existingSockets = this.socketState.get(userId) || [];

    const sockets = [...existingSockets, socket];

    this.socketState.set(userId, sockets);

    return true
  }

  public get(userId: string): Socket[] {
    this.logger.log(['get', userId]);
    return this.socketState.get(userId) || []
  }

  public getAll(): Socket[] {
    const all = [];

    this.socketState.forEach(sockets => all.push(sockets));
    this.logger.log(['getAll', all]);
    return all
  }
}
