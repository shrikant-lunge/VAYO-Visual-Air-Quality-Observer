"""
Reports Management Service
Handles community reports submitted by users (pollution, issues, etc.)
"""

from typing import List, Dict, Tuple
from datetime import datetime
import firebase_admin
from firebase_admin import db as rtdb

class ReportsManagementService:
    """Service for managing user-submitted reports"""
    
    def __init__(self):
        pass
    
    def get_all_reports(self, filter_status: str = None) -> List[Dict]:
        """
        Fetch all reports from database
        
        Args:
            filter_status: Optional filter - 'resolved', 'unresolved', or None for all
        
        Returns:
            List of reports sorted by newest first
        """
        try:
            reports_ref = rtdb.reference('communityReports')
            reports_data = reports_ref.get()
            
            if not reports_data:
                return []
            
            reports_list = []
            
            for report_id, report_data in reports_data.items():
                if not report_data:
                    continue
                
                # Apply status filter if provided
                if filter_status:
                    status = report_data.get('status', 'unresolved')
                    if status != filter_status:
                        continue
                
                # Add report ID to data
                report_with_id = {
                    'id': report_id,
                    **report_data
                }
                reports_list.append(report_with_id)
            
            # Sort by timestamp (newest first)
            reports_list.sort(
                key=lambda r: r.get('timestamp', ''),
                reverse=True
            )
            
            return reports_list
        except Exception as e:
            print(f"Error fetching reports: {e}")
            return []
    
    def mark_resolved(self, report_id: str) -> Tuple[bool, Dict]:
        """Mark a report as resolved"""
        try:
            report_ref = rtdb.reference(f'communityReports/{report_id}')
            report_ref.update({
                'status': 'resolved',
                'resolvedAt': datetime.now().isoformat()
            })
            return True, {"message": "Report marked as resolved"}
        except Exception as e:
            print(f"Error marking report resolved: {e}")
            return False, {"error": str(e)}
    
    def mark_unresolved(self, report_id: str) -> Tuple[bool, Dict]:
        """Mark a report as unresolved"""
        try:
            report_ref = rtdb.reference(f'communityReports/{report_id}')
            report_ref.update({
                'status': 'unresolved',
                'resolvedAt': None
            })
            return True, {"message": "Report marked as unresolved"}
        except Exception as e:
            print(f"Error marking report unresolved: {e}")
            return False, {"error": str(e)}
    
    def add_admin_comment(self, report_id: str, admin_email: str, comment: str) -> Tuple[bool, Dict]:
        """Add an admin comment to a report"""
        try:
            report_ref = rtdb.reference(f'communityReports/{report_id}')
            
            # Get existing comments or create new list
            current_data = report_ref.get()
            comments = current_data.get('adminComments', []) if current_data else []
            
            # Add new comment
            new_comment = {
                'adminEmail': admin_email,
                'comment': comment,
                'timestamp': datetime.now().isoformat()
            }
            comments.append(new_comment)
            
            report_ref.update({'adminComments': comments})
            return True, {"message": "Comment added successfully"}
        except Exception as e:
            print(f"Error adding comment: {e}")
            return False, {"error": str(e)}
    
    def delete_report(self, report_id: str) -> Tuple[bool, Dict]:
        """Delete a report"""
        try:
            report_ref = rtdb.reference(f'communityReports/{report_id}')
            report_ref.delete()
            return True, {"message": "Report deleted"}
        except Exception as e:
            print(f"Error deleting report: {e}")
            return False, {"error": str(e)}
    
    def get_report_stats(self) -> Dict:
        """Get statistics about all reports"""
        try:
            reports = self.get_all_reports()
            
            resolved_count = sum(1 for r in reports if r.get('status') == 'resolved')
            unresolved_count = len(reports) - resolved_count
            
            return {
                "total": len(reports),
                "resolved": resolved_count,
                "unresolved": unresolved_count
            }
        except Exception as e:
            print(f"Error getting report stats: {e}")
            return {"total": 0, "resolved": 0, "unresolved": 0}
