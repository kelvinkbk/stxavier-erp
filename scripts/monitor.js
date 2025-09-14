#!/usr/bin/env node

// Uptime monitoring script for St. Xavier ERP
const https = require('https');
const http = require('http');

const CONFIG = {
  appUrl: 'https://stxavier-erp.vercel.app',
  backupUrl: 'https://stxavier-erp.netlify.app',
  checkInterval: 5 * 60 * 1000, // 5 minutes
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  webhookUrl: process.env.WEBHOOK_URL, // Optional: Slack/Discord webhook
};

class UptimeMonitor {
  constructor(config) {
    this.config = config;
    this.failureCount = 0;
    this.lastStatus = 'unknown';
  }

  async checkHealth(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      const startTime = Date.now();

      const req = client.request(
        url,
        {
          method: 'HEAD',
          timeout: this.config.timeout,
        },
        res => {
          const responseTime = Date.now() - startTime;
          resolve({
            status: res.statusCode,
            responseTime,
            url,
          });
        }
      );

      req.on('error', error => {
        reject({ error: error.message, url });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({ error: 'Request timeout', url });
      });

      req.end();
    });
  }

  async sendAlert(message) {
    if (this.config.webhookUrl) {
      try {
        const payload = JSON.stringify({
          text: `🚨 St. Xavier ERP Alert: ${message}`,
          timestamp: new Date().toISOString(),
        });

        const url = new URL(this.config.webhookUrl);
        const client = url.protocol === 'https:' ? https : http;

        const req = client.request(this.config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
          },
        });

        req.write(payload);
        req.end();
      } catch (error) {
        console.error('Failed to send alert:', error.message);
      }
    }
  }

  async monitor() {
    console.log(
      `🔍 Monitoring ${this.config.appUrl} every ${this.config.checkInterval / 1000}s...`
    );

    const check = async () => {
      try {
        const result = await this.checkHealth(this.config.appUrl);

        if (result.status >= 200 && result.status < 300) {
          if (this.failureCount > 0) {
            console.log(`✅ Service recovered after ${this.failureCount} failures`);
            await this.sendAlert(`Service recovered! Response time: ${result.responseTime}ms`);
            this.failureCount = 0;
          }

          this.lastStatus = 'healthy';
          console.log(
            `✅ ${new Date().toLocaleTimeString()} - Status: ${result.status} (${
              result.responseTime
            }ms)`
          );
        } else {
          throw new Error(`HTTP ${result.status}`);
        }
      } catch (error) {
        this.failureCount++;
        this.lastStatus = 'unhealthy';

        console.log(
          `❌ ${new Date().toLocaleTimeString()} - Check failed: ${
            error.error || error.message
          } (Attempt ${this.failureCount})`
        );

        if (this.failureCount >= this.config.retryAttempts) {
          await this.sendAlert(
            `Service is DOWN! Failed ${this.failureCount} consecutive checks. Last error: ${
              error.error || error.message
            }`
          );

          // Try backup URL if available
          if (this.config.backupUrl) {
            try {
              const backupResult = await this.checkHealth(this.config.backupUrl);
              console.log(`🔄 Backup service status: ${backupResult.status}`);
            } catch (backupError) {
              console.log(
                `❌ Backup service also down: ${backupError.error || backupError.message}`
              );
            }
          }
        }
      }
    };

    // Initial check
    await check();

    // Schedule regular checks
    setInterval(check, this.config.checkInterval);
  }

  getStatus() {
    return {
      status: this.lastStatus,
      failureCount: this.failureCount,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create and start monitor
const monitor = new UptimeMonitor(CONFIG);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📴 Stopping uptime monitor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📴 Stopping uptime monitor...');
  process.exit(0);
});

// Start monitoring
monitor.monitor().catch(error => {
  console.error('Monitor failed to start:', error);
  process.exit(1);
});

// Export for programmatic use
module.exports = UptimeMonitor;
