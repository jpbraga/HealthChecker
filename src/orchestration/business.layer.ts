import { Database } from "../database/database";
import { EventNotification } from "../services/event.notification";
//import { KubernetesService } from '../services/kubernetes.service';
import { ENV_VARS } from "../util/consts/env.vars";
import { Environment } from '../util/environment';
import { LogService } from "../util/log.services";

const entity: string = "BusinessLayer";
const REDIS_SERVERS_LIST = "SERVERS";

export class BusinessLayer {

    private log: LogService;
    constructor(private db: Database,
        private en: EventNotification,
        //private ks: KubernetesService
        ) {
        this.log = LogService.getInstnce();
        
    }

    public async healthcheck() {
        this.log.info(entity, `Checking...`);
        const serverlist = await this.db.getSet(REDIS_SERVERS_LIST);

        let serversToDelete:Array<string> = [];
        let usersDisconnected:Array<string> = [];
        
        if(serverlist.length === 0) {
            this.log.info(entity, `No servers to check...`);
            return true;
        }

        for(let server of serverlist) {
            try {
                const result = await this.en.get(JSON.parse(server).address + "/health");
                if(result !== 'OK') throw result;
            } catch (err) {
                serversToDelete.push(server);
                let users = await this.db.getSet(JSON.parse(server).serverId);
                usersDisconnected = usersDisconnected.concat(users);
            }
        }

        if (serversToDelete.length > 0) {
            this.log.info(entity, `There is/are unresponsive ${serversToDelete.length} server(s)`);
            for(let server of serversToDelete) {
                let svr = JSON.parse(server);
                await this.db.removeSet(REDIS_SERVERS_LIST, server);
                await this.db.delete(svr.serverId);
                //await this.ks.deletePod(svr.podName, svr.namespace);
            }
        }

        if (usersDisconnected.length > 0) {
            this.log.info(entity, `There is/are ${usersDisconnected.length} user(s) to be reported as disconnected`);
            for(let user of usersDisconnected) {
                await this.db.delete(user);
            }
            let payload = {
                timestamp: Date.now(),
                users: usersDisconnected
            }
            await this.en.request(
                Environment.getValue(ENV_VARS.EVENT_DISCONNECTED_URL, null),
                'POST',
                payload);
        }

        if(usersDisconnected.length === 0 && serversToDelete.length === 0) {
            this.log.info(entity, `Everything is healthy!`);
        }
        return true;
    }
}