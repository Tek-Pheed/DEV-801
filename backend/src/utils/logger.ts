import logger from "pino";
import dayjs from "dayjs";

/**
 * Logger replace console.(log|error|warn|debug)
 * @method info - replacement of .log
 * @method error - replacement of .error
 * @method warn - replacement of .warn
 * @method debug - replacement of .debug
 */
const Logger = logger({
    transport: {
        targets: [
            {
                target: "pino-pretty",
                options: {
                    colorize: true,
                },
                level: "info",
            },
        ],
    },
    base: {
        pid: false,
    },
    timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default Logger;
