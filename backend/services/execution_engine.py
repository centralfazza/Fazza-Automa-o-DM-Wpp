import asyncio
from typing import Dict, Any, List, Optional
from services.meta_api import meta_api
from database import AsyncSessionLocal
import models
from sqlalchemy import select

class ExecutionEngine:
    def __init__(self, automation: Dict[str, Any], contact: Dict[str, Any], initial_message: str, access_token: Optional[str] = None):
        self.automation = automation # The DB record dump
        self.contact = contact       # The DB record dump OR dict with id, platform, phone, external_id
        self.initial_message = initial_message
        self.access_token = access_token
        
        # Parse the Flow JSON
        self.graph = self.automation.get('actions', {})
        self.nodes = self.graph.get('nodes', [])
        self.edges = self.graph.get('edges', [])
        
        # Helper maps
        self.node_map = {n['id']: n for n in self.nodes}
        self.visited = set() # (node_id, incoming_edge_id) to prevent infinite cycles
        
        # Build adjacency list: node_id -> list of outgoing edges
        self.adj_list = {}
        for edge in self.edges:
            src = edge['source']
            if src not in self.adj_list:
                self.adj_list[src] = []
            self.adj_list[src].append(edge)

    async def run(self):
        """Starts the flow execution from the Trigger node"""
        print(f"✅ Executing Native Flow: {self.automation.get('name')}")
        
        trigger_node = next((n for n in self.nodes if n.get('type') == 'trigger'), None)
        if not trigger_node:
            print("❌ No trigger node found.")
            return

        queue = [(trigger_node['id'], None)] 
        
        while queue:
            current_node_id, incoming_edge = queue.pop(0)
            
            # Executing node children
            outgoing_edges = self.adj_list.get(current_node_id, [])
            
            # If current node is a RandomSplit, we only pick ONE edge
            node = self.node_map.get(current_node_id)
            if node and node.get('type') == 'randomSplit':
                import random
                if outgoing_edges:
                    selected_edge = random.choice(outgoing_edges)
                    outgoing_edges = [selected_edge]

            for edge in outgoing_edges:
                next_node_id = edge.get('target')
                edge_id = edge.get('id', f"{current_node_id}->{next_node_id}")
                
                # Cycle detection
                if (next_node_id, edge_id) in self.visited:
                    continue
                self.visited.add((next_node_id, edge_id))

                next_node = self.node_map.get(next_node_id)
                if not next_node: continue
                
                try:
                    should_continue = await self._execute_node(next_node, edge)
                    if should_continue:
                        queue.append((next_node_id, edge))
                except Exception as e:
                    print(f"❌ Execution error: {e}")

    def _replace_variables(self, text: str) -> str:
        if not text: return ""
        variables = {
            "{firstName}": self.contact.get("name", "Usuário"),
            "{name}": self.contact.get("name", "Usuário"),
            "{phone}": self.contact.get("phone", "N/A"),
            "{platform}": self.contact.get("platform", "N/A"),
        }
        for placeholder, value in variables.items():
            text = text.replace(placeholder, str(value))
        return text

    async def _execute_node(self, node: Dict[str, Any], edge_traversed: Dict[str, Any]) -> bool:
        node_type = node.get('type')
        data = node.get('data', {})

        if node_type == 'message':
            content = self._replace_variables(data.get('content', ''))
            return await self._send_msg(content)

        elif node_type == 'delay':
            duration = int(data.get('duration', 5))
            u = data.get('unit', 's')
            sleep_time = duration * (60 if u == 'm' else 3600 if u == 'h' else 86400 if u == 'd' else 1)
            print(f"⏳ Delay {duration}{u}...")
            await asyncio.sleep(sleep_time)
            return True

        elif node_type == 'action':
            a_type = data.get('actionType')
            print(f"🔧 Action Node: {a_type}")
            return True

        elif node_type == 'logic':
            source_handle = edge_traversed.get('sourceHandle')
            cond = data.get('condition', '').lower()
            passed = True # Simplified logic
            return (passed and source_handle == 'true') or (not passed and source_handle == 'false')

        elif node_type == 'randomSplit':
            return True

        return True

    async def _send_msg(self, text: str) -> bool:
        platform = self.automation.get('platform')
        if platform == 'instagram':
            return await meta_api.send_instagram_message(self.contact.get('external_id'), text, self.access_token)
        elif platform == 'whatsapp':
            phone = self.contact.get('phone') or self.contact.get('external_id')
            return await meta_api.send_whatsapp_message(phone, text, "default", self.access_token)
        return False

