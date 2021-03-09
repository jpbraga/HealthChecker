"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLayer = void 0;
const env_vars_1 = require("../util/consts/env.vars");
const environment_1 = require("../util/environment");
const log_services_1 = require("../util/log.services");
const entity = "BusinessLayer";
const REDIS_SERVERS_LIST = "SERVERS";
class BusinessLayer {
    constructor(db, en) {
        this.db = db;
        this.en = en;
        this.log = log_services_1.LogService.getInstnce();
    }
    healthcheck() {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info(entity, `Checking...`);
            const serverlist = yield this.db.getSet(REDIS_SERVERS_LIST);
            let serversToDelete = [];
            let usersDisconnected = [];
            if (serverlist.length === 0) {
                this.log.info(entity, `No servers to check...`);
                return true;
            }
            for (let server of serverlist) {
                try {
                    yield this.en.get(JSON.parse(server).address + "/health");
                }
                catch (err) {
                    serversToDelete.push(server);
                    let users = yield this.db.getSet(JSON.parse(server).serverId);
                    usersDisconnected = usersDisconnected.concat(users);
                }
            }
            if (serversToDelete.length > 0) {
                this.log.info(entity, `There is/are unresponsive ${serversToDelete.length} server(s)`);
                for (let server of serversToDelete) {
                    let svr = JSON.parse(server);
                    yield this.db.removeSet(REDIS_SERVERS_LIST, server);
                    yield this.db.delete(svr.serverId);
                }
            }
            if (usersDisconnected.length > 0) {
                this.log.info(entity, `There is/are ${usersDisconnected.length} user(s) to be reported as disconnected`);
                for (let user of usersDisconnected) {
                    yield this.db.delete(user);
                }
                let payload = {
                    timestamp: Date.now(),
                    users: usersDisconnected
                };
                yield this.en.request(environment_1.Environment.getValue(env_vars_1.ENV_VARS.EVENT_DISCONNECTED_URL, null), 'POST', payload);
            }
            if (usersDisconnected.length === 0 && serversToDelete.length === 0) {
                this.log.info(entity, `Everything is healthy!`);
            }
            return true;
        });
    }
}
exports.BusinessLayer = BusinessLayer;
