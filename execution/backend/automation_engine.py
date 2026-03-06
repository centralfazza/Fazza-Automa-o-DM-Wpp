import asyncio
from typing import Dict, Any, List, Optional
from execution.backend.instagram_service import meta_api

# Note: In a real production app, imports to database/models would be needed here to save logs/tags
# from execution.backend.database import SessionLocal
# from execution.backend import models

class ExecutionEngine:
    def __init__(self, automation: Dict[str, Any], contact: Dict[str, Any], initial_message: str):
        self.automation = automation # The DB record dump
        self.contact = contact       # The DB record dump OR dict with id, platform, phone, external_id
        self.initial_message = initial_message
        
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
        print(f"✅ Starting Native Execution Engine: {self.automation.get('name')}")
        
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
                    # Logic: pick a random edge. In a real app, uses data.weights
                    selected_edge = random.choice(outgoing_edges)
                    outgoing_edges = [selected_edge]

            for edge in outgoing_edges:
                next_node_id = edge.get('target')
                edge_id = edge.get('id', f"{current_node_id}->{next_node_id}")
                
                # Cycle detection
                if (next_node_id, edge_id) in self.visited:
                    print(f"⚠️ Cycle detected at {next_node_id}. Skipping.")
                    continue
                self.visited.add((next_node_id, edge_id))

                next_node = self.node_map.get(next_node_id)
                if not next_node: continue
                
                try:
                    should_continue = await self._execute_node(next_node, edge)
                    if should_continue:
                        queue.append((next_node_id, edge))
                except Exception as e:
                    print(f"❌ Error at node {next_node_id}: {e}")

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
        print(f"▶️ Executing: {node_type} - {data.get('label', 'Unnamed')}")

        if node_type == 'message':
            content = self._replace_variables(data.get('content', ''))
            return await self._send_msg(content)

        elif node_type == 'delay':
            duration = int(data.get('duration', 5))
            u = data.get('unit', 'm')
            sleep_time = duration * (60 if u == 'm' else 3600 if u == 'h' else 86400 if u == 'd' else 1)
            print(f"⏳ Sleeping {duration}{u}...")
            await asyncio.sleep(min(sleep_time, 2)) # Cap for demo
            return True

        elif node_type == 'action':
            a_type = data.get('actionType')
            if a_type == 'buttons':
                # Special interactive message handling
                btns = data.get('buttons', [])
                content = self._replace_variables(data.get('label', 'Escolha uma opção:'))
                print(f"🔘 Sending Buttons: {btns}")
                return await self._send_msg(f"{content} (Buttons: {[b.get('text') for b in btns]})")
            
            print(f"🔧 Action: {a_type} -> {data.get('value')}")
            return True

        elif node_type == 'logic':
            source_handle = edge_traversed.get('sourceHandle')
            cond = data.get('condition', '').lower()
            passed = True # Simplified
            if 'vip' in cond:
                passed = 'vip' in [t.lower() for t in self.contact.get('tags', [])]
            
            print(f"🔀 Logic '{cond}': {passed} (Match handle: {source_handle})")
            return (passed and source_handle == 'true') or (not passed and source_handle == 'false')

        elif node_type == 'randomSplit':
            # This node itself doesn't "do" anything, logic is handled in run()
            return True

        return True

    async def _send_msg(self, text: str) -> bool:
        platform = self.automation.get('platform')
        if platform == 'instagram':
            return await meta_api.send_instagram_message(self.contact.get('external_id'), text)
        elif platform == 'whatsapp':
            return await meta_api.send_whatsapp_message(
                self.contact.get('phone', 'unknown'), text, "default_wa_id")
        return False

        return True

