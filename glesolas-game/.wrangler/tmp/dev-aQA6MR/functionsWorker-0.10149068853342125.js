var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir4, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env3) {
    return 1;
  }
  hasColors(count4, env3) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd3) {
    this.#cwd = cwd3;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// .wrangler/tmp/pages-IrcrS5/functionsWorker-0.10149068853342125.mjs
import { Writable as Writable2 } from "node:stream";
import { EventEmitter as EventEmitter2 } from "node:events";
var __create = Object.create;
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var __esm = /* @__PURE__ */ __name((fn, res) => /* @__PURE__ */ __name(function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
}, "__init"), "__esm");
var __commonJS = /* @__PURE__ */ __name((cb, mod) => /* @__PURE__ */ __name(function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
}, "__require"), "__commonJS");
var __copyProps = /* @__PURE__ */ __name((to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp2(to, key, { get: /* @__PURE__ */ __name(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
}, "__copyProps");
var __toESM = /* @__PURE__ */ __name((mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp2(target, "default", { value: mod, enumerable: true }) : target,
  mod
)), "__toESM");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError2(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError2, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented2(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError2(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented2, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass2(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass2, "notImplementedClass");
var init_utils = __esm({
  "../node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name2(createNotImplementedError2, "createNotImplementedError");
    __name2(notImplemented2, "notImplemented");
    __name2(notImplementedClass2, "notImplementedClass");
  }
});
var _timeOrigin2;
var _performanceNow2;
var nodeTiming2;
var PerformanceEntry2;
var PerformanceMark3;
var PerformanceMeasure2;
var PerformanceResourceTiming2;
var PerformanceObserverEntryList2;
var Performance2;
var PerformanceObserver2;
var performance2;
var init_performance = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin2 = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow2 = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin2;
    nodeTiming2 = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry2 = class {
      static {
        __name(this, "PerformanceEntry");
      }
      static {
        __name2(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow2();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow2() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark3 = class PerformanceMark2 extends PerformanceEntry2 {
      static {
        __name(this, "PerformanceMark2");
      }
      static {
        __name2(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure2 = class extends PerformanceEntry2 {
      static {
        __name(this, "PerformanceMeasure");
      }
      static {
        __name2(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming2 = class extends PerformanceEntry2 {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      static {
        __name2(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList2 = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      static {
        __name2(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance2 = class {
      static {
        __name(this, "Performance");
      }
      static {
        __name2(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin2;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw /* @__PURE__ */ createNotImplementedError2("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming2;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming2("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin2) {
          return _performanceNow2();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark3(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure2(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw /* @__PURE__ */ createNotImplementedError2("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw /* @__PURE__ */ createNotImplementedError2("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw /* @__PURE__ */ createNotImplementedError2("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver2 = class {
      static {
        __name(this, "PerformanceObserver");
      }
      static {
        __name2(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance2 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance2();
  }
});
var init_perf_hooks = __esm({
  "../node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});
var init_performance2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance2;
    globalThis.Performance = Performance2;
    globalThis.PerformanceEntry = PerformanceEntry2;
    globalThis.PerformanceMark = PerformanceMark3;
    globalThis.PerformanceMeasure = PerformanceMeasure2;
    globalThis.PerformanceObserver = PerformanceObserver2;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList2;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming2;
  }
});
var noop_default2;
var init_noop = __esm({
  "../node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default2 = Object.assign(() => {
    }, { __unenv__: true });
  }
});
var _console2;
var _ignoreErrors2;
var _stderr2;
var _stdout2;
var log3;
var info3;
var trace3;
var debug3;
var table3;
var error3;
var warn3;
var createTask3;
var clear3;
var count3;
var countReset3;
var dir3;
var dirxml3;
var group3;
var groupEnd3;
var groupCollapsed3;
var profile3;
var profileEnd3;
var time3;
var timeEnd3;
var timeLog3;
var timeStamp3;
var Console2;
var _times2;
var _stdoutErrorHandler2;
var _stderrErrorHandler2;
var init_console = __esm({
  "../node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console2 = globalThis.console;
    _ignoreErrors2 = true;
    _stderr2 = new Writable2();
    _stdout2 = new Writable2();
    log3 = _console2?.log ?? noop_default2;
    info3 = _console2?.info ?? log3;
    trace3 = _console2?.trace ?? info3;
    debug3 = _console2?.debug ?? log3;
    table3 = _console2?.table ?? log3;
    error3 = _console2?.error ?? log3;
    warn3 = _console2?.warn ?? error3;
    createTask3 = _console2?.createTask ?? /* @__PURE__ */ notImplemented2("console.createTask");
    clear3 = _console2?.clear ?? noop_default2;
    count3 = _console2?.count ?? noop_default2;
    countReset3 = _console2?.countReset ?? noop_default2;
    dir3 = _console2?.dir ?? noop_default2;
    dirxml3 = _console2?.dirxml ?? noop_default2;
    group3 = _console2?.group ?? noop_default2;
    groupEnd3 = _console2?.groupEnd ?? noop_default2;
    groupCollapsed3 = _console2?.groupCollapsed ?? noop_default2;
    profile3 = _console2?.profile ?? noop_default2;
    profileEnd3 = _console2?.profileEnd ?? noop_default2;
    time3 = _console2?.time ?? noop_default2;
    timeEnd3 = _console2?.timeEnd ?? noop_default2;
    timeLog3 = _console2?.timeLog ?? noop_default2;
    timeStamp3 = _console2?.timeStamp ?? noop_default2;
    Console2 = _console2?.Console ?? /* @__PURE__ */ notImplementedClass2("console.Console");
    _times2 = /* @__PURE__ */ new Map();
    _stdoutErrorHandler2 = noop_default2;
    _stderrErrorHandler2 = noop_default2;
  }
});
var workerdConsole2;
var assert3;
var clear22;
var context2;
var count22;
var countReset22;
var createTask22;
var debug22;
var dir22;
var dirxml22;
var error22;
var group22;
var groupCollapsed22;
var groupEnd22;
var info22;
var log22;
var profile22;
var profileEnd22;
var table22;
var time22;
var timeEnd22;
var timeLog22;
var timeStamp22;
var trace22;
var warn22;
var console_default2;
var init_console2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole2 = globalThis["console"];
    ({
      assert: assert3,
      clear: clear22,
      context: (
        // @ts-expect-error undocumented public API
        context2
      ),
      count: count22,
      countReset: countReset22,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask22
      ),
      debug: debug22,
      dir: dir22,
      dirxml: dirxml22,
      error: error22,
      group: group22,
      groupCollapsed: groupCollapsed22,
      groupEnd: groupEnd22,
      info: info22,
      log: log22,
      profile: profile22,
      profileEnd: profileEnd22,
      table: table22,
      time: time22,
      timeEnd: timeEnd22,
      timeLog: timeLog22,
      timeStamp: timeStamp22,
      trace: trace22,
      warn: warn22
    } = workerdConsole2);
    Object.assign(workerdConsole2, {
      Console: Console2,
      _ignoreErrors: _ignoreErrors2,
      _stderr: _stderr2,
      _stderrErrorHandler: _stderrErrorHandler2,
      _stdout: _stdout2,
      _stdoutErrorHandler: _stdoutErrorHandler2,
      _times: _times2
    });
    console_default2 = workerdConsole2;
  }
});
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default2;
  }
});
var hrtime4;
var init_hrtime = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime4 = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime22(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint2() {
      return BigInt(Date.now() * 1e6);
    }, "bigint"), "bigint") });
  }
});
var ReadStream2;
var init_read_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream2 = class {
      static {
        __name(this, "ReadStream");
      }
      static {
        __name2(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});
var WriteStream2;
var init_write_stream = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream2 = class {
      static {
        __name(this, "WriteStream");
      }
      static {
        __name2(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir32, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env22) {
        return 1;
      }
      hasColors(count32, env22) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});
var init_tty = __esm({
  "../node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});
var NODE_VERSION2;
var init_node_version = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION2 = "22.14.0";
  }
});
var Process2;
var init_process = __esm({
  "../node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process2 = class _Process extends EventEmitter2 {
      static {
        __name(this, "_Process");
      }
      static {
        __name2(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter2.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream2(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream2(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream2(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd22) {
        this.#cwd = cwd22;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION2}`;
      }
      get versions() {
        return { node: NODE_VERSION2 };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw /* @__PURE__ */ createNotImplementedError2("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw /* @__PURE__ */ createNotImplementedError2("process.getActiveResourcesInfo");
      }
      exit() {
        throw /* @__PURE__ */ createNotImplementedError2("process.exit");
      }
      reallyExit() {
        throw /* @__PURE__ */ createNotImplementedError2("process.reallyExit");
      }
      kill() {
        throw /* @__PURE__ */ createNotImplementedError2("process.kill");
      }
      abort() {
        throw /* @__PURE__ */ createNotImplementedError2("process.abort");
      }
      dlopen() {
        throw /* @__PURE__ */ createNotImplementedError2("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw /* @__PURE__ */ createNotImplementedError2("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw /* @__PURE__ */ createNotImplementedError2("process.loadEnvFile");
      }
      disconnect() {
        throw /* @__PURE__ */ createNotImplementedError2("process.disconnect");
      }
      cpuUsage() {
        throw /* @__PURE__ */ createNotImplementedError2("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw /* @__PURE__ */ createNotImplementedError2("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw /* @__PURE__ */ createNotImplementedError2("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw /* @__PURE__ */ createNotImplementedError2("process.initgroups");
      }
      openStdin() {
        throw /* @__PURE__ */ createNotImplementedError2("process.openStdin");
      }
      assert() {
        throw /* @__PURE__ */ createNotImplementedError2("process.assert");
      }
      binding() {
        throw /* @__PURE__ */ createNotImplementedError2("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented2("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented2("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented2("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented2("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented2("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented2("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});
var globalProcess2;
var getBuiltinModule2;
var workerdProcess2;
var isWorkerdProcessV22;
var unenvProcess2;
var exit2;
var features2;
var platform2;
var env2;
var hrtime32;
var nextTick2;
var _channel2;
var _disconnect2;
var _events2;
var _eventsCount2;
var _handleQueue2;
var _maxListeners2;
var _pendingMessage2;
var _send2;
var assert22;
var disconnect2;
var mainModule2;
var _debugEnd2;
var _debugProcess2;
var _exiting2;
var _fatalException2;
var _getActiveHandles2;
var _getActiveRequests2;
var _kill2;
var _linkedBinding2;
var _preload_modules2;
var _rawDebug2;
var _startProfilerIdleNotifier2;
var _stopProfilerIdleNotifier2;
var _tickCallback2;
var abort2;
var addListener2;
var allowedNodeEnvironmentFlags2;
var arch2;
var argv2;
var argv02;
var availableMemory2;
var binding2;
var channel2;
var chdir2;
var config2;
var connected2;
var constrainedMemory2;
var cpuUsage2;
var cwd2;
var debugPort2;
var dlopen2;
var domain2;
var emit2;
var emitWarning2;
var eventNames2;
var execArgv2;
var execPath2;
var exitCode2;
var finalization2;
var getActiveResourcesInfo2;
var getegid2;
var geteuid2;
var getgid2;
var getgroups2;
var getMaxListeners2;
var getuid2;
var hasUncaughtExceptionCaptureCallback2;
var initgroups2;
var kill2;
var listenerCount2;
var listeners2;
var loadEnvFile2;
var memoryUsage2;
var moduleLoadList2;
var off2;
var on2;
var once2;
var openStdin2;
var permission2;
var pid2;
var ppid2;
var prependListener2;
var prependOnceListener2;
var rawListeners2;
var reallyExit2;
var ref2;
var release2;
var removeAllListeners2;
var removeListener2;
var report2;
var resourceUsage2;
var send2;
var setegid2;
var seteuid2;
var setgid2;
var setgroups2;
var setMaxListeners2;
var setSourceMapsEnabled2;
var setuid2;
var setUncaughtExceptionCaptureCallback2;
var sourceMapsEnabled2;
var stderr2;
var stdin2;
var stdout2;
var throwDeprecation2;
var title2;
var traceDeprecation2;
var umask2;
var unref2;
var uptime2;
var version2;
var versions2;
var _process2;
var process_default2;
var init_process2 = __esm({
  "../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess2 = globalThis["process"];
    getBuiltinModule2 = globalProcess2.getBuiltinModule;
    workerdProcess2 = getBuiltinModule2("node:process");
    isWorkerdProcessV22 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
    unenvProcess2 = new Process2({
      env: globalProcess2.env,
      // `hrtime` is only available from workerd process v2
      hrtime: isWorkerdProcessV22 ? workerdProcess2.hrtime : hrtime4,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess2.nextTick
    });
    ({ exit: exit2, features: features2, platform: platform2 } = workerdProcess2);
    ({
      env: (
        // Always implemented by workerd
        env2
      ),
      hrtime: (
        // Only implemented in workerd v2
        hrtime32
      ),
      nextTick: (
        // Always implemented by workerd
        nextTick2
      )
    } = unenvProcess2);
    ({
      _channel: _channel2,
      _disconnect: _disconnect2,
      _events: _events2,
      _eventsCount: _eventsCount2,
      _handleQueue: _handleQueue2,
      _maxListeners: _maxListeners2,
      _pendingMessage: _pendingMessage2,
      _send: _send2,
      assert: assert22,
      disconnect: disconnect2,
      mainModule: mainModule2
    } = unenvProcess2);
    ({
      _debugEnd: (
        // @ts-expect-error `_debugEnd` is missing typings
        _debugEnd2
      ),
      _debugProcess: (
        // @ts-expect-error `_debugProcess` is missing typings
        _debugProcess2
      ),
      _exiting: (
        // @ts-expect-error `_exiting` is missing typings
        _exiting2
      ),
      _fatalException: (
        // @ts-expect-error `_fatalException` is missing typings
        _fatalException2
      ),
      _getActiveHandles: (
        // @ts-expect-error `_getActiveHandles` is missing typings
        _getActiveHandles2
      ),
      _getActiveRequests: (
        // @ts-expect-error `_getActiveRequests` is missing typings
        _getActiveRequests2
      ),
      _kill: (
        // @ts-expect-error `_kill` is missing typings
        _kill2
      ),
      _linkedBinding: (
        // @ts-expect-error `_linkedBinding` is missing typings
        _linkedBinding2
      ),
      _preload_modules: (
        // @ts-expect-error `_preload_modules` is missing typings
        _preload_modules2
      ),
      _rawDebug: (
        // @ts-expect-error `_rawDebug` is missing typings
        _rawDebug2
      ),
      _startProfilerIdleNotifier: (
        // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
        _startProfilerIdleNotifier2
      ),
      _stopProfilerIdleNotifier: (
        // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
        _stopProfilerIdleNotifier2
      ),
      _tickCallback: (
        // @ts-expect-error `_tickCallback` is missing typings
        _tickCallback2
      ),
      abort: abort2,
      addListener: addListener2,
      allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
      arch: arch2,
      argv: argv2,
      argv0: argv02,
      availableMemory: availableMemory2,
      binding: (
        // @ts-expect-error `binding` is missing typings
        binding2
      ),
      channel: channel2,
      chdir: chdir2,
      config: config2,
      connected: connected2,
      constrainedMemory: constrainedMemory2,
      cpuUsage: cpuUsage2,
      cwd: cwd2,
      debugPort: debugPort2,
      dlopen: dlopen2,
      domain: (
        // @ts-expect-error `domain` is missing typings
        domain2
      ),
      emit: emit2,
      emitWarning: emitWarning2,
      eventNames: eventNames2,
      execArgv: execArgv2,
      execPath: execPath2,
      exitCode: exitCode2,
      finalization: finalization2,
      getActiveResourcesInfo: getActiveResourcesInfo2,
      getegid: getegid2,
      geteuid: geteuid2,
      getgid: getgid2,
      getgroups: getgroups2,
      getMaxListeners: getMaxListeners2,
      getuid: getuid2,
      hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
      initgroups: (
        // @ts-expect-error `initgroups` is missing typings
        initgroups2
      ),
      kill: kill2,
      listenerCount: listenerCount2,
      listeners: listeners2,
      loadEnvFile: loadEnvFile2,
      memoryUsage: memoryUsage2,
      moduleLoadList: (
        // @ts-expect-error `moduleLoadList` is missing typings
        moduleLoadList2
      ),
      off: off2,
      on: on2,
      once: once2,
      openStdin: (
        // @ts-expect-error `openStdin` is missing typings
        openStdin2
      ),
      permission: permission2,
      pid: pid2,
      ppid: ppid2,
      prependListener: prependListener2,
      prependOnceListener: prependOnceListener2,
      rawListeners: rawListeners2,
      reallyExit: (
        // @ts-expect-error `reallyExit` is missing typings
        reallyExit2
      ),
      ref: ref2,
      release: release2,
      removeAllListeners: removeAllListeners2,
      removeListener: removeListener2,
      report: report2,
      resourceUsage: resourceUsage2,
      send: send2,
      setegid: setegid2,
      seteuid: seteuid2,
      setgid: setgid2,
      setgroups: setgroups2,
      setMaxListeners: setMaxListeners2,
      setSourceMapsEnabled: setSourceMapsEnabled2,
      setuid: setuid2,
      setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
      sourceMapsEnabled: sourceMapsEnabled2,
      stderr: stderr2,
      stdin: stdin2,
      stdout: stdout2,
      throwDeprecation: throwDeprecation2,
      title: title2,
      traceDeprecation: traceDeprecation2,
      umask: umask2,
      unref: unref2,
      uptime: uptime2,
      version: version2,
      versions: versions2
    } = isWorkerdProcessV22 ? workerdProcess2 : unenvProcess2);
    _process2 = {
      abort: abort2,
      addListener: addListener2,
      allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
      hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
      setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
      loadEnvFile: loadEnvFile2,
      sourceMapsEnabled: sourceMapsEnabled2,
      arch: arch2,
      argv: argv2,
      argv0: argv02,
      chdir: chdir2,
      config: config2,
      connected: connected2,
      constrainedMemory: constrainedMemory2,
      availableMemory: availableMemory2,
      cpuUsage: cpuUsage2,
      cwd: cwd2,
      debugPort: debugPort2,
      dlopen: dlopen2,
      disconnect: disconnect2,
      emit: emit2,
      emitWarning: emitWarning2,
      env: env2,
      eventNames: eventNames2,
      execArgv: execArgv2,
      execPath: execPath2,
      exit: exit2,
      finalization: finalization2,
      features: features2,
      getBuiltinModule: getBuiltinModule2,
      getActiveResourcesInfo: getActiveResourcesInfo2,
      getMaxListeners: getMaxListeners2,
      hrtime: hrtime32,
      kill: kill2,
      listeners: listeners2,
      listenerCount: listenerCount2,
      memoryUsage: memoryUsage2,
      nextTick: nextTick2,
      on: on2,
      off: off2,
      once: once2,
      pid: pid2,
      platform: platform2,
      ppid: ppid2,
      prependListener: prependListener2,
      prependOnceListener: prependOnceListener2,
      rawListeners: rawListeners2,
      release: release2,
      removeAllListeners: removeAllListeners2,
      removeListener: removeListener2,
      report: report2,
      resourceUsage: resourceUsage2,
      setMaxListeners: setMaxListeners2,
      setSourceMapsEnabled: setSourceMapsEnabled2,
      stderr: stderr2,
      stdin: stdin2,
      stdout: stdout2,
      title: title2,
      throwDeprecation: throwDeprecation2,
      traceDeprecation: traceDeprecation2,
      umask: umask2,
      uptime: uptime2,
      version: version2,
      versions: versions2,
      // @ts-expect-error old API
      domain: domain2,
      initgroups: initgroups2,
      moduleLoadList: moduleLoadList2,
      reallyExit: reallyExit2,
      openStdin: openStdin2,
      assert: assert22,
      binding: binding2,
      send: send2,
      exitCode: exitCode2,
      channel: channel2,
      getegid: getegid2,
      geteuid: geteuid2,
      getgid: getgid2,
      getgroups: getgroups2,
      getuid: getuid2,
      setegid: setegid2,
      seteuid: seteuid2,
      setgid: setgid2,
      setgroups: setgroups2,
      setuid: setuid2,
      permission: permission2,
      mainModule: mainModule2,
      _events: _events2,
      _eventsCount: _eventsCount2,
      _exiting: _exiting2,
      _maxListeners: _maxListeners2,
      _debugEnd: _debugEnd2,
      _debugProcess: _debugProcess2,
      _fatalException: _fatalException2,
      _getActiveHandles: _getActiveHandles2,
      _getActiveRequests: _getActiveRequests2,
      _kill: _kill2,
      _preload_modules: _preload_modules2,
      _rawDebug: _rawDebug2,
      _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
      _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
      _tickCallback: _tickCallback2,
      _disconnect: _disconnect2,
      _handleQueue: _handleQueue2,
      _pendingMessage: _pendingMessage2,
      _channel: _channel2,
      _send: _send2,
      _linkedBinding: _linkedBinding2
    };
    process_default2 = _process2;
  }
});
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default2;
  }
});
async function onRequestPost(context22) {
  try {
    const {
      text,
      voice_id = "JBFqnCBsd6RMkjVDRZzb",
      // Default: George voice
      model_id = "eleven_flash_v2_5",
      // Fastest, cheapest (50% cost)
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true
      }
    } = await context22.request.json();
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const MAX_CHARS = 2500;
    if (text.length > MAX_CHARS) {
      return new Response(
        JSON.stringify({
          error: `Text exceeds maximum length of ${MAX_CHARS} characters`,
          current_length: text.length
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const apiKey = context22.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error("\u274C ELEVENLABS_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log(`\u{1F399}\uFE0F Generating audio for ${text.length} characters with voice ${voice_id}`);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings
        })
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("\u274C ElevenLabs API error:", response.status, errorText);
      return new Response(
        JSON.stringify({
          error: "Audio generation failed",
          status: response.status,
          details: errorText
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const audioBuffer = await response.arrayBuffer();
    console.log(`\u2705 Audio generated successfully (${audioBuffer.byteLength} bytes)`);
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600"
        // Cache for 1 hour
      }
    });
  } catch (error32) {
    console.error("\u274C Audio generation failed:", error32);
    return new Response(
      JSON.stringify({
        error: "Audio generation failed",
        details: error32 instanceof Error ? error32.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost, "onRequestPost");
var init_generate_audio = __esm({
  "api/generate-audio.ts"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name2(onRequestPost, "onRequestPost");
  }
});
var require_error = __commonJS({
  "../node_modules/replicate/lib/error.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ApiError = class extends Error {
      static {
        __name(this, "ApiError");
      }
      static {
        __name2(this, "ApiError");
      }
      /**
       * Creates a representation of an API error.
       *
       * @param {string} message - Error message
       * @param {Request} request - HTTP request
       * @param {Response} response - HTTP response
       * @returns {ApiError} - An instance of ApiError
       */
      constructor(message, request, response) {
        super(message);
        this.name = "ApiError";
        this.request = request;
        this.response = response;
      }
    };
    module.exports = ApiError;
  }
});
var require_identifier = __commonJS({
  "../node_modules/replicate/lib/identifier.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ModelVersionIdentifier = class _ModelVersionIdentifier {
      static {
        __name(this, "_ModelVersionIdentifier");
      }
      static {
        __name2(this, "ModelVersionIdentifier");
      }
      /*
       * @param {string} Required. The model owner.
       * @param {string} Required. The model name.
       * @param {string} The model version.
       */
      constructor(owner, name, version22 = null) {
        this.owner = owner;
        this.name = name;
        this.version = version22;
      }
      /*
       * Parse a reference to a model version
       *
       * @param {string}
       * @returns {ModelVersionIdentifier}
       * @throws {Error} If the reference is invalid.
       */
      static parse(ref22) {
        const match2 = ref22.match(
          /^(?<owner>[^/]+)\/(?<name>[^/:]+)(:(?<version>.+))?$/
        );
        if (!match2) {
          throw new Error(
            `Invalid reference to model version: ${ref22}. Expected format: owner/name or owner/name:version`
          );
        }
        const { owner, name, version: version22 } = match2.groups;
        return new _ModelVersionIdentifier(owner, name, version22);
      }
    };
    module.exports = ModelVersionIdentifier;
  }
});
var require_files = __commonJS({
  "../node_modules/replicate/lib/files.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function createFile(file, metadata = {}, { signal } = {}) {
      const form = new FormData();
      let filename;
      let blob;
      if (file instanceof Blob) {
        filename = file.name || `blob_${Date.now()}`;
        blob = file;
      } else if (Buffer.isBuffer(file)) {
        filename = `buffer_${Date.now()}`;
        const bytes = new Uint8Array(file);
        blob = new Blob([bytes], {
          type: "application/octet-stream",
          name: filename
        });
      } else {
        throw new Error("Invalid file argument, must be a Blob, File or Buffer");
      }
      form.append("content", blob, filename);
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      const response = await this.request("/files", {
        method: "POST",
        data: form,
        headers: {
          "Content-Type": "multipart/form-data"
        },
        signal
      });
      return response.json();
    }
    __name(createFile, "createFile");
    __name2(createFile, "createFile");
    async function listFiles({ signal } = {}) {
      const response = await this.request("/files", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listFiles, "listFiles");
    __name2(listFiles, "listFiles");
    async function getFile(file_id, { signal } = {}) {
      const response = await this.request(`/files/${file_id}`, {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getFile, "getFile");
    __name2(getFile, "getFile");
    async function deleteFile(file_id, { signal } = {}) {
      const response = await this.request(`/files/${file_id}`, {
        method: "DELETE",
        signal
      });
      return response.status === 204;
    }
    __name(deleteFile, "deleteFile");
    __name2(deleteFile, "deleteFile");
    module.exports = {
      create: createFile,
      list: listFiles,
      get: getFile,
      delete: deleteFile
    };
  }
});
var require_util = __commonJS({
  "../node_modules/replicate/lib/util.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ApiError = require_error();
    var { create: createFile } = require_files();
    async function validateWebhook(requestData, secretOrCrypto, customCrypto) {
      let id;
      let body;
      let timestamp;
      let signature;
      let secret;
      let crypto = globalThis.crypto;
      if (requestData && requestData.headers && requestData.body) {
        if (typeof requestData.headers.get === "function") {
          id = requestData.headers.get("webhook-id");
          timestamp = requestData.headers.get("webhook-timestamp");
          signature = requestData.headers.get("webhook-signature");
        } else {
          id = requestData.headers["webhook-id"];
          timestamp = requestData.headers["webhook-timestamp"];
          signature = requestData.headers["webhook-signature"];
        }
        body = requestData.body;
        if (typeof secretOrCrypto !== "string") {
          throw new Error(
            "Unexpected value for secret passed to validateWebhook, expected a string"
          );
        }
        secret = secretOrCrypto;
        if (customCrypto) {
          crypto = customCrypto;
        }
      } else {
        id = requestData.id;
        body = requestData.body;
        timestamp = requestData.timestamp;
        signature = requestData.signature;
        secret = requestData.secret;
        if (secretOrCrypto) {
          crypto = secretOrCrypto;
        }
      }
      if (body instanceof ReadableStream || body.readable) {
        try {
          body = await new Response(body).text();
        } catch (err) {
          throw new Error(`Error reading body: ${err.message}`);
        }
      } else if (isTypedArray(body)) {
        body = await new Blob([body]).text();
      } else if (typeof body === "object") {
        body = JSON.stringify(body);
      } else if (typeof body !== "string") {
        throw new Error("Invalid body type");
      }
      if (!id || !timestamp || !signature) {
        throw new Error("Missing required webhook headers");
      }
      if (!body) {
        throw new Error("Missing required body");
      }
      if (!secret) {
        throw new Error("Missing required secret");
      }
      if (!crypto) {
        throw new Error(
          'Missing `crypto` implementation. If using Node 18 pass in require("node:crypto").webcrypto'
        );
      }
      const signedContent = `${id}.${timestamp}.${body}`;
      const computedSignature = await createHMACSHA256(
        secret.split("_").pop(),
        signedContent,
        crypto
      );
      const expectedSignatures = signature.split(" ").map((sig) => sig.split(",")[1]);
      return expectedSignatures.some(
        (expectedSignature) => expectedSignature === computedSignature
      );
    }
    __name(validateWebhook, "validateWebhook");
    __name2(validateWebhook, "validateWebhook");
    async function createHMACSHA256(secret, data, crypto) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        base64ToBytes(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
      return bytesToBase64(signature);
    }
    __name(createHMACSHA256, "createHMACSHA256");
    __name2(createHMACSHA256, "createHMACSHA256");
    function base64ToBytes(base64) {
      return Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
    }
    __name(base64ToBytes, "base64ToBytes");
    __name2(base64ToBytes, "base64ToBytes");
    function bytesToBase64(bytes) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)));
    }
    __name(bytesToBase64, "bytesToBase64");
    __name2(bytesToBase64, "bytesToBase64");
    async function withAutomaticRetries(request, options = {}) {
      const shouldRetry = options.shouldRetry || (() => false);
      const maxRetries = options.maxRetries || 5;
      const interval = options.interval || 500;
      const jitter = options.jitter || 100;
      const sleep = /* @__PURE__ */ __name2((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");
      let attempts = 0;
      do {
        let delay = interval * 2 ** attempts + Math.random() * jitter;
        try {
          const response = await request();
          if (response.ok || !shouldRetry(response)) {
            return response;
          }
        } catch (error32) {
          if (error32 instanceof ApiError) {
            const retryAfter = error32.response.headers.get("Retry-After");
            if (retryAfter) {
              if (!Number.isInteger(retryAfter)) {
                const date = new Date(retryAfter);
                if (!Number.isNaN(date.getTime())) {
                  delay = date.getTime() - (/* @__PURE__ */ new Date()).getTime();
                }
              } else {
                delay = retryAfter * 1e3;
              }
            }
          }
        }
        if (Number.isInteger(maxRetries) && maxRetries > 0) {
          if (Number.isInteger(delay) && delay > 0) {
            await sleep(interval * 2 ** (options.maxRetries - maxRetries));
          }
          attempts += 1;
        }
      } while (attempts < maxRetries);
      return request();
    }
    __name(withAutomaticRetries, "withAutomaticRetries");
    __name2(withAutomaticRetries, "withAutomaticRetries");
    async function transformFileInputs(client, inputs, strategy) {
      switch (strategy) {
        case "data-uri":
          return await transformFileInputsToBase64EncodedDataURIs(client, inputs);
        case "upload":
          return await transformFileInputsToReplicateFileURLs(client, inputs);
        case "default":
          try {
            return await transformFileInputsToReplicateFileURLs(client, inputs);
          } catch (error32) {
            if (error32 instanceof ApiError && error32.response.status >= 400 && error32.response.status < 500) {
              throw error32;
            }
            return await transformFileInputsToBase64EncodedDataURIs(inputs);
          }
        default:
          throw new Error(`Unexpected file upload strategy: ${strategy}`);
      }
    }
    __name(transformFileInputs, "transformFileInputs");
    __name2(transformFileInputs, "transformFileInputs");
    async function transformFileInputsToReplicateFileURLs(client, inputs) {
      return await transform(inputs, async (value) => {
        if (value instanceof Blob || value instanceof Buffer) {
          const file = await createFile.call(client, value);
          return file.urls.get;
        }
        return value;
      });
    }
    __name(transformFileInputsToReplicateFileURLs, "transformFileInputsToReplicateFileURLs");
    __name2(transformFileInputsToReplicateFileURLs, "transformFileInputsToReplicateFileURLs");
    var MAX_DATA_URI_SIZE = 1e7;
    async function transformFileInputsToBase64EncodedDataURIs(inputs) {
      let totalBytes = 0;
      return await transform(inputs, async (value) => {
        let buffer;
        let mime;
        if (value instanceof Blob) {
          buffer = await value.arrayBuffer();
          mime = value.type;
        } else if (isTypedArray(value)) {
          buffer = value;
        } else {
          return value;
        }
        totalBytes += buffer.byteLength;
        if (totalBytes > MAX_DATA_URI_SIZE) {
          throw new Error(
            `Combined filesize of prediction ${totalBytes} bytes exceeds 10mb limit for inline encoding, please provide URLs instead`
          );
        }
        const data = bytesToBase64(buffer);
        mime = mime || "application/octet-stream";
        return `data:${mime};base64,${data}`;
      });
    }
    __name(transformFileInputsToBase64EncodedDataURIs, "transformFileInputsToBase64EncodedDataURIs");
    __name2(transformFileInputsToBase64EncodedDataURIs, "transformFileInputsToBase64EncodedDataURIs");
    async function transform(value, mapper) {
      if (Array.isArray(value)) {
        const copy = [];
        for (const val of value) {
          const transformed = await transform(val, mapper);
          copy.push(transformed);
        }
        return copy;
      }
      if (isPlainObject(value)) {
        const copy = {};
        for (const key of Object.keys(value)) {
          copy[key] = await transform(value[key], mapper);
        }
        return copy;
      }
      return await mapper(value);
    }
    __name(transform, "transform");
    __name2(transform, "transform");
    function isTypedArray(arr) {
      return arr instanceof Int8Array || arr instanceof Int16Array || arr instanceof Int32Array || arr instanceof Uint8Array || arr instanceof Uint8ClampedArray || arr instanceof Uint16Array || arr instanceof Uint32Array || arr instanceof Float32Array || arr instanceof Float64Array;
    }
    __name(isTypedArray, "isTypedArray");
    __name2(isTypedArray, "isTypedArray");
    function isPlainObject(value) {
      const isObjectLike = typeof value === "object" && value !== null;
      if (!isObjectLike || String(value) !== "[object Object]") {
        return false;
      }
      const proto = Object.getPrototypeOf(value);
      if (proto === null) {
        return true;
      }
      const Ctor = Object.prototype.hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor === "function" && Ctor instanceof Ctor && Function.prototype.toString.call(Ctor) === Function.prototype.toString.call(Object);
    }
    __name(isPlainObject, "isPlainObject");
    __name2(isPlainObject, "isPlainObject");
    function parseProgressFromLogs(input) {
      const logs = typeof input === "object" && input.logs ? input.logs : input;
      if (!logs || typeof logs !== "string") {
        return null;
      }
      const pattern = /^\s*(\d+)%\s*\|.+?\|\s*(\d+)\/(\d+)/;
      const lines = logs.split("\n").reverse();
      for (const line of lines) {
        const matches = line.match(pattern);
        if (matches && matches.length === 4) {
          return {
            percentage: parseInt(matches[1], 10) / 100,
            current: parseInt(matches[2], 10),
            total: parseInt(matches[3], 10)
          };
        }
      }
      return null;
    }
    __name(parseProgressFromLogs, "parseProgressFromLogs");
    __name2(parseProgressFromLogs, "parseProgressFromLogs");
    async function* streamAsyncIterator(stream) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
    __name(streamAsyncIterator, "streamAsyncIterator");
    __name2(streamAsyncIterator, "streamAsyncIterator");
    module.exports = {
      transform,
      transformFileInputs,
      validateWebhook,
      withAutomaticRetries,
      parseProgressFromLogs,
      streamAsyncIterator
    };
  }
});
var require_stream = __commonJS({
  "../node_modules/replicate/vendor/eventsource-parser/stream.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var __defProp22 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name2((target, all) => {
      for (var name in all)
        __defProp22(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps2 = /* @__PURE__ */ __name2((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp22(to, key, {
              get: /* @__PURE__ */ __name2(() => from[key], "get"),
              enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable
            });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name2((mod) => __copyProps2(__defProp22({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var input_exports = {};
    __export(input_exports, {
      EventSourceParserStream: /* @__PURE__ */ __name2(() => EventSourceParserStream, "EventSourceParserStream")
    });
    module.exports = __toCommonJS(input_exports);
    function createParser(onParse) {
      let isFirstChunk;
      let buffer;
      let startingPosition;
      let startingFieldLength;
      let eventId;
      let eventName;
      let data;
      reset();
      return {
        feed,
        reset
      };
      function reset() {
        isFirstChunk = true;
        buffer = "";
        startingPosition = 0;
        startingFieldLength = -1;
        eventId = void 0;
        eventName = void 0;
        data = "";
      }
      __name(reset, "reset");
      __name2(reset, "reset");
      function feed(chunk) {
        buffer = buffer ? buffer + chunk : chunk;
        if (isFirstChunk && hasBom(buffer)) {
          buffer = buffer.slice(BOM.length);
        }
        isFirstChunk = false;
        const length = buffer.length;
        let position = 0;
        let discardTrailingNewline = false;
        while (position < length) {
          if (discardTrailingNewline) {
            if (buffer[position] === "\n") {
              ++position;
            }
            discardTrailingNewline = false;
          }
          let lineLength = -1;
          let fieldLength = startingFieldLength;
          let character;
          for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
            character = buffer[index];
            if (character === ":" && fieldLength < 0) {
              fieldLength = index - position;
            } else if (character === "\r") {
              discardTrailingNewline = true;
              lineLength = index - position;
            } else if (character === "\n") {
              lineLength = index - position;
            }
          }
          if (lineLength < 0) {
            startingPosition = length - position;
            startingFieldLength = fieldLength;
            break;
          } else {
            startingPosition = 0;
            startingFieldLength = -1;
          }
          parseEventStreamLine(buffer, position, fieldLength, lineLength);
          position += lineLength + 1;
        }
        if (position === length) {
          buffer = "";
        } else if (position > 0) {
          buffer = buffer.slice(position);
        }
      }
      __name(feed, "feed");
      __name2(feed, "feed");
      function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
        if (lineLength === 0) {
          if (data.length > 0) {
            onParse({
              type: "event",
              id: eventId,
              event: eventName || void 0,
              data: data.slice(0, -1)
              // remove trailing newline
            });
            data = "";
            eventId = void 0;
          }
          eventName = void 0;
          return;
        }
        const noValue = fieldLength < 0;
        const field = lineBuffer.slice(
          index,
          index + (noValue ? lineLength : fieldLength)
        );
        let step = 0;
        if (noValue) {
          step = lineLength;
        } else if (lineBuffer[index + fieldLength + 1] === " ") {
          step = fieldLength + 2;
        } else {
          step = fieldLength + 1;
        }
        const position = index + step;
        const valueLength = lineLength - step;
        const value = lineBuffer.slice(position, position + valueLength).toString();
        if (field === "data") {
          data += value ? "".concat(value, "\n") : "\n";
        } else if (field === "event") {
          eventName = value;
        } else if (field === "id" && !value.includes("\0")) {
          eventId = value;
        } else if (field === "retry") {
          const retry = parseInt(value, 10);
          if (!Number.isNaN(retry)) {
            onParse({
              type: "reconnect-interval",
              value: retry
            });
          }
        }
      }
      __name(parseEventStreamLine, "parseEventStreamLine");
      __name2(parseEventStreamLine, "parseEventStreamLine");
    }
    __name(createParser, "createParser");
    __name2(createParser, "createParser");
    var BOM = [239, 187, 191];
    function hasBom(buffer) {
      return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode);
    }
    __name(hasBom, "hasBom");
    __name2(hasBom, "hasBom");
    var EventSourceParserStream = class extends TransformStream {
      static {
        __name(this, "EventSourceParserStream");
      }
      static {
        __name2(this, "EventSourceParserStream");
      }
      constructor() {
        let parser;
        super({
          start(controller) {
            parser = createParser((event) => {
              if (event.type === "event") {
                controller.enqueue(event);
              }
            });
          },
          transform(chunk) {
            parser.feed(chunk);
          }
        });
      }
    };
  }
});
var require_text_decoder_stream = __commonJS({
  "../node_modules/replicate/vendor/streams-text-encoding/text-decoder-stream.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var __defProp22 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export = /* @__PURE__ */ __name2((target, all) => {
      for (var name in all)
        __defProp22(target, name, { get: all[name], enumerable: true });
    }, "__export");
    var __copyProps2 = /* @__PURE__ */ __name2((to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp22(to, key, { get: /* @__PURE__ */ __name2(() => from[key], "get"), enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    }, "__copyProps");
    var __toCommonJS = /* @__PURE__ */ __name2((mod) => __copyProps2(__defProp22({}, "__esModule", { value: true }), mod), "__toCommonJS");
    var input_exports = {};
    __export(input_exports, {
      TextDecoderStream: /* @__PURE__ */ __name2(() => TextDecoderStream, "TextDecoderStream")
    });
    module.exports = __toCommonJS(input_exports);
    var decDecoder = Symbol("decDecoder");
    var decTransform = Symbol("decTransform");
    var TextDecodeTransformer = class {
      static {
        __name(this, "TextDecodeTransformer");
      }
      static {
        __name2(this, "TextDecodeTransformer");
      }
      constructor(decoder) {
        this.decoder_ = decoder;
      }
      transform(chunk, controller) {
        if (!(chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk))) {
          throw new TypeError("Input data must be a BufferSource");
        }
        const text = this.decoder_.decode(chunk, { stream: true });
        if (text.length !== 0) {
          controller.enqueue(text);
        }
      }
      flush(controller) {
        const text = this.decoder_.decode();
        if (text.length !== 0) {
          controller.enqueue(text);
        }
      }
    };
    var TextDecoderStream = class {
      static {
        __name(this, "TextDecoderStream");
      }
      static {
        __name2(this, "TextDecoderStream");
      }
      constructor(label, options) {
        const decoder = new TextDecoder(label || "utf-8", options || {});
        this[decDecoder] = decoder;
        this[decTransform] = new TransformStream(new TextDecodeTransformer(decoder));
      }
      get encoding() {
        return this[decDecoder].encoding;
      }
      get fatal() {
        return this[decDecoder].fatal;
      }
      get ignoreBOM() {
        return this[decDecoder].ignoreBOM;
      }
      get readable() {
        return this[decTransform].readable;
      }
      get writable() {
        return this[decTransform].writable;
      }
    };
    var encEncoder = Symbol("encEncoder");
    var encTransform = Symbol("encTransform");
  }
});
var require_stream2 = __commonJS({
  "../node_modules/replicate/lib/stream.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ApiError = require_error();
    var { streamAsyncIterator } = require_util();
    var {
      EventSourceParserStream
    } = require_stream();
    var { TextDecoderStream } = typeof globalThis.TextDecoderStream === "undefined" ? require_text_decoder_stream() : globalThis;
    var ServerSentEvent = class {
      static {
        __name(this, "ServerSentEvent");
      }
      static {
        __name2(this, "ServerSentEvent");
      }
      /**
       * Create a new server-sent event.
       *
       * @param {string} event The event name.
       * @param {string} data The event data.
       * @param {string} id The event ID.
       * @param {number} retry The retry time.
       */
      constructor(event, data, id, retry) {
        this.event = event;
        this.data = data;
        this.id = id;
        this.retry = retry;
      }
      /**
       * Convert the event to a string.
       */
      toString() {
        if (this.event === "output") {
          return this.data;
        }
        return "";
      }
    };
    function createReadableStream({ url, fetch: fetch2, options = {} }) {
      const { useFileOutput = true, headers = {}, ...initOptions } = options;
      return new ReadableStream({
        async start(controller) {
          const init2 = {
            ...initOptions,
            headers: {
              ...headers,
              Accept: "text/event-stream"
            }
          };
          const response = await fetch2(url, init2);
          if (!response.ok) {
            const text = await response.text();
            const request = new Request(url, init2);
            controller.error(
              new ApiError(
                `Request to ${url} failed with status ${response.status}: ${text}`,
                request,
                response
              )
            );
          }
          const stream = response.body.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream());
          for await (const event of streamAsyncIterator(stream)) {
            if (event.event === "error") {
              controller.error(new Error(event.data));
              break;
            }
            let data = event.data;
            if (useFileOutput && typeof data === "string" && (data.startsWith("https:") || data.startsWith("data:"))) {
              data = createFileOutput({ data, fetch: fetch2 });
            }
            controller.enqueue(new ServerSentEvent(event.event, data, event.id));
            if (event.event === "done") {
              break;
            }
          }
          controller.close();
        }
      });
    }
    __name(createReadableStream, "createReadableStream");
    __name2(createReadableStream, "createReadableStream");
    function createFileOutput({ url, fetch: fetch2 }) {
      let type = "application/octet-stream";
      class FileOutput extends ReadableStream {
        static {
          __name(this, "FileOutput");
        }
        static {
          __name2(this, "FileOutput");
        }
        async blob() {
          const chunks = [];
          for await (const chunk of this) {
            chunks.push(chunk);
          }
          return new Blob(chunks, { type });
        }
        url() {
          return new URL(url);
        }
        toString() {
          return url;
        }
      }
      return new FileOutput({
        async start(controller) {
          const response = await fetch2(url);
          if (!response.ok) {
            const text = await response.text();
            const request = new Request(url, init);
            controller.error(
              new ApiError(
                `Request to ${url} failed with status ${response.status}: ${text}`,
                request,
                response
              )
            );
          }
          if (response.headers.get("Content-Type")) {
            type = response.headers.get("Content-Type");
          }
          try {
            for await (const chunk of streamAsyncIterator(response.body)) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        }
      });
    }
    __name(createFileOutput, "createFileOutput");
    __name2(createFileOutput, "createFileOutput");
    module.exports = {
      createFileOutput,
      createReadableStream,
      ServerSentEvent
    };
  }
});
var require_accounts = __commonJS({
  "../node_modules/replicate/lib/accounts.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function getCurrentAccount({ signal } = {}) {
      const response = await this.request("/account", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getCurrentAccount, "getCurrentAccount");
    __name2(getCurrentAccount, "getCurrentAccount");
    module.exports = {
      current: getCurrentAccount
    };
  }
});
var require_collections = __commonJS({
  "../node_modules/replicate/lib/collections.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function getCollection(collection_slug, { signal } = {}) {
      const response = await this.request(`/collections/${collection_slug}`, {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getCollection, "getCollection");
    __name2(getCollection, "getCollection");
    async function listCollections({ signal } = {}) {
      const response = await this.request("/collections", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listCollections, "listCollections");
    __name2(listCollections, "listCollections");
    module.exports = { get: getCollection, list: listCollections };
  }
});
var require_deployments = __commonJS({
  "../node_modules/replicate/lib/deployments.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var { transformFileInputs } = require_util();
    async function createPrediction(deployment_owner, deployment_name, options) {
      const { input, wait, signal, ...data } = options;
      if (data.webhook) {
        try {
          new URL(data.webhook);
        } catch (err) {
          throw new Error("Invalid webhook URL");
        }
      }
      const headers = {};
      if (wait) {
        if (typeof wait === "number") {
          const n = Math.max(1, Math.ceil(Number(wait)) || 1);
          headers["Prefer"] = `wait=${n}`;
        } else {
          headers["Prefer"] = "wait";
        }
      }
      const response = await this.request(
        `/deployments/${deployment_owner}/${deployment_name}/predictions`,
        {
          method: "POST",
          headers,
          data: {
            ...data,
            input: await transformFileInputs(
              this,
              input,
              this.fileEncodingStrategy
            )
          },
          signal
        }
      );
      return response.json();
    }
    __name(createPrediction, "createPrediction");
    __name2(createPrediction, "createPrediction");
    async function getDeployment(deployment_owner, deployment_name, { signal } = {}) {
      const response = await this.request(
        `/deployments/${deployment_owner}/${deployment_name}`,
        {
          method: "GET",
          signal
        }
      );
      return response.json();
    }
    __name(getDeployment, "getDeployment");
    __name2(getDeployment, "getDeployment");
    async function createDeployment(deployment_config, { signal } = {}) {
      const response = await this.request("/deployments", {
        method: "POST",
        data: deployment_config,
        signal
      });
      return response.json();
    }
    __name(createDeployment, "createDeployment");
    __name2(createDeployment, "createDeployment");
    async function updateDeployment(deployment_owner, deployment_name, deployment_config, { signal } = {}) {
      const response = await this.request(
        `/deployments/${deployment_owner}/${deployment_name}`,
        {
          method: "PATCH",
          data: deployment_config,
          signal
        }
      );
      return response.json();
    }
    __name(updateDeployment, "updateDeployment");
    __name2(updateDeployment, "updateDeployment");
    async function deleteDeployment(deployment_owner, deployment_name, { signal } = {}) {
      const response = await this.request(
        `/deployments/${deployment_owner}/${deployment_name}`,
        {
          method: "DELETE",
          signal
        }
      );
      return response.status === 204;
    }
    __name(deleteDeployment, "deleteDeployment");
    __name2(deleteDeployment, "deleteDeployment");
    async function listDeployments({ signal } = {}) {
      const response = await this.request("/deployments", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listDeployments, "listDeployments");
    __name2(listDeployments, "listDeployments");
    module.exports = {
      predictions: {
        create: createPrediction
      },
      get: getDeployment,
      create: createDeployment,
      update: updateDeployment,
      list: listDeployments,
      delete: deleteDeployment
    };
  }
});
var require_hardware = __commonJS({
  "../node_modules/replicate/lib/hardware.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function listHardware({ signal } = {}) {
      const response = await this.request("/hardware", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listHardware, "listHardware");
    __name2(listHardware, "listHardware");
    module.exports = {
      list: listHardware
    };
  }
});
var require_models = __commonJS({
  "../node_modules/replicate/lib/models.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function getModel(model_owner, model_name, { signal } = {}) {
      const response = await this.request(`/models/${model_owner}/${model_name}`, {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getModel, "getModel");
    __name2(getModel, "getModel");
    async function listModelVersions(model_owner, model_name, { signal } = {}) {
      const response = await this.request(
        `/models/${model_owner}/${model_name}/versions`,
        {
          method: "GET",
          signal
        }
      );
      return response.json();
    }
    __name(listModelVersions, "listModelVersions");
    __name2(listModelVersions, "listModelVersions");
    async function getModelVersion(model_owner, model_name, version_id, { signal } = {}) {
      const response = await this.request(
        `/models/${model_owner}/${model_name}/versions/${version_id}`,
        {
          method: "GET",
          signal
        }
      );
      return response.json();
    }
    __name(getModelVersion, "getModelVersion");
    __name2(getModelVersion, "getModelVersion");
    async function listModels({ signal } = {}) {
      const response = await this.request("/models", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listModels, "listModels");
    __name2(listModels, "listModels");
    async function createModel(model_owner, model_name, options) {
      const { signal, ...rest } = options;
      const data = { owner: model_owner, name: model_name, ...rest };
      const response = await this.request("/models", {
        method: "POST",
        data,
        signal
      });
      return response.json();
    }
    __name(createModel, "createModel");
    __name2(createModel, "createModel");
    async function search(query, { signal } = {}) {
      const response = await this.request("/models", {
        method: "QUERY",
        headers: {
          "Content-Type": "text/plain"
        },
        data: query,
        signal
      });
      return response.json();
    }
    __name(search, "search");
    __name2(search, "search");
    module.exports = {
      get: getModel,
      list: listModels,
      create: createModel,
      versions: { list: listModelVersions, get: getModelVersion },
      search
    };
  }
});
var require_predictions = __commonJS({
  "../node_modules/replicate/lib/predictions.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var { transformFileInputs } = require_util();
    async function createPrediction(options) {
      const { model, version: version22, input, wait, signal, ...data } = options;
      if (data.webhook) {
        try {
          new URL(data.webhook);
        } catch (err) {
          throw new Error("Invalid webhook URL");
        }
      }
      const headers = {};
      if (wait) {
        if (typeof wait === "number") {
          const n = Math.max(1, Math.ceil(Number(wait)) || 1);
          headers["Prefer"] = `wait=${n}`;
        } else {
          headers["Prefer"] = "wait";
        }
      }
      let response;
      if (version22) {
        response = await this.request("/predictions", {
          method: "POST",
          headers,
          data: {
            ...data,
            input: await transformFileInputs(
              this,
              input,
              this.fileEncodingStrategy
            ),
            version: version22
          },
          signal
        });
      } else if (model) {
        response = await this.request(`/models/${model}/predictions`, {
          method: "POST",
          headers,
          data: {
            ...data,
            input: await transformFileInputs(
              this,
              input,
              this.fileEncodingStrategy
            )
          },
          signal
        });
      } else {
        throw new Error("Either model or version must be specified");
      }
      return response.json();
    }
    __name(createPrediction, "createPrediction");
    __name2(createPrediction, "createPrediction");
    async function getPrediction(prediction_id, { signal } = {}) {
      const response = await this.request(`/predictions/${prediction_id}`, {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getPrediction, "getPrediction");
    __name2(getPrediction, "getPrediction");
    async function cancelPrediction(prediction_id, { signal } = {}) {
      const response = await this.request(`/predictions/${prediction_id}/cancel`, {
        method: "POST",
        signal
      });
      return response.json();
    }
    __name(cancelPrediction, "cancelPrediction");
    __name2(cancelPrediction, "cancelPrediction");
    async function listPredictions({ signal } = {}) {
      const response = await this.request("/predictions", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listPredictions, "listPredictions");
    __name2(listPredictions, "listPredictions");
    module.exports = {
      create: createPrediction,
      get: getPrediction,
      cancel: cancelPrediction,
      list: listPredictions
    };
  }
});
var require_trainings = __commonJS({
  "../node_modules/replicate/lib/trainings.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function createTraining(model_owner, model_name, version_id, options) {
      const { signal, ...data } = options;
      if (data.webhook) {
        try {
          new URL(data.webhook);
        } catch (err) {
          throw new Error("Invalid webhook URL");
        }
      }
      const response = await this.request(
        `/models/${model_owner}/${model_name}/versions/${version_id}/trainings`,
        {
          method: "POST",
          data,
          signal
        }
      );
      return response.json();
    }
    __name(createTraining, "createTraining");
    __name2(createTraining, "createTraining");
    async function getTraining(training_id, { signal } = {}) {
      const response = await this.request(`/trainings/${training_id}`, {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getTraining, "getTraining");
    __name2(getTraining, "getTraining");
    async function cancelTraining(training_id, { signal } = {}) {
      const response = await this.request(`/trainings/${training_id}/cancel`, {
        method: "POST",
        signal
      });
      return response.json();
    }
    __name(cancelTraining, "cancelTraining");
    __name2(cancelTraining, "cancelTraining");
    async function listTrainings({ signal } = {}) {
      const response = await this.request("/trainings", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(listTrainings, "listTrainings");
    __name2(listTrainings, "listTrainings");
    module.exports = {
      create: createTraining,
      get: getTraining,
      cancel: cancelTraining,
      list: listTrainings
    };
  }
});
var require_webhooks = __commonJS({
  "../node_modules/replicate/lib/webhooks.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    async function getDefaultWebhookSecret({ signal } = {}) {
      const response = await this.request("/webhooks/default/secret", {
        method: "GET",
        signal
      });
      return response.json();
    }
    __name(getDefaultWebhookSecret, "getDefaultWebhookSecret");
    __name2(getDefaultWebhookSecret, "getDefaultWebhookSecret");
    module.exports = {
      default: {
        secret: {
          get: getDefaultWebhookSecret
        }
      }
    };
  }
});
var require_package = __commonJS({
  "../node_modules/replicate/package.json"(exports, module) {
    module.exports = {
      name: "replicate",
      version: "1.2.0",
      description: "JavaScript client for Replicate",
      repository: "github:replicate/replicate-javascript",
      homepage: "https://github.com/replicate/replicate-javascript#readme",
      bugs: "https://github.com/replicate/replicate-javascript/issues",
      license: "Apache-2.0",
      main: "index.js",
      type: "commonjs",
      types: "index.d.ts",
      files: [
        "CONTRIBUTING.md",
        "LICENSE",
        "README.md",
        "index.d.ts",
        "index.js",
        "lib/**/*.js",
        "vendor/**/*",
        "package.json"
      ],
      engines: {
        node: ">=18.0.0",
        npm: ">=7.19.0",
        git: ">=2.11.0",
        yarn: ">=1.7.0"
      },
      scripts: {
        check: "tsc",
        format: "biome format . --write",
        "lint-biome": "biome lint .",
        "lint-publint": "publint",
        lint: "npm run lint-biome && npm run lint-publint",
        test: "jest"
      },
      optionalDependencies: {
        "readable-stream": ">=4.0.0"
      },
      devDependencies: {
        "@biomejs/biome": "^1.4.1",
        "@types/jest": "^29.5.3",
        "@typescript-eslint/eslint-plugin": "^5.56.0",
        "cross-fetch": "^3.1.5",
        jest: "^29.7.0",
        nock: "^14.0.0-beta.6",
        publint: "^0.2.7",
        "ts-jest": "^29.1.0",
        typescript: "^5.0.2"
      }
    };
  }
});
var require_replicate = __commonJS({
  "../node_modules/replicate/index.js"(exports, module) {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    var ApiError = require_error();
    var ModelVersionIdentifier = require_identifier();
    var { createReadableStream, createFileOutput } = require_stream2();
    var {
      transform,
      withAutomaticRetries,
      validateWebhook,
      parseProgressFromLogs,
      streamAsyncIterator
    } = require_util();
    var accounts = require_accounts();
    var collections = require_collections();
    var deployments = require_deployments();
    var files = require_files();
    var hardware = require_hardware();
    var models = require_models();
    var predictions = require_predictions();
    var trainings = require_trainings();
    var webhooks = require_webhooks();
    var packageJSON = require_package();
    var Replicate2 = class {
      static {
        __name(this, "Replicate2");
      }
      static {
        __name2(this, "Replicate");
      }
      /**
       * Create a new Replicate API client instance.
       *
       * @param {object} options - Configuration options for the client
       * @param {string} options.auth - API access token. Defaults to the `REPLICATE_API_TOKEN` environment variable.
       * @param {string} options.userAgent - Identifier of your app
       * @param {string} [options.baseUrl] - Defaults to https://api.replicate.com/v1
       * @param {Function} [options.fetch] - Fetch function to use. Defaults to `globalThis.fetch`
       * @param {boolean} [options.useFileOutput] - Set to `false` to disable `FileOutput` objects from `run` instead of URLs, defaults to true.
       * @param {"default" | "upload" | "data-uri"} [options.fileEncodingStrategy] - Determines the file encoding strategy to use
       */
      constructor(options = {}) {
        this.auth = options.auth || (typeof process !== "undefined" ? process.env.REPLICATE_API_TOKEN : null);
        this.userAgent = options.userAgent || `replicate-javascript/${packageJSON.version}`;
        this.baseUrl = options.baseUrl || "https://api.replicate.com/v1";
        this.fetch = options.fetch || globalThis.fetch;
        this.fileEncodingStrategy = options.fileEncodingStrategy || "default";
        this.useFileOutput = options.useFileOutput === false ? false : true;
        this.accounts = {
          current: accounts.current.bind(this)
        };
        this.collections = {
          list: collections.list.bind(this),
          get: collections.get.bind(this)
        };
        this.deployments = {
          get: deployments.get.bind(this),
          create: deployments.create.bind(this),
          update: deployments.update.bind(this),
          delete: deployments.delete.bind(this),
          list: deployments.list.bind(this),
          predictions: {
            create: deployments.predictions.create.bind(this)
          }
        };
        this.files = {
          create: files.create.bind(this),
          get: files.get.bind(this),
          list: files.list.bind(this),
          delete: files.delete.bind(this)
        };
        this.hardware = {
          list: hardware.list.bind(this)
        };
        this.models = {
          get: models.get.bind(this),
          list: models.list.bind(this),
          create: models.create.bind(this),
          versions: {
            list: models.versions.list.bind(this),
            get: models.versions.get.bind(this)
          },
          search: models.search.bind(this)
        };
        this.predictions = {
          create: predictions.create.bind(this),
          get: predictions.get.bind(this),
          cancel: predictions.cancel.bind(this),
          list: predictions.list.bind(this)
        };
        this.trainings = {
          create: trainings.create.bind(this),
          get: trainings.get.bind(this),
          cancel: trainings.cancel.bind(this),
          list: trainings.list.bind(this)
        };
        this.webhooks = {
          default: {
            secret: {
              get: webhooks.default.secret.get.bind(this)
            }
          }
        };
      }
      /**
       * Run a model and wait for its output.
       *
       * @param {string} ref - Required. The model version identifier in the format "owner/name" or "owner/name:version"
       * @param {object} options
       * @param {object} options.input - Required. An object with the model inputs
       * @param {{mode: "block", timeout?: number, interval?: number} | {mode: "poll", interval?: number }} [options.wait] - Options for waiting for the prediction to finish. If `wait` is explicitly true, the function will block and wait for the prediction to finish.
       * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
       * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
       * @param {Function} [progress] - Callback function that receives the prediction object as it's updated. The function is called when the prediction is created, each time its updated while polling for completion, and when it's completed.
       * @throws {Error} If the reference is invalid
       * @throws {Error} If the prediction failed
       * @returns {Promise<object>} - Resolves with the output of running the model
       */
      async run(ref22, options, progress) {
        const { wait = { mode: "block" }, signal, ...data } = options;
        const identifier = ModelVersionIdentifier.parse(ref22);
        let prediction;
        if (identifier.version) {
          prediction = await this.predictions.create({
            ...data,
            version: identifier.version,
            wait: wait.mode === "block" ? wait.timeout ?? true : false
          });
        } else if (identifier.owner && identifier.name) {
          prediction = await this.predictions.create({
            ...data,
            model: `${identifier.owner}/${identifier.name}`,
            wait: wait.mode === "block" ? wait.timeout ?? true : false
          });
        } else {
          throw new Error("Invalid model version identifier");
        }
        if (progress) {
          progress(prediction);
        }
        const isDone = wait.mode === "block" && prediction.status !== "starting";
        if (!isDone) {
          prediction = await this.wait(
            prediction,
            { interval: wait.mode === "poll" ? wait.interval : void 0 },
            async (updatedPrediction) => {
              if (progress) {
                progress(updatedPrediction);
              }
              if (signal && signal.aborted) {
                return true;
              }
              return false;
            }
          );
        }
        if (signal && signal.aborted) {
          prediction = await this.predictions.cancel(prediction.id);
        }
        if (progress) {
          progress(prediction);
        }
        if (prediction.status === "failed") {
          throw new Error(`Prediction failed: ${prediction.error}`);
        }
        return transform(prediction.output, (value) => {
          if (typeof value === "string" && (value.startsWith("https:") || value.startsWith("data:"))) {
            return this.useFileOutput ? createFileOutput({ url: value, fetch: this.fetch }) : value;
          }
          return value;
        });
      }
      /**
       * Make a request to the Replicate API.
       *
       * @param {string} route - REST API endpoint path
       * @param {object} options - Request parameters
       * @param {string} [options.method] - HTTP method. Defaults to GET
       * @param {object} [options.params] - Query parameters
       * @param {object|Headers} [options.headers] - HTTP headers
       * @param {object} [options.data] - Body parameters
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the request
       * @returns {Promise<Response>} - Resolves with the response object
       * @throws {ApiError} If the request failed
       */
      async request(route, options) {
        const { auth, baseUrl, userAgent } = this;
        let url;
        if (route instanceof URL) {
          url = route;
        } else {
          url = new URL(
            route.startsWith("/") ? route.slice(1) : route,
            baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
          );
        }
        const { method = "GET", params = {}, data, signal } = options;
        for (const [key, value] of Object.entries(params)) {
          url.searchParams.append(key, value);
        }
        const headers = {
          "Content-Type": "application/json",
          "User-Agent": userAgent
        };
        if (auth) {
          headers["Authorization"] = `Bearer ${auth}`;
        }
        if (options.headers) {
          for (const [key, value] of Object.entries(options.headers)) {
            headers[key] = value;
          }
        }
        let body = void 0;
        if (data instanceof FormData) {
          body = data;
          delete headers["Content-Type"];
        } else if (data) {
          body = JSON.stringify(data);
        }
        const init2 = {
          method,
          headers,
          body,
          signal
        };
        const shouldRetry = method === "GET" ? (response2) => response2.status === 429 || response2.status >= 500 : (response2) => response2.status === 429;
        const _fetch = this.fetch;
        const response = await withAutomaticRetries(async () => _fetch(url, init2), {
          shouldRetry
        });
        if (!response.ok) {
          const request = new Request(url, init2);
          const responseText = await response.text();
          throw new ApiError(
            `Request to ${url} failed with status ${response.status} ${response.statusText}: ${responseText}.`,
            request,
            response
          );
        }
        return response;
      }
      /**
       * Stream a model and wait for its output.
       *
       * @param {string} identifier - Required. The model version identifier in the format "{owner}/{name}:{version}"
       * @param {object} options
       * @param {object} options.input - Required. An object with the model inputs
       * @param {string} [options.webhook] - An HTTPS URL for receiving a webhook when the prediction has new output
       * @param {string[]} [options.webhook_events_filter] - You can change which events trigger webhook requests by specifying webhook events (`start`|`output`|`logs`|`completed`)
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the prediction
       * @throws {Error} If the prediction failed
       * @yields {ServerSentEvent} Each streamed event from the prediction
       */
      async *stream(ref22, options) {
        const { wait, signal, ...data } = options;
        const identifier = ModelVersionIdentifier.parse(ref22);
        let prediction;
        if (identifier.version) {
          prediction = await this.predictions.create({
            ...data,
            version: identifier.version
          });
        } else if (identifier.owner && identifier.name) {
          prediction = await this.predictions.create({
            ...data,
            model: `${identifier.owner}/${identifier.name}`
          });
        } else {
          throw new Error("Invalid model version identifier");
        }
        if (prediction.urls && prediction.urls.stream) {
          const stream = createReadableStream({
            url: prediction.urls.stream,
            fetch: this.fetch,
            ...signal ? { options: { signal } } : {}
          });
          yield* streamAsyncIterator(stream);
        } else {
          throw new Error("Prediction does not support streaming");
        }
      }
      /**
       * Paginate through a list of results.
       *
       * @generator
       * @example
       * for await (const page of replicate.paginate(replicate.predictions.list) {
       *    console.log(page);
       * }
       * @param {Function} endpoint - Function that returns a promise for the next page of results
       * @param {object} [options]
       * @param {AbortSignal} [options.signal] - AbortSignal to cancel the request.
       * @yields {object[]} Each page of results
       */
      async *paginate(endpoint, options = {}) {
        const response = await endpoint();
        yield response.results;
        if (response.next && !(options.signal && options.signal.aborted)) {
          const nextPage = /* @__PURE__ */ __name2(() => this.request(response.next, {
            method: "GET",
            signal: options.signal
          }).then((r) => r.json()), "nextPage");
          yield* this.paginate(nextPage, options);
        }
      }
      /**
       * Wait for a prediction to finish.
       *
       * If the prediction has already finished,
       * this function returns immediately.
       * Otherwise, it polls the API until the prediction finishes.
       *
       * @async
       * @param {object} prediction - Prediction object
       * @param {object} options - Options
       * @param {number} [options.interval] - Polling interval in milliseconds. Defaults to 500
       * @param {Function} [stop] - Async callback function that is called after each polling attempt. Receives the prediction object as an argument. Return false to cancel polling.
       * @throws {Error} If the prediction doesn't complete within the maximum number of attempts
       * @throws {Error} If the prediction failed
       * @returns {Promise<object>} Resolves with the completed prediction object
       */
      async wait(prediction, options, stop) {
        const { id } = prediction;
        if (!id) {
          throw new Error("Invalid prediction");
        }
        if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
          return prediction;
        }
        const sleep = /* @__PURE__ */ __name2((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");
        const interval = options && options.interval || 500;
        let updatedPrediction = await this.predictions.get(id);
        while (updatedPrediction.status !== "succeeded" && updatedPrediction.status !== "failed" && updatedPrediction.status !== "canceled") {
          if (stop && await stop(updatedPrediction) === true) {
            break;
          }
          await sleep(interval);
          updatedPrediction = await this.predictions.get(prediction.id);
        }
        if (updatedPrediction.status === "failed") {
          throw new Error(`Prediction failed: ${updatedPrediction.error}`);
        }
        return updatedPrediction;
      }
    };
    module.exports = Replicate2;
    module.exports.validateWebhook = validateWebhook;
    module.exports.parseProgressFromLogs = parseProgressFromLogs;
  }
});
async function onRequestPost2(context22) {
  try {
    const { prompt } = await context22.request.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const apiToken = context22.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error("\u274C REPLICATE_API_TOKEN not found in environment");
      return new Response(
        JSON.stringify({ error: "API token not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("\u{1F3A8} Generating image with Replicate FLUX Schnell:", prompt);
    const replicate = new import_replicate.default({
      auth: apiToken
    });
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 80
        }
      }
    );
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error("\u274C No images generated from Replicate");
      return new Response(
        JSON.stringify({ error: "No images generated" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    console.log("\u2705 Replicate image generated successfully");
    return new Response(
      JSON.stringify({
        imageUrl: output[0],
        prompt
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600"
          // Cache for 1 hour
        }
      }
    );
  } catch (error32) {
    console.error("\u274C Replicate generation failed:", error32);
    return new Response(
      JSON.stringify({
        error: "Image generation failed",
        details: error32 instanceof Error ? error32.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost2, "onRequestPost2");
var import_replicate;
var init_generate_image = __esm({
  "api/generate-image.ts"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    import_replicate = __toESM(require_replicate(), 1);
    __name2(onRequestPost2, "onRequestPost");
  }
});
var onRequestPost3;
var onRequestGet;
var init_vectorize = __esm({
  "api/vectorize.ts"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    onRequestPost3 = /* @__PURE__ */ __name2(async (context22) => {
      const { request, env: env22 } = context22;
      try {
        const { cards, deckId } = await request.json();
        if (!cards || !Array.isArray(cards)) {
          return new Response(JSON.stringify({ error: "Invalid cards array" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const vectors = [];
        for (const card of cards) {
          const cardText = `${card.name}: ${card.description}. Stats - Might: ${card.might}, Fortune: ${card.fortune}, Cunning: ${card.cunning}`;
          const embeddings = await env22.AI.run("@cf/baai/bge-base-en-v1.5", {
            text: [cardText]
          });
          const values = embeddings.data[0];
          if (!values) {
            console.warn(`Failed to generate embedding for card ${card.id}`);
            continue;
          }
          vectors.push({
            id: card.id,
            values,
            metadata: {
              name: card.name,
              description: card.description,
              might: card.might,
              fortune: card.fortune,
              cunning: card.cunning,
              category: card.category,
              ...deckId && { deckId }
            }
          });
        }
        const result = await env22.VECTORIZE.upsert(vectors);
        return new Response(JSON.stringify({
          success: true,
          count: result.count,
          ids: result.ids
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error32) {
        console.error("Vectorize upsert error:", error32);
        return new Response(JSON.stringify({
          error: "Failed to upsert vectors",
          message: error32 instanceof Error ? error32.message : "Unknown error"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }, "onRequestPost");
    onRequestGet = /* @__PURE__ */ __name2(async (context22) => {
      const { request, env: env22 } = context22;
      try {
        const url = new URL(request.url);
        const queryText = url.searchParams.get("q");
        const topK = parseInt(url.searchParams.get("topK") || "5");
        const deckId = url.searchParams.get("deckId");
        const minMight = url.searchParams.get("minMight");
        const minFortune = url.searchParams.get("minFortune");
        const minCunning = url.searchParams.get("minCunning");
        if (!queryText) {
          return new Response(JSON.stringify({ error: "Query text required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        const embeddings = await env22.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: [queryText]
        });
        const queryVector = embeddings.data[0];
        if (!queryVector) {
          return new Response(JSON.stringify({ error: "Failed to generate query embedding" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        const filter = {};
        if (deckId) filter.deckId = deckId;
        if (minMight) filter.might = { $gte: parseInt(minMight) };
        if (minFortune) filter.fortune = { $gte: parseInt(minFortune) };
        if (minCunning) filter.cunning = { $gte: parseInt(minCunning) };
        const results = await env22.VECTORIZE.query(queryVector, {
          topK,
          returnValues: false,
          returnMetadata: "all",
          ...Object.keys(filter).length > 0 && { filter }
        });
        return new Response(JSON.stringify({
          success: true,
          matches: results.matches.map((match2) => ({
            id: match2.id,
            score: match2.score,
            card: match2.metadata
          }))
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error32) {
        console.error("Vectorize query error:", error32);
        return new Response(JSON.stringify({
          error: "Failed to query vectors",
          message: error32 instanceof Error ? error32.message : "Unknown error"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }, "onRequestGet");
  }
});
var onRequest;
var init_middleware = __esm({
  "_middleware.ts"() {
    init_functionsRoutes_0_7256070392381855();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    onRequest = /* @__PURE__ */ __name2(async (context22) => {
      return context22.next();
    }, "onRequest");
  }
});
var routes;
var init_functionsRoutes_0_7256070392381855 = __esm({
  "../.wrangler/tmp/pages-IrcrS5/functionsRoutes-0.7256070392381855.mjs"() {
    init_generate_audio();
    init_generate_image();
    init_vectorize();
    init_vectorize();
    init_middleware();
    routes = [
      {
        routePath: "/api/generate-audio",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost]
      },
      {
        routePath: "/api/generate-image",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost2]
      },
      {
        routePath: "/api/vectorize",
        mountPath: "/api",
        method: "GET",
        middlewares: [],
        modules: [onRequestGet]
      },
      {
        routePath: "/api/vectorize",
        mountPath: "/api",
        method: "POST",
        middlewares: [],
        modules: [onRequestPost3]
      },
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [onRequest],
        modules: []
      }
    ];
  }
});
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count32 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count32--;
          if (count32 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count32++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count32)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env22, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init2) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init2);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context22 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env22,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context22);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error32) {
      if (isFailOpen) {
        const response = await env22["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error32;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var drainBody = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env22, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env22);
  } catch (e) {
    const error32 = reduceError(e);
    return Response.json(error32, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
init_functionsRoutes_0_7256070392381855();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env22, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env22, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env22, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env22, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env22, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env22, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env22, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env22, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env22, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env22, ctx) => {
      this.env = env22;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env3, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env3);
  } catch (e) {
    const error4 = reduceError2(e);
    return Response.json(error4, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-ufMWqi/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env3, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env3, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env3, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env3, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-ufMWqi/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env3, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env3, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env3, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init2) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init2.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env3, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env3, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env3, ctx) => {
      this.env = env3;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init2) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init2.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.10149068853342125.js.map
