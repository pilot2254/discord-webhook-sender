# Discord Webhook Sender

A simple Node.js application to send messages to multiple Discord webhooks with configurable looping capabilities.

## Features

- Send messages to multiple Discord webhooks simultaneously
- Configure message content via a config file
- Optional message looping with configurable:
  - Number of loops
  - Delay between loops
- Detailed console output with success/failure tracking

## Installation

```bash
# Clone the repository
git clone https://github.com/pilot2254/discord-webhook-sender.git

# Navigate to the project directory
cd discord-webhook-sender

# Install dependencies
npm install

# Configure your webhooks and settings (see Configuration section)
```

## Configuration

The application uses two JSON files for configuration:

### 1. `config.json`

Contains the application settings:

```json
{
  "message": "Your message here",
  "loop": true,
  "loopCount": 3,
  "loopDelay": 5000
}
```

- `message`: The text message to send to all webhooks
- `loop`: Set to `true` to enable looping, `false` to send just once
- `loopCount`: Number of times to loop (only used if `loop` is `true`)
- `loopDelay`: Milliseconds to wait between loops


### 2. `webhooks.json`

Contains an array of Discord webhook URLs:

```json
[
  "https://discord.com/api/webhooks/your-webhook-url-1",
  "https://discord.com/api/webhooks/your-webhook-url-2"
]
```

## Usage

After configuring your settings and webhooks:

```shellscript
npm start
```

The application will:

1. Read your configuration and webhook list
2. Send the configured message to all webhooks
3. If looping is enabled, wait for the configured delay and repeat


## Finding Webhooks

This tool works great with webhooks found using my Discord webhook scanner:
[https://github.com/pilot2254/discord-webhook-scanner](https://github.com/pilot2254/discord-webhook-scanner)

The webhook scanner can help you find webhooks that you can then use with this sender application.

## Example Output

```plaintext
Loaded 2 webhooks
Message: "Hello from the Discord Webhook Sender!"
Loop enabled: true
Loop count: 5
Delay between loops: 1000ms

Starting message delivery...
Successfully sent to webhook: https://discord.com/...
Successfully sent to webhook: https://discord.com/...

Completed: 2/2 successful

Starting loop 2/3
Waiting 5000ms before next loop...
Successfully sent to webhook: https://discord.com/...
Successfully sent to webhook: https://discord.com/...

Completed: 2/2 successful

Starting loop 3/3
Waiting 5000ms before next loop...
Successfully sent to webhook: https://discord.com/...
Successfully sent to webhook: https://discord.com/...

Completed: 2/2 successful

All tasks completed!
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.