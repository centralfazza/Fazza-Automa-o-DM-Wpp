import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN') || 'fazza_instagram_webhook_2024'

// Utility function to send a Direct Message
async function sendDirectMessage(recipientId: string, text: string, PAGE_ACCESS_TOKEN: string) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error('PAGE_ACCESS_TOKEN is missing.');
    return;
  }

  const graphApiUrl = `https://graph.instagram.com/v21.0/me/messages`;
  const replyPayload = {
    recipient: { id: recipientId },
    message: { text: text }
  };

  const response = await fetch(graphApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`
    },
    body: JSON.stringify(replyPayload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to send DM: ${response.status} - ${errorData}`);
  } else {
    console.log(`Successfully sent DM to ${recipientId}`);
  }
}

// Utility function to reply to a public comment
async function replyToComment(commentId: string, text: string, PAGE_ACCESS_TOKEN: string) {
  if (!PAGE_ACCESS_TOKEN) {
    console.error('PAGE_ACCESS_TOKEN is missing.');
    return;
  }

  const graphApiUrl = `https://graph.facebook.com/v21.0/${commentId}/replies`;
  const replyPayload = {
    message: text
  };

  const response = await fetch(graphApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAGE_ACCESS_TOKEN}`
    },
    body: JSON.stringify(replyPayload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to reply to comment: ${response.status} - ${errorData}`);
  } else {
    console.log(`Successfully replied to comment ${commentId}`);
  }
}

serve(async (req) => {
  const url = new URL(req.url)

  // 1. Handle Meta Webhook Verification (GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verification successful')
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    console.error('Webhook verification failed', { mode, token })
    return new Response('Verification failed', { status: 403 })
  }

  // 2. Handle Incoming Events from Meta (POST)
  if (req.method === 'POST') {
    try {
      const payload = await req.json()
      console.log('Received Payload:', JSON.stringify(payload))

      // Initialize Supabase Client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Process Instagram events
      if (payload.object === 'instagram') {
        const entries = payload.entry || [];
        
        for (const entry of entries) {
          const pageId = entry.id; // This is the Meta Page ID receiving the event
          
          if (!pageId) {
             console.error('No Page ID found in webhook entry');
             continue;
          }

          console.log(`Processing event for Page ID: ${pageId}`);

          // Fetch the access token from the database for this specific page
          const { data: channelData, error: channelError } = await supabase
            .from('channels')
            .select('access_token')
            .eq('platform', 'instagram')
            .eq('provider_id', pageId)
            .single();

          if (channelError || !channelData || !channelData.access_token) {
            console.error(`Could not find channel access token for Page ID ${pageId}. Error:`, channelError);
            continue; // Skip processing this entry if we can't reply
          }

          const dynamicPageAccessToken = channelData.access_token;
          console.log(`Successfully retrieved Access Token for Page ID: ${pageId}`);

          // --- HANDLE DIRECT MESSAGES ---
          const messaging = entry.messaging || [];
          for (const messageEvent of messaging) {
            if (messageEvent.message && messageEvent.message.text && !messageEvent.message.is_echo) {
              const senderId = messageEvent.sender.id;
              const text = messageEvent.message.text;
              const lowercaseText = text.toLowerCase();
              
              console.log(`Received DM "${text}" from ${senderId}`);
              
              // Basic Keyword Routing for DMs
              let replyText = "Olá! Recebemos sua mensagem. Nossa equipe vai te responder em breve.";
              if (lowercaseText.includes('olá') || lowercaseText.includes('oi') || lowercaseText.includes('hello')) {
                replyText = "Olá! Bem-vindo à Fazza CRM. 🚀 Se tiver alguma dúvida ou quiser saber nossos preços, é só mandar aqui.";
              } else if (lowercaseText.includes('preço') || lowercaseText.includes('valor') || lowercaseText.includes('planos')) {
                replyText = "Nossos planos são totalmente personalizáveis e podem escalar junto com a sua empresa. Qual o tamanho do seu time hoje?";
              }

              // Use dynamic token
              await sendDirectMessage(senderId, replyText, dynamicPageAccessToken);
            }
          }

          // --- HANDLE POST COMMENTS ---
          const changes = entry.changes || [];
          for (const change of changes) {
             if (change.field === 'comments') {
                const commentValue = change.value;
                // Avoid replying to the page's own comments to prevent loops
                const isReplyFromPage = commentValue.from.id === pageId;

                if (!isReplyFromPage && commentValue.text) {
                  const commentId = commentValue.id;
                  const commenterName = commentValue.from.username || commentValue.from.name;
                  const commenterId = commentValue.from.id; // Usually we need to use this to send a private reply
                  const text = commentValue.text.toLowerCase();
                  
                  console.log(`Received comment "${text}" from ${commenterName} (ID: ${commentId})`);

                  // If someone comments asking for info/price
                  if (text.includes('eu quero') || text.includes('preço') || text.includes('valor') || text.includes('info')) {
                     // 1. Reply to the comment publicly
                     await replyToComment(commentId, `Olá @${commenterName}! Te enviei todas as informações por Direct Message. Dá uma olhadinha lá! 🚀`, dynamicPageAccessToken);
                     
                     // 2. Send the private DM
                     await sendDirectMessage(commenterId, `Olá! Vi seu comentário no nosso post. Nossos planos começam a partir de R$97/mês. Como posso te ajudar hoje?`, dynamicPageAccessToken);
                  }
                }
             }
          }
        }
      }

      // Meta requires a 200 OK response within 20 seconds
      return new Response(JSON.stringify({ status: 'received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (e) {
      console.error('Error parsing POST payload', e)
      return new Response('Bad Request', { status: 400 })
    }
  }

  return new Response('Method Not Allowed', { status: 405 })
})
