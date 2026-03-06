import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    """Serviço para interagir com a API do WhatsApp (Place holder)"""
    
    def __init__(self, number: str):
        self.number = number
        
    def send_message(self, recipient: str, message: str):
        """Envia mensagem pelo WhatsApp (A implementar)"""
        logger.info(f"Sending WhatsApp from {self.number} to {recipient}: {message}")
        return {"success": True, "message_id": "mock_id"}
