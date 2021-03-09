"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.Initializer = void 0;
const dotenv = __importStar(require("dotenv"));
const log_services_1 = require("./util/log.services");
const result = dotenv.config();
if (result.error) {
    throw result.error;
}
const entity = "Initializer";
class Initializer {
    constructor(db, bs) {
        this.db = db;
        this.bs = bs;
        this.initialized = false;
        this.log = log_services_1.LogService.getInstnce();
        this.log.info(entity, 'Starting...');
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.init();
                this.initialized = true;
                this.log.info(entity, 'Health Checker has been started...');
                try {
                    yield this.bs.healthcheck();
                    this.log.info(entity, 'Health Check finished successfully!');
                    setTimeout(() => {
                        process.exit(0);
                    }, 500);
                }
                catch (err) {
                    this.log.error(entity, `Health Check exited with an error - ${err}`);
                    setTimeout(() => {
                        process.exit(-1);
                    }, 500);
                }
            }
            catch (error) {
                this.log.fatal(entity, `An initialization error has occured - ${error.message}`);
                setTimeout(() => {
                    process.exit(-1);
                }, 500);
            }
        });
    }
    isInitialized() {
        return this.initialized;
    }
}
exports.Initializer = Initializer;