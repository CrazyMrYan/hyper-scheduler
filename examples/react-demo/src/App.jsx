import { useState, useEffect, useRef } from 'react'
import { Scheduler } from 'hyper-scheduler'

function App() {
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const schedulerRef = useRef(null)

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20))
  }

  useEffect(() => {
    schedulerRef.current = new Scheduler({ debug: true })
    
    schedulerRef.current.addTask({
      id: 'react-cron',
      schedule: '*/4 * * * * *',
      handler: () => addLog('React Cron Task (4s)')
    })

    schedulerRef.current.addTask({
      id: 'react-interval',
      schedule: '6s',
      handler: () => addLog('React Interval Task (6s)')
    })

    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop()
      }
    }
  }, [])

  const toggle = () => {
    if (!schedulerRef.current) return
    
    if (isRunning) {
      schedulerRef.current.stop()
      addLog('Scheduler Stopped')
    } else {
      schedulerRef.current.start()
      addLog('Scheduler Started')
    }
    setIsRunning(!isRunning)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>React Demo</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
        <button 
          onClick={toggle}
          style={{ padding: '0.5rem 1rem', marginBottom: '1rem', cursor: 'pointer' }}
        >
          {isRunning ? 'Stop Scheduler' : 'Start Scheduler'}
        </button>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', height: '200px', overflowY: 'auto', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App