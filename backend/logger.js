// 간단한 로거 유틸리티
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function getTimestamp() {
  return new Date().toLocaleString('ko-KR', { 
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const logger = {
  info: (message, ...args) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${getTimestamp()} - ${message}`, ...args)
  },
  
  success: (message, ...args) => {
    console.log(`${colors.green}[✓]${colors.reset} ${getTimestamp()} - ${message}`, ...args)
  },
  
  warn: (message, ...args) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} - ${message}`, ...args)
  },
  
  error: (message, ...args) => {
    console.error(`${colors.red}[ERROR]${colors.reset} ${getTimestamp()} - ${message}`, ...args)
  },
  
  request: (req) => {
    const method = req.method
    const url = req.url
    const methodColor = 
      method === 'GET' ? colors.blue :
      method === 'POST' ? colors.green :
      method === 'PUT' ? colors.yellow :
      method === 'DELETE' ? colors.red :
      colors.reset
    
    console.log(`${methodColor}${method}${colors.reset} ${url}`)
  },
  
  api: (method, path, status, duration) => {
    const statusColor = status >= 200 && status < 300 ? colors.green :
                        status >= 400 && status < 500 ? colors.yellow :
                        status >= 500 ? colors.red : colors.reset
    
    const methodColor = 
      method === 'GET' ? colors.blue :
      method === 'POST' ? colors.green :
      method === 'PUT' ? colors.yellow :
      method === 'DELETE' ? colors.red :
      colors.reset
    
    console.log(`${methodColor}${method}${colors.reset} ${path} ${statusColor}${status}${colors.reset} (${duration}ms)`)
  }
}

module.exports = logger

