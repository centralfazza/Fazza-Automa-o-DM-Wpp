# 🤖 Directive 03: N8N Master Workflow

The `automation_master.json` is a sophisticated workflow that acts as an interpreter for the automation JSON stored in the database.

## 🌊 Logic Flow

1. **Webhook Reception**: Listens on specific paths for IG and WA.
2. **Standardization**: Converts varied payloads from Meta into a unified internal format (Sender, Message, Platform).
3. **Backend Query**: Calls the API to find a matching automation.
4. **The Loop**: If an automation is found, it uses the **Split in Batches** or **Loop** node to process each action.
5. **Action Switch**:
   - `send_text`: Sends text via the corresponding API.
   - `delay`: Pauses execution.
   - `send_buttons`: Sends interactive components.
   - `webhook`: Forwards data to external systems.
6. **Completion**: Reports execution telemetry back to the backend.

## 🍪 Variable Processing
The workflow includes a **Code Node** to replace placeholders like `{name}` or `{phone}` with actual values from the contact record before sending messages.
