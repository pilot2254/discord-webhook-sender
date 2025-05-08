import fs from 'fs/promises';
import { setTimeout } from 'timers/promises';

// Function to read JSON files
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    throw error;
  }
}

// Function to send a message to a webhook
async function sendToWebhook(webhookUrl, message) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Failed to send to webhook ${webhookUrl}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Load config and webhooks
    const config = await readJsonFile('./config.json');
    const webhooks = await readJsonFile('./webhooks.json');

    console.log(`Loaded ${webhooks.length} webhooks`);
    console.log(`Message: "${config.message}"`);
    console.log(`Loop enabled: ${config.loop}`);
    
    if (config.loop) {
      console.log(`Loop count: ${config.loopCount}`);
      console.log(`Delay between loops: ${config.loopDelay}ms`);
    }

    // Determine how many times to run (1 if not looping, or loopCount if looping)
    const iterations = config.loop ? config.loopCount : 1;

    for (let i = 0; i < iterations; i++) {
      if (i > 0) {
        console.log(`\nStarting loop ${i + 1}/${iterations}`);
        // Wait for the configured delay before starting the next loop
        console.log(`Waiting ${config.loopDelay}ms before next loop...`);
        await setTimeout(config.loopDelay);
      } else {
        console.log('\nStarting message delivery...');
      }

      // Send to all webhooks
      let successCount = 0;
      for (const webhook of webhooks) {
        const success = await sendToWebhook(webhook, config.message);
        if (success) {
          successCount++;
          console.log(`Successfully sent to webhook: ${webhook.substring(0, 20)}...`);
        } else {
          console.log(`Failed to send to webhook: ${webhook.substring(0, 20)}...`);
        }
        
        // Small delay between webhook calls to avoid rate limiting
        await setTimeout(100);
      }

      console.log(`\nCompleted: ${successCount}/${webhooks.length} successful`);
    }

    console.log('\nAll tasks completed!');
  } catch (error) {
    console.error('Application error:', error.message);
  }
}

// Run the application
main();

// To test this application, make sure you have config.json and webhooks.json files
// in the same directory as this script.