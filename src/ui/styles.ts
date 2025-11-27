export const styles = `
  #hyper-scheduler-debug-panel {
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: 300px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    border-radius: 5px;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  }
  .hs-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #555;
    padding-bottom: 5px;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .hs-task-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
  }
  .hs-status-running { color: #4caf50; }
  .hs-status-stopped { color: #f44336; }
  .hs-status-idle { color: #ffeb3b; }
  .hs-status-error { color: #ff5722; }
  .hs-toggle-btn {
    background: none;
    border: 1px solid #fff;
    color: #fff;
    cursor: pointer;
    font-size: 10px;
    margin-left: 5px;
  }
`;
