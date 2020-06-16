import { HttpException } from "./exception";

export class LogError extends HttpException {
    protocol!: string;
    hostname!: string;
    path!: string;
    originalUrl!: string;
    method!: string;
    subomains!: string[];
    ip!: string;
    ips!: string[];
    userAgent!: string | undefined;

    constructor(status: number, message: string, code: string, data?: object) {
        super(status, message, code, data);
    }
}