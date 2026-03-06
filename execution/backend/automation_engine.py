"""
Motor de automação - Código determinístico
Processa comentários Instagram, DMs recebidas e novos seguidores
"""
import logging
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from execution.backend.models import Automation, Company, Contact, AnalyticsLog
from execution.backend.instagram_service import InstagramAPI
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class AutomationEngine:
    """Motor de automação determinístico"""

    def __init__(self, db: Session):
        self.db = db

    # ─── Comentários ──────────────────────────────────────────────────────────

    def process_instagram_comment(self, webhook_data: Dict) -> Dict:
        """Processa comentário do Instagram"""
        try:
            comment_id = webhook_data['id']
            comment_text = webhook_data['text']
            commenter_id = webhook_data['from']['id']
            commenter_username = webhook_data['from']['username']
            instagram_account_id = webhook_data['instagram_account_id']

            logger.info(f"Processing comment {comment_id} from {commenter_username}")

            company = self._get_company(instagram_account_id)
            if not company:
                return {'success': False, 'error': 'Company not found'}

            automations = self._get_active_automations(company.id)
            matched = self._match_automation(automations, comment_text, trigger_type='comment')

            if not matched:
                return {'success': True, 'matched': False}

            context = {
                'username': commenter_username,
                'commenter_id': commenter_id,
                'comment_id': comment_id,
                'company': company,
            }

            result = self._execute_actions(matched, context)
            self._log_execution(matched.id, result['success'], webhook_data, result.get('error'))
            return result

        except Exception as e:
            logger.error(f"Error processing comment: {str(e)}")
            return {'success': False, 'error': str(e)}

    # ─── DMs recebidas ────────────────────────────────────────────────────────

    def process_instagram_dm(self, webhook_data: Dict) -> Dict:
        """
        Processa DM recebida no Instagram.
        webhook_data esperado:
          {sender_id, recipient_id, message_text, instagram_account_id}
        """
        try:
            sender_id = webhook_data['sender_id']
            message_text = webhook_data.get('message_text', '')
            instagram_account_id = webhook_data['instagram_account_id']
            sender_username = webhook_data.get('sender_username', sender_id)

            logger.info(f"Processing DM from {sender_id}: {message_text[:50]}")

            company = self._get_company(instagram_account_id)
            if not company:
                return {'success': False, 'error': 'Company not found'}

            automations = self._get_active_automations(company.id)
            matched = self._match_automation(automations, message_text, trigger_type='dm')

            if not matched:
                return {'success': True, 'matched': False}

            context = {
                'username': sender_username,
                'commenter_id': sender_id,
                'comment_id': None,
                'company': company,
            }

            result = self._execute_actions(matched, context)
            self._log_execution(matched.id, result['success'], webhook_data, result.get('error'))
            return result

        except Exception as e:
            logger.error(f"Error processing DM: {str(e)}")
            return {'success': False, 'error': str(e)}

    # ─── Novo seguidor ────────────────────────────────────────────────────────

    def process_new_follower(self, webhook_data: Dict) -> Dict:
        """
        Processa evento de novo seguidor.
        Dispara automações do tipo trigger 'follow' (sem keyword match).
        webhook_data esperado:
          {follower_id, follower_username, instagram_account_id}
        """
        try:
            follower_id = webhook_data['follower_id']
            follower_username = webhook_data.get('follower_username', follower_id)
            instagram_account_id = webhook_data['instagram_account_id']

            logger.info(f"New follower: {follower_username} ({follower_id})")

            company = self._get_company(instagram_account_id)
            if not company:
                return {'success': False, 'error': 'Company not found'}

            automations = self._get_active_automations(company.id)
            follow_automation = next(
                (a for a in automations if a.triggers.get('type') == 'follow'),
                None
            )

            if not follow_automation:
                return {'success': True, 'matched': False}

            context = {
                'username': follower_username,
                'commenter_id': follower_id,
                'comment_id': None,
                'company': company,
            }

            result = self._execute_actions(follow_automation, context)
            self._log_execution(follow_automation.id, result['success'], webhook_data, result.get('error'))
            return result

        except Exception as e:
            logger.error(f"Error processing new follower: {str(e)}")
            return {'success': False, 'error': str(e)}

    # ─── Helpers internos ─────────────────────────────────────────────────────

    def _get_company(self, instagram_account_id: str) -> Optional[Company]:
        company = self.db.query(Company).filter(
            Company.instagram_account_id == instagram_account_id
        ).first()
        if not company:
            logger.warning(f"Company not found for Instagram account {instagram_account_id}")
        return company

    def _get_active_automations(self, company_id: str) -> List[Automation]:
        return self.db.query(Automation).filter(
            Automation.company_id == company_id,
            Automation.platform == 'instagram',
            Automation.is_active == True
        ).all()

    def _match_automation(self, automations: List[Automation], text: str, trigger_type: str) -> Optional[Automation]:
        """Match de automação baseado em keywords (determinístico)"""
        text_lower = text.lower()

        for automation in automations:
            triggers = automation.triggers

            if triggers.get('type') != trigger_type:
                continue

            keywords = triggers.get('keywords', [])

            for keyword in keywords:
                if keyword.lower() in text_lower:
                    logger.info(f"Matched automation {automation.id} with keyword '{keyword}'")
                    return automation

        return None

    def _execute_actions(self, automation: Automation, context: Dict) -> Dict:
        """Executa lista de actions sequencialmente (determinístico)"""
        company = context['company']
        instagram_api = InstagramAPI(company.instagram_access_token)

        results = []
        actions = sorted(automation.actions, key=lambda x: x['order'])

        for action in actions:
            action_type = action['type']

            try:
                if action_type == 'reply_comment' and context.get('comment_id'):
                    message = self._replace_variables(action['content'], context)
                    instagram_api.reply_to_comment(context['comment_id'], message)
                    results.append({'action': 'reply_comment', 'success': True})

                elif action_type == 'send_dm':
                    message = self._replace_variables(action['content'], context)
                    instagram_api.send_dm(context['commenter_id'], message)
                    results.append({'action': 'send_dm', 'success': True})

                elif action_type == 'delay':
                    seconds = action.get('seconds', 0)
                    time.sleep(seconds)
                    results.append({'action': 'delay', 'seconds': seconds})

                elif action_type == 'add_tag':
                    self._add_contact_tag(company.id, context['commenter_id'], action['tag'])
                    results.append({'action': 'add_tag', 'success': True})

            except Exception as e:
                error_msg = str(e)
                logger.error(f"Error executing action {action_type}: {error_msg}")
                results.append({'action': action_type, 'success': False, 'error': error_msg})

        success = all(r.get('success', True) for r in results)
        return {
            'success': success,
            'actions_executed': len(results),
            'results': results,
            'error': None if success else "Some actions failed"
        }

    def _replace_variables(self, text: str, context: Dict) -> str:
        """Substitui variáveis no texto (determinístico)"""
        replacements = {
            '{username}': context.get('username', ''),
            '{time}': datetime.now().strftime('%H:%M'),
            '{date}': datetime.now().strftime('%d/%m/%Y'),
        }

        for var, value in replacements.items():
            text = text.replace(var, value)

        return text

    def _add_contact_tag(self, company_id: str, external_id: str, tag: str):
        """Adiciona tag no contato"""
        contact = self.db.query(Contact).filter(
            Contact.company_id == company_id,
            Contact.external_id == external_id
        ).first()

        if not contact:
            contact = Contact(
                company_id=company_id,
                platform='instagram',
                external_id=external_id,
                tags=[tag]
            )
            self.db.add(contact)
        else:
            if tag not in contact.tags:
                contact.tags.append(tag)

        self.db.commit()

    def _log_execution(self, automation_id: str, success: bool, trigger_data: Dict, error_message: Optional[str] = None):
        """Loga execução no banco"""
        log = AnalyticsLog(
            automation_id=automation_id,
            executed_at=datetime.utcnow(),
            success=success,
            trigger_data=trigger_data,
            error_message=error_message
        )
        self.db.add(log)
        self.db.commit()
