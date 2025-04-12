# AlertNow

A lightweight notification library for sending alerts to various platforms. Currently supports Discord webhooks.

## Installation

```bash
npm install alertnow

# or

yarn add alertnow
```

## Features

- 🔄 Singleton pattern for global access
- 🧱 Builder pattern for easy configuration
- ⚡ Non-blocking notifications by default
- 🌐 Works in both browser and Node.js environments
- 📦 Full TypeScript support
- 🧩 Compatible with JavaScript, TypeScript, JSX, and TSX files

## Basic Usage

```javascript
// Import the library
const AlertNow = require('alertnow');

// or in TypeScript/ES modules
import AlertNow from 'alertnow';

const alertnow = new AlertNowBuilder()
  .setDriver("discord")
  .setWebhook("https://discord.com/api/webhooks/your-webhook-url")
  .build();

// Send a notification without blocking (fire and forget)
alertnow.send("Error Title", "Something went wrong");

// Send with additional data
alertnow.send("API Error", "Database connection failed", {
  service: "user-auth",
  error_code: "DB_CONN_ERROR",
  timestamp: new Date().toISOString()
});
```

## Usage in React

```jsx
import React, { useEffect } from 'react';
import AlertNow from 'alertnow';

function App() {
  useEffect(() => {

    // Configure AlertNow once when the app initializes
    const alertnow = AlertNow.getInstance()
      .setDriver("discord")
      .setWebhook(process.env.REACT_APP_DISCORD_WEBHOOK_URL)
      .build();
    
    // Example: Send a notification when app starts
    alertnow.send("App Initialized", "React application started successfully");
  }, []);
  
  const handleError = (error) => {
    const alertnow = AlertNow.getInstance();
    alertnow.send(
      "User Error", 
      `Error in user flow: ${error.message}`,
      { 
        component: "UserForm",
        timestamp: new Date().toISOString()
      }
    );
  };
  
  return (
    <div className="App">
      <h1>My React App</h1>
      <button onClick={() => handleError(new Error("Test error"))}>
        Test Error Alert
      </button>
    </div>
  );
}

export default App;
```

## API Reference

### `Alert`

The interface of AlertNow.

### `new AlertNowBuilder()`

Create the instance of AlertNow.

### `alertnow.setDriver(driver)`

Sets the notification driver.

- `driver` (string): Currently only "discord" is supported
- Returns: The AlertNow instance for chaining

### `alertnow.setWebhook(webhookUrl)`

Sets the webhook URL for the notification.

- `webhookUrl` (string): The webhook URL for the specified driver
- Returns: The AlertNow instance for chaining

### `alertnow.build()`

Finalizes the configuration and validates required settings.

- Returns: The AlertNow instance

### `alertnow.send(title, message, data)`

Sends a notification without blocking execution (fire and forget).

- `title` (string): Title of the notification
- `message` (string): Message content
- `data` (object, optional): Additional data to include in the notification
- Returns: void

## Security Notes

For production applications, it's recommended not to expose webhook URLs directly in client-side code. Consider:

1. Creating a backend API endpoint that relays notifications
2. Using environment variables to store sensitive information:
   ```
   # .env.local
   REACT_APP_DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
   ```

## License

MIT