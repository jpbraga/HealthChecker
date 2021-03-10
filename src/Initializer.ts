import * as dotenv from "dotenv";
import { Database } from "./database/database";
import { LogService } from './util/log.services';
import { BusinessLayer } from "./orchestration/business.layer";

const entity: string = "Initializer";

export class Initializer {

  private log: LogService;
  private initialized: boolean = false;

  constructor(private db: Database,
    private bs: BusinessLayer) {
    this.log = LogService.getInstnce();
    this.log.info(entity, 'Starting...');
    this.init();
  }

  private async init() {
    try {
      await this.db.init();

      this.initialized = true;
      this.log.info(entity, 'Health Checker has been started...');
      try {
        await this.bs.healthcheck();
        this.log.info(entity, 'Health Check finished successfully!');
        setTimeout(() => {
          process.exit(0);
        }, 500); 
      } catch (err) {
        this.log.error(entity, `Health Check exited with an error - ${err}`);
        setTimeout(() => {
          process.exit(-1);
        }, 500);
      }
    
    } catch (error) {
      this.log.fatal(entity, `An initialization error has occured - ${error.message}`);
      setTimeout(() => {
        process.exit(-1);
      }, 500);
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}