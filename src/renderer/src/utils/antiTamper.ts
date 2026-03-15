/**
 * Anti-tamper utilities for renderer process
 */

class AntiTamper {
  private checkInterval: NodeJS.Timeout | null = null
  private originalConsole: Console
  private debuggerCheckCount = 0

  constructor() {
    this.originalConsole = { ...console }
  }

  /**
   * Start anti-tamper protection
   */
  public start(): void {
    // Disable console in production
    this.disableConsole()

    // Start debugger detection
    this.startDebuggerDetection()

    // Prevent common tampering methods
    this.preventTampering()

    // Detect DevTools
    this.detectDevTools()
  }

  /**
   * Stop protection
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Disable console methods in production
   */
  private disableConsole(): void {
    if (import.meta.env.PROD) {
      const noop = () => {}
      window.console = {
        ...console,
        log: noop,
        debug: noop,
        info: noop,
        warn: noop,
        error: noop,
        trace: noop,
        dir: noop,
        dirxml: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        time: noop,
        timeEnd: noop,
        timeLog: noop,
        assert: noop,
        clear: noop,
        count: noop,
        countReset: noop,
        table: noop,
        profile: noop,
        profileEnd: noop,
        timeStamp: noop
      } as Console
    }
  }

  /**
   * Detect debugger using timing
   */
  private startDebuggerDetection(): void {
    this.checkInterval = setInterval(() => {
      const start = performance.now()

      // This will be slow if debugger is attached
      debugger

      const end = performance.now()
      const elapsed = end - start

      // If execution took more than 100ms, debugger might be active
      if (elapsed > 100) {
        this.debuggerCheckCount++

        if (this.debuggerCheckCount > 3) {
          this.handleDebuggerDetected()
        }
      } else {
        this.debuggerCheckCount = 0
      }
    }, 1000)
  }

  /**
   * Prevent common tampering methods
   */
  private preventTampering(): void {
    // Prevent right-click context menu in production
    if (import.meta.env.PROD) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault()
      })

      // Prevent common keyboard shortcuts
      document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault()
        }
      })
    }

    // Prevent object inspection
    Object.freeze(Object.prototype)
    Object.freeze(Array.prototype)
    Object.freeze(Function.prototype)
  }

  /**
   * Detect DevTools using various methods
   */
  private detectDevTools(): void {
    // Method 1: Check window size difference
    const checkWindowSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160

      if (widthThreshold || heightThreshold) {
        this.handleDebuggerDetected()
      }
    }

    // Method 2: Check for Firebug
    const checkFirebug = () => {
      if ((window as any).console?.firebug) {
        this.handleDebuggerDetected()
      }
    }

    // Method 3: toString detection
    const element = new Image()
    Object.defineProperty(element, 'id', {
      get: () => {
        this.handleDebuggerDetected()
        return 'devtools-detector'
      }
    })

    if (import.meta.env.PROD) {
      setInterval(() => {
        checkWindowSize()
        checkFirebug()
      }, 1000)
    }
  }

  /**
   * Handle debugger detection
   */
  private handleDebuggerDetected(): void {
    this.stop()

    // Clear the page
    document.body.innerHTML = ''

    // Show warning
    const warning = document.createElement('div')
    warning.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      font-size: 24px;
      z-index: 999999;
    `
    warning.textContent = 'Security Alert: Debugging tools detected'
    document.body.appendChild(warning)

    // Notify main process
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  /**
   * Obfuscate sensitive data
   */
  public obfuscate(data: string): string {
    return btoa(
      data
        .split('')
        .map((char) => String.fromCharCode(char.charCodeAt(0) ^ 0x5a))
        .join('')
    )
  }

  /**
   * Deobfuscate data
   */
  public deobfuscate(data: string): string {
    return atob(data)
      .split('')
      .map((char) => String.fromCharCode(char.charCodeAt(0) ^ 0x5a))
      .join('')
  }
}

export const antiTamper = new AntiTamper()

// Auto-start in production
if (import.meta.env.PROD) {
  antiTamper.start()
}
