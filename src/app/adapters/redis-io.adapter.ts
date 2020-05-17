import {INestApplication} from '@nestjs/common';
import {IoAdapter} from '@nestjs/platform-socket.io';
import {ServerOptions} from 'socket.io';
import redisIoAdapter from 'socket.io-redis';
import Redis from 'ioredis';
import {REDIS_PUBLISHER_CLIENT, REDIS_SUBSCRIBER_CLIENT} from '@app/shared/redis/redis.constants';

export type RedisClient = Redis.Redis;

export class RedisIoAdapter extends IoAdapter {
  pubClient: RedisClient;
  subClient: RedisClient;

  constructor(app: INestApplication) {
    super(app);
    this.pubClient = app.get(REDIS_PUBLISHER_CLIENT);
    this.subClient = app.get(REDIS_SUBSCRIBER_CLIENT);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const redisAdapter = redisIoAdapter({
      pubClient: this.pubClient,
      subClient: this.subClient
    });
    const server = super.createIOServer(port, options);
    server.adapter(redisAdapter);
    return server;
  }
}
