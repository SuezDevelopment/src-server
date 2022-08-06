
import {
    createLogger,
    LogLevel,
    consoleSink,
    fileSink,
    jsonFormat,
    textFormat,
} from "../deps.ts";
import {green} from '../deps.ts'

export function logger() {
    return createLogger({
    minimumLevel: LogLevel.INFO,
    outputFormat: textFormat, // You can customise the default output format
  })
    .addSink(consoleSink({
      colorOptions: { info: green }, // You can customise the log level colors
    }))
    .addSink(fileSink("./log/all-logs.log"), jsonFormat);
}