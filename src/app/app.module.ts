import {Module} from '@nestjs/common';

import {SharedModule} from './shared/shared.module';
import {AppController} from './app.controller';
import {EventsModule} from './events/events.module';

@Module({
  imports: [
    SharedModule,
    EventsModule
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule {
}
