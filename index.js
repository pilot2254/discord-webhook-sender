import fs from "fs/promises"
import { setTimeout } from "timers/promises"

/**
 * Reads and parses a JSON file from the specified path
 *
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<object>} - Parsed JSON data
 * @throws {Error} - If file reading or parsing fails
 */
async function readJsonFile(filePath) {
  try {
    // Read the file as UTF-8 text
    const data = await fs.readFile(filePath, "utf8")
    // Parse the JSON content
    return JSON.parse(data)
  } catch (error) {
    // Handle specific errors
    if (error.code === "ENOENT") {
      console.error(`File not found: ${filePath}`)
    } else if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in file: ${filePath}`)
    } else {
      console.error(`Error reading ${filePath}:`, error.message)
    }
    // Re-throw the error to be handled by the caller
    throw error
  }
}

/**
 * Sends a message to a Discord webhook
 *
 * @param {string} webhookUrl - The Discord webhook URL
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function sendToWebhook(webhookUrl, message) {
  try {
    // Discord webhooks accept POST requests with JSON content
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // The message is sent in the "content" field of the request body
      body: JSON.stringify({ content: message }),
    })

    // Check if the request was successful (status code 200-299)
    if (!response.ok) {
      // If Discord returns an error status, throw an exception
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    // Return true to indicate success
    return true
  } catch (error) {
    // Log the error but don't crash the application
    // Only show part of the webhook URL for privacy/security
    console.error(`Failed to send to webhook ${webhookUrl.substring(0, 20)}...`, error.message)
    return false
  }
}

/**
 * Main application function
 * Reads configuration, processes webhooks, and handles the sending logic
 */
async function main() {
  try {
    // Load configuration and webhook data from JSON files
    const config = await readJsonFile("./config.json")
    const webhooks = await readJsonFile("./webhooks.json")

    // Validate that webhooks is an array
    if (!Array.isArray(webhooks)) {
      throw new Error("Webhooks file must contain an array of webhook URLs")
    }

    // Log application startup information
    console.log(`Loaded ${webhooks.length} webhooks`)
    console.log(`Message: "${config.message}"`)
    console.log(`Loop enabled: ${config.loop}`)

    // Show loop-specific configuration if looping is enabled
    if (config.loop) {
      console.log(`Loop count: ${config.loopCount}`)
      console.log(`Delay between loops: ${config.loopDelay}ms`)
    }

    // Determine how many times to run (1 if not looping, or loopCount if looping)
    // Default to 1 if loopCount is not specified or invalid
    const iterations = config.loop ? config.loopCount || 1 : 1

    // Main loop for sending messages
    for (let i = 0; i < iterations; i++) {
      if (i > 0) {
        // For loops after the first one, show loop information and wait for the delay
        console.log(`\nStarting loop ${i + 1}/${iterations}`)
        console.log(`Waiting ${config.loopDelay}ms before next loop...`)

        // Wait for the configured delay before starting the next loop
        // This uses the timers/promises setTimeout which returns a Promise
        await setTimeout(config.loopDelay)
      } else {
        // First iteration message
        console.log("\nStarting message delivery...")
      }

      // Track successful sends for reporting
      let successCount = 0

      // Process each webhook
      for (const webhook of webhooks) {
        // Skip empty or invalid webhook URLs
        if (!webhook || typeof webhook !== "string") {
          console.log("❌ Skipping invalid webhook")
          continue
        }

        // Send the message to the current webhook
        const success = await sendToWebhook(webhook, config.message)

        // Update success counter and log the result
        if (success) {
          successCount++
          // Show a truncated webhook URL for privacy/security
          console.log(`✅ Successfully sent to webhook: ${webhook.substring(0, 20)}...`)
        } else {
          console.log(`❌ Failed to send to webhook: ${webhook.substring(0, 20)}...`)
        }

        // Small delay between webhook calls to avoid rate limiting
        // Discord has rate limits that could block requests if sent too quickly
        await setTimeout(100)
      }

      // Report completion statistics for this iteration
      console.log(`\nCompleted: ${successCount}/${webhooks.length} successful`)
    }

    // Final completion message
    console.log("\nAll tasks completed!")
  } catch (error) {
    // Handle any uncaught errors in the main process
    console.error("Application error:", error.message)
    // Exit with error code if this is a critical error
    process.exit(1)
  }
}

// Run the application
main()

// Note: To test this application, make sure you have config.json and webhooks.json files
// in the same directory as this script.