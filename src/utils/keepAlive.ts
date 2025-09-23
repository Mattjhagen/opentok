/**
 * Keep Alive Utility
 * 
 * This utility pings the server every 5 minutes to prevent
 * Render's free tier from putting the service to sleep.
 * 
 * Render free tier services sleep after 15 minutes of inactivity.
 * By pinging every 5 minutes, we ensure the service stays awake.
 */

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly PING_URL = window.location.origin; // Ping the current domain

  constructor() {
    this.start();
  }

  private async pingServer(): Promise<void> {
    try {
      // Make a simple HEAD request to keep the server alive
      const response = await fetch(this.PING_URL, {
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'X-Keep-Alive': 'true',
        },
      });

      if (response.ok) {
        console.log('🟢 Keep-alive ping successful');
      } else {
        console.warn('🟡 Keep-alive ping returned status:', response.status);
      }
    } catch (error) {
      console.error('🔴 Keep-alive ping failed:', error);
    }
  }

  public start(): void {
    if (this.intervalId) {
      console.log('Keep-alive service already running');
      return;
    }

    console.log('🚀 Starting keep-alive service (pinging every 5 minutes)');
    
    // Ping immediately on start
    this.pingServer();
    
    // Then ping every 5 minutes
    this.intervalId = setInterval(() => {
      this.pingServer();
    }, this.PING_INTERVAL);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Keep-alive service stopped');
    }
  }

  public isRunning(): boolean {
    return this.intervalId !== null;
  }

  // Manual ping method for testing
  public async manualPing(): Promise<void> {
    console.log('🔧 Manual keep-alive ping triggered');
    await this.pingServer();
  }
}

// Create a singleton instance
const keepAliveService = new KeepAliveService();

// Export the service instance
export default keepAliveService;

// Also export the class for testing purposes
export { KeepAliveService };
