import {Controller, Get, Render} from '@nestjs/common';

@Controller()
export class EventsController {
  @Get()
  @Render('index')
  root() {
    return {message: 'Hello world!'};
  }
}
