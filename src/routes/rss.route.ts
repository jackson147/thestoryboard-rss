import { Router } from 'express';
import RssController from '@controllers/rss.controller';
import { Routes } from '@interfaces/routes.interface';

class RssRoute implements Routes {
  public path = '/rss';
  public router = Router();
  public controller = new RssController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.controller.index);
  }
}

export default RssRoute;
