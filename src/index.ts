// src/index.ts
import fetch from 'cross-fetch'; // Import from the universal library
/**
 * AlertNow - A notification library for various platforms
 * Currently supports Discord webhooks
 */
interface Alert {
  send(title: string, message: string, data: Record<string, any> | undefined): void
}

const DEF_TEMPLATE = "**$title**\n\nmessage:```\n\n$message```\n$data\n"


class AlertNow implements Alert {
  private driver: string | null = null;
  private webhookUrl: string | null = null;

  /**
   * Private constructor - use getInstance() instead
   */
  public constructor(driver: string, webhookUrl: string) {
    this.driver = driver
    this.webhookUrl = webhookUrl
  }

  /**
   * Send a notification without waiting for a response
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {Record<string, any>} [data={}] - Additional data to include
   * @returns {void} - Does not return a promise to avoid blocking
   */
  public send(title: string, message: string, data: Record<string, any> | undefined = {}): void {
    if (!this.driver || !this.webhookUrl) {
      console.error('AlertNow instance not properly configured. Use setDriver(), setWebhook(), and build() before sending.');
      return;
    }

    if (!title || typeof title !== 'string') {
      console.error('AlertNow Error: Title is required and must be a string');
      return;
    }

    if (!message || typeof message !== 'string') {
      console.error('AlertNow Error: Message is required and must be a string');
      return;
    }

    // Fire and forget - don't wait for the response
    if (this.driver === 'discord') {
      this._sendDiscord(title, message, data)
        .catch(error => {
          console.error('AlertNow Error:', error);
        });
    }
  }

  /**
   * Send a notification to Discord
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {Record<string, any>} data - Additional data to include
   * @returns {Promise<any>} - Promise that resolves when the notification is sent
   * @private
   */
  private async _sendDiscord(title: string, message: string, data: Record<string, any> | undefined = {}): Promise<any> {
    let dataStr = ""

    if (data != null && Object.keys(data).length > 0) {
      const str = JSON.stringify(data)
      dataStr = "data:```\n\n" + str + "```\n"
    }

    const content = DEF_TEMPLATE.replace("$title", title).replace("$message", message).replace("$data", dataStr)

    const payload = {
      content,
    };

    try {
      const response = await fetch(this.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      return response;
    } catch (error) {
      console.error('Failed to send notification to Discord:', error);
      throw error;
    }
  }

  /**
   * Format data object into Discord embed fields
   * @param {Record<string, any>} data - Data to format
   * @returns {Array<{name: string, value: string}>} - Formatted fields
   * @private
   */
  private _formatDiscordData(data: Record<string, any>): Array<{name: string, value: string}> {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return [];
    }

    return Object.entries(data).map(([key, value]) => {
      return {
        name: key,
        value: typeof value === 'object' 
          ? '```json\n' + JSON.stringify(value, null, 2) + '\n```'
          : String(value)
      };
    });
  }
}

class AlertNowBuilder {
  private driver: string | null = null;
  private webhookUrl: string | null = null;
  
  /**
   * Set the notification driver
   * @param {string} driver - The driver to use (e.g., "discord")
   * @returns {AlertNow} - Returns this instance for chaining
   */
  public setDriver(driver: string): AlertNowBuilder {
    if (!driver || typeof driver !== 'string') {
      throw new Error('Driver must be a valid string');
    }
    
    if (driver.toLowerCase() !== 'discord') {
      throw new Error('Currently only "discord" driver is supported');
    }
    
    this.driver = driver.toLowerCase();
    return this;
  }

  /**
   * Set the webhook URL
   * @param {string} webhookUrl - The webhook URL to use
   * @returns {AlertNow} - Returns this instance for chaining
   */
  public setWebhook(webhookUrl: string): AlertNowBuilder {
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      throw new Error('A valid webhook URL is required');
    }
    
    this.webhookUrl = webhookUrl;
    return this;
  }

  /**
   * Build and finalize the Alert instance
   * @returns {Alert} - Returns this instance
   */
  public build(): Alert {
    if (!this.driver) {
      throw new Error('Driver must be set before building');
    }
    
    if (!this.webhookUrl) {
      throw new Error('Webhook URL must be set before building');
    }
    
    return new AlertNow(this.driver, this.webhookUrl);
  }
}

export { Alert, AlertNowBuilder };