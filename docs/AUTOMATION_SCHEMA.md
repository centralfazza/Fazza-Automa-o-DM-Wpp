# 📄 Automation Schema

The `triggers` and `actions` in the `automations` table follow this JSON structure.

## 🔫 Triggers
```json
{
  "type": "keyword",
  "keywords": ["promo", "desconto"]
}
```
OR
```json
{
  "type": "first_message"
}
```

## 🎬 Actions
A list of objects executed in sequence by N8N.

### 1. Send Text
```json
{
  "type": "send_text",
  "content": "Olá {{name}}, tudo bem?"
}
```

### 2. Wait (Delay)
```json
{
  "type": "delay",
  "duration": 60,
  "unit": "seconds"
}
```

### 3. Add Tag
```json
{
  "type": "add_tag",
  "tags": ["cliente_interessado"]
}
```

### 4. External Webhook
```json
{
  "type": "webhook",
  "url": "https://api.empresa.com/notificar",
  "method": "POST"
}
```
