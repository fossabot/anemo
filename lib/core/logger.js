"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectLog = exports.LogTypeMap = exports.PluginLogger = exports.LskLogger = exports.Devices = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const log4js_1 = __importDefault(require("log4js"));
const node_path_1 = __importDefault(require("node:path"));
const path_1 = require("./path");
const utils_1 = require("../utils");
/** 1:安卓手机 2:aPad 3:安卓手表 4:MacOS 5:iPad */
exports.Devices = ['', 'Android', 'aPad', 'aWatch', 'Mac', 'iPad'];
exports.LskLogger = log4js_1.default.getLogger('lsk');
exports.PluginLogger = log4js_1.default.getLogger('plugin');
exports.LogTypeMap = {
    all: 'gray',
    mark: 'gray',
    trace: 'white',
    debug: 'cyan',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'magenta',
    off: 'magenta'
};
// 添加自定义 log4js Layout 布局：lsk
log4js_1.default.addLayout('lsk', (config) => {
    const { qq, platform, target = 'lsk' } = config;
    // oicq 日志输出到日志文件（可选关闭） logs/LskBot_YYYY-MM-DD_HH-mm-ss.log
    if (target === 'oicq') {
        return (info) => {
            const now = (0, dayjs_1.default)(info.startTime).format(`YYYY-MM-DD HH:mm:ss:SSS`);
            return `[${now}] [${info.level.levelStr}] [${qq}-${exports.Devices[platform]}] ${info.data}`;
        };
    }
    // LskBot 框架日志输出到控制台（包括插件，可选关闭）
    return (info) => {
        const level = info.level.levelStr.toLowerCase();
        const now = (0, dayjs_1.default)(info.startTime).format(`HH:mm:ss`);
        const color = exports.LogTypeMap[level];
        const type = target === 'lsk' ? qq : 'Plugin';
        const head = utils_1.colors[color](`[${now}-${type}]`);
        return head + utils_1.colors.gray(' - ') + info.data;
    };
});
/** 重定向 oicq 日志输出到日志文件 */
function redirectLog(lskLogLevel = 'info', oicq_config, account) {
    const { platform = 5, log_level: oicqLogLevel } = oicq_config;
    // 定义输出文件名和路径
    const now = (0, dayjs_1.default)().format('YYYY-MM-DD_HH-mm-ss');
    const filename = `LskBot_${now}_${account}_${exports.Devices[platform]}`;
    const logFilePath = node_path_1.default.join(path_1.LogDir, `${filename}.log`);
    const errorFilePath = node_path_1.default.join(path_1.LogDir, `${filename}_error.log`);
    // 使用自定义的 Lsk Layout
    const layout = {
        platform,
        type: 'lsk',
        qq: account
    };
    // 配置 log4js
    log4js_1.default.configure({
        appenders: {
            lsk: {
                layout,
                type: 'stdout'
            },
            plugin: {
                type: 'stdout',
                layout: {
                    ...layout,
                    target: 'pluin'
                }
            },
            log_file: {
                type: 'file',
                filename: logFilePath,
                layout: {
                    ...layout,
                    target: 'oicq'
                }
            },
            _error_file: {
                type: 'file',
                filename: errorFilePath,
                layout: {
                    ...layout,
                    target: 'oicq'
                }
            },
            error_file: {
                type: 'logLevelFilter',
                appender: '_error_file',
                level: 'warn'
            }
        },
        categories: {
            default: {
                appenders: ['log_file', 'error_file'],
                level: oicqLogLevel
            },
            lsk: {
                appenders: ['lsk'],
                level: lskLogLevel
            },
            plugin: {
                appenders: ['plugin'],
                level: lskLogLevel
            }
        }
    });
}
exports.redirectLog = redirectLog;
