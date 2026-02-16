import logger from "pino";
import dayjs from "dayjs";

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
