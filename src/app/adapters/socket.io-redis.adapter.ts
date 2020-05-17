import {INestApplication} from '@nestjs/common';

import {RedisPropagatorService} from '@app/shared/redis-propagator/redis-propagator.service';
import {SocketStateAdapter} from '@app/shared/socket-state/socket-state.adapter';
import {SocketStateService} from '@app/shared/socket-state/socket-state.service';

export class SocketIoRedisAdapter extends SocketStateAdapter {
  constructor(app: INestApplication) {
    super(app, app.get(SocketStateService), app.get(RedisPropagatorService));
  }
}