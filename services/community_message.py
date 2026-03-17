"""
Community Message Broadcast Service
Manages community-wide announcements with expiry dates
"""

from typing import List, Dict, Tuple
from datetime import datetime
import firebase_admin
from firebase_admin import db as rtdb

class CommunityMessageService:
    """Service for managing community broadcast messages"""
    
    def __init__(self):
        pass
    
    def create_message(self, title: str, content: str, expires_at: str) -> Tuple[bool, Dict]:
        """
        Create and publish a community message
        
        Args:
            title: Message title
            content: Message content/body
            expires_at: ISO format datetime string for message expiry
        
        Returns:
            Tuple of (success: bool, result: dict with messageId)
        """
        try:
            messages_ref = rtdb.reference('communityMessages')
            
            new_message = {
                'title': title,
                'content': content,
                'createdAt': datetime.now().isoformat(),
                'expiresAt': expires_at,
                'active': True
            }
            
            # Push generates a unique ID
            result = messages_ref.push(new_message)
            message_id = result.key
            
            return True, {
                "messageId": message_id,
                "message": "Message published successfully"
            }
        except Exception as e:
            print(f"Error creating community message: {e}")
            return False, {"error": str(e)}
    
    def get_active_messages(self) -> List[Dict]:
        """
        Fetch all non-expired community messages
        
        Returns:
            List of active messages
        """
        try:
            messages_ref = rtdb.reference('communityMessages')
            messages_data = messages_ref.get()
            
            if not messages_data:
                return []
            
            active_messages = []
            now = datetime.now()
            
            for message_id, message_data in messages_data.items():
                if not message_data:
                    continue
                
                # Check if message has expired
                expires_at_str = message_data.get('expiresAt', '')
                if expires_at_str:
                    try:
                        expires_at = datetime.fromisoformat(expires_at_str)
                        if now > expires_at:
                            continue  # Skip expired messages
                    except:
                        pass
                
                # Add message ID to data
                message_with_id = {
                    'id': message_id,
                    **message_data
                }
                active_messages.append(message_with_id)
            
            # Sort by creation date (newest first)
            active_messages.sort(
                key=lambda m: m.get('createdAt', ''),
                reverse=True
            )
            
            return active_messages
        except Exception as e:
            print(f"Error fetching community messages: {e}")
            return []
    
    def delete_message(self, message_id: str) -> Tuple[bool, Dict]:
        """Delete a community message"""
        try:
            message_ref = rtdb.reference(f'communityMessages/{message_id}')
            message_ref.delete()
            return True, {"message": "Message deleted"}
        except Exception as e:
            print(f"Error deleting message: {e}")
            return False, {"error": str(e)}
    
    def update_message(self, message_id: str, title: str, content: str, expires_at: str) -> Tuple[bool, Dict]:
        """Update a community message"""
        try:
            message_ref = rtdb.reference(f'communityMessages/{message_id}')
            message_ref.update({
                'title': title,
                'content': content,
                'expiresAt': expires_at,
                'updatedAt': datetime.now().isoformat()
            })
            return True, {"message": "Message updated"}
        except Exception as e:
            print(f"Error updating message: {e}")
            return False, {"error": str(e)}
