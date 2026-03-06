import { Automation } from '../types';

/**
 * INSTAGRAM: Comment to DM Flow
 */
export const COMMENT_TO_DM_TEMPLATE: Partial<Automation> = {
  name: '📸 IG: Comment Giveaway',
  type: 'flow',
  isActive: false,
  platforms: ['instagram'],
  triggersSummary: ['Comment: "EUQUERO"'],
  nodes: [
    {
      id: 'trigger-1',
      type: 'trigger',
      label: 'Comment Trigger',
      position: { x: 50, y: 250 },
      data: {
        trigger: {
          type: 'comment',
          platform: 'instagram',
          matchType: 'contains',
          keywords: ['euquero', 'eu quero']
        }
      }
    },
    {
      id: 'msg-1',
      type: 'message',
      label: 'Deliver Ebook',
      position: { x: 400, y: 250 },
      data: {
        message: {
          text: 'Olá! Aqui está o material que você pediu no post. Aproveite! 👇',
          buttons: [
            { type: 'url', label: '📥 Baixar PDF', payload: 'https://fazza.io/ebook.pdf' },
            { type: 'node', label: 'Falar com Consultor', payload: 'action-handover' }
          ]
        }
      }
    },
    {
      id: 'action-handover',
      type: 'action',
      label: 'Human Handover',
      position: { x: 800, y: 350 },
      data: {
        action: {
          type: 'human_handover',
          payload: { reason: 'User clicked button' }
        }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'trigger-1', target: 'msg-1' },
    { id: 'e2', source: 'msg-1', target: 'action-handover', sourceHandle: 'btn-2' }
  ]
};

/**
 * WHATSAPP: Inbound Lead Qualification
 * Shows Interactive List Messages (Only works on WA)
 */
export const WA_QUALIFICATION_FLOW: Partial<Automation> = {
  name: '🟢 WA: Lead Qualification',
  type: 'flow',
  isActive: true,
  platforms: ['whatsapp'],
  triggersSummary: ['Keyword: "ORCAMENTO"'],
  nodes: [
    {
      id: 'start',
      type: 'trigger',
      label: 'Inbound Message',
      position: { x: 50, y: 300 },
      data: { 
        trigger: { 
          type: 'whatsapp_inbound', 
          platform: 'whatsapp',
          keywords: ['orcamento', 'preço', 'cotacao']
        } 
      }
    },
    {
      id: 'msg-menu',
      type: 'message',
      label: 'Main Menu (List)',
      position: { x: 350, y: 300 },
      data: {
        message: {
          text: 'Olá! Bem-vindo à Fazza. Como podemos ajudar hoje?',
          listSectionTitle: 'Escolha uma opção',
          listRows: [
            { id: 'opt_plans', title: 'Ver Planos', description: 'Preços e recursos' },
            { id: 'opt_support', title: 'Suporte Técnico', description: 'Problemas com conta' },
            { id: 'opt_sales', title: 'Falar com Vendas', description: 'Atendimento humano' }
          ]
        }
      }
    },
    {
      id: 'action-tag-sales',
      type: 'action',
      label: 'Tag: Sales Lead',
      position: { x: 700, y: 450 },
      data: {
        action: { type: 'add_tag', payload: { tagName: 'Hot_Lead_WA' } }
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'msg-menu' },
    { id: 'e2', source: 'msg-menu', target: 'action-tag-sales', sourceHandle: 'opt_sales' }
  ]
};