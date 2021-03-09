import * as dotenv from "dotenv";
import { Database } from "./database/database";
import { EventNotification } from "./services/event.notification";
import { Initializer } from "./Initializer";
import { BusinessLayer } from "./orchestration/business.layer";
//import { KubernetesService } from "./services/kubernetes.service";

const result = dotenv.config();
if (result.error) {
  throw result.error;
}

//Initialization
let db: Database = new Database();
let en: EventNotification = new EventNotification();
//let ks: KubernetesService = new KubernetesService();
//let bs: BusinessLayer = new BusinessLayer(db, en, ks);
let bs: BusinessLayer = new BusinessLayer(db, en);
let server: Initializer = new Initializer(db, bs);