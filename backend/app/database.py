"""
SQLite Database layer for LabelLens.
Stores inspections, panel images, extracted declarations, compliance results, and generated reports.
"""
import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "labelguard.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Inspections table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        brand TEXT NOT NULL,
        product_category TEXT,
        product_type TEXT,
        manufacturer_details TEXT,
        importer_details TEXT,
        batch_lot_number TEXT,
        shop_name TEXT NOT NULL,
        shop_address TEXT NOT NULL,
        district TEXT NOT NULL,
        state TEXT NOT NULL,
        inspection_date TEXT NOT NULL,
        inspector_name TEXT NOT NULL,
        inspector_id TEXT NOT NULL,
        inspection_notes TEXT,
        overall_status TEXT DEFAULT 'IN_PROGRESS',
        total_checks INTEGER DEFAULT 0,
        passed_checks INTEGER DEFAULT 0,
        violation_checks INTEGER DEFAULT 0,
        review_checks INTEGER DEFAULT 0,
        na_checks INTEGER DEFAULT 0,
        panels_json TEXT DEFAULT '[]',
        declarations_json TEXT DEFAULT '[]',
        compliance_results_json TEXT DEFAULT '[]',
        report_generated INTEGER DEFAULT 0,
        latest_report_id TEXT,
        latest_report_url TEXT,
        report_version INTEGER DEFAULT 0,
        report_generated_at TEXT,
        inspector_remarks TEXT,
        conclusion TEXT,
        signoff_name TEXT,
        signoff_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    
    # Reports version history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS inspection_reports (
        id TEXT PRIMARY KEY,
        inspection_id TEXT NOT NULL,
        report_number TEXT NOT NULL,
        version INTEGER NOT NULL,
        pdf_path TEXT NOT NULL,
        pdf_url TEXT NOT NULL,
        inspector_remarks TEXT,
        conclusion TEXT,
        signoff_name TEXT,
        signoff_date TEXT,
        generated_at TEXT NOT NULL,
        FOREIGN KEY (inspection_id) REFERENCES inspections (id)
    )
    """)
    
    conn.commit()
    conn.close()

def save_inspection(inspection_data: Dict[str, Any]) -> str:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    now = datetime.now().isoformat()
    inspection_id = inspection_data.get("id")
    
    # Check if exists
    cursor.execute("SELECT id, created_at, report_version FROM inspections WHERE id = ?", (inspection_id,))
    row = cursor.fetchone()
    
    panels_json = json.dumps(inspection_data.get("panels", []))
    declarations_json = json.dumps(inspection_data.get("declarations", []))
    compliance_json = json.dumps(inspection_data.get("compliance_results", []))
    
    if row:
        created_at = row["created_at"]
        cursor.execute("""
        UPDATE inspections SET
            product_name = ?,
            brand = ?,
            product_category = ?,
            product_type = ?,
            manufacturer_details = ?,
            importer_details = ?,
            batch_lot_number = ?,
            shop_name = ?,
            shop_address = ?,
            district = ?,
            state = ?,
            inspection_date = ?,
            inspector_name = ?,
            inspector_id = ?,
            inspection_notes = ?,
            overall_status = ?,
            total_checks = ?,
            passed_checks = ?,
            violation_checks = ?,
            review_checks = ?,
            na_checks = ?,
            panels_json = ?,
            declarations_json = ?,
            compliance_results_json = ?,
            report_generated = ?,
            latest_report_id = ?,
            latest_report_url = ?,
            report_version = ?,
            report_generated_at = ?,
            inspector_remarks = ?,
            conclusion = ?,
            signoff_name = ?,
            signoff_date = ?,
            updated_at = ?
        WHERE id = ?
        """, (
            inspection_data.get("product_name"),
            inspection_data.get("brand"),
            inspection_data.get("product_category"),
            inspection_data.get("product_type"),
            inspection_data.get("manufacturer_details", ""),
            inspection_data.get("importer_details", ""),
            inspection_data.get("batch_lot_number", ""),
            inspection_data.get("shop_name"),
            inspection_data.get("shop_address"),
            inspection_data.get("district"),
            inspection_data.get("state"),
            inspection_data.get("inspection_date"),
            inspection_data.get("inspector_name"),
            inspection_data.get("inspector_id"),
            inspection_data.get("inspection_notes", ""),
            inspection_data.get("overall_status", "IN_PROGRESS"),
            inspection_data.get("total_checks", 0),
            inspection_data.get("passed_checks", 0),
            inspection_data.get("violation_checks", 0),
            inspection_data.get("review_checks", 0),
            inspection_data.get("na_checks", 0),
            panels_json,
            declarations_json,
            compliance_json,
            1 if inspection_data.get("report_generated") else 0,
            inspection_data.get("latest_report_id"),
            inspection_data.get("latest_report_url"),
            inspection_data.get("report_version", 0),
            inspection_data.get("report_generated_at"),
            inspection_data.get("inspector_remarks", ""),
            inspection_data.get("conclusion", ""),
            inspection_data.get("signoff_name", ""),
            inspection_data.get("signoff_date", ""),
            now,
            inspection_id
        ))
    else:
        created_at = inspection_data.get("created_at") or now
        cursor.execute("""
        INSERT INTO inspections (
            id, product_name, brand, product_category, product_type,
            manufacturer_details, importer_details, batch_lot_number,
            shop_name, shop_address, district, state,
            inspection_date, inspector_name, inspector_id, inspection_notes,
            overall_status, total_checks, passed_checks, violation_checks,
            review_checks, na_checks, panels_json, declarations_json,
            compliance_results_json, report_generated, latest_report_id,
            latest_report_url, report_version, report_generated_at,
            inspector_remarks, conclusion, signoff_name, signoff_date,
            created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?
        )
        """, (
            inspection_id,
            inspection_data.get("product_name"),
            inspection_data.get("brand"),
            inspection_data.get("product_category"),
            inspection_data.get("product_type"),
            inspection_data.get("manufacturer_details", ""),
            inspection_data.get("importer_details", ""),
            inspection_data.get("batch_lot_number", ""),
            inspection_data.get("shop_name"),
            inspection_data.get("shop_address"),
            inspection_data.get("district"),
            inspection_data.get("state"),
            inspection_data.get("inspection_date") or now[:10],
            inspection_data.get("inspector_name"),
            inspection_data.get("inspector_id"),
            inspection_data.get("inspection_notes", ""),
            inspection_data.get("overall_status", "IN_PROGRESS"),
            inspection_data.get("total_checks", 0),
            inspection_data.get("passed_checks", 0),
            inspection_data.get("violation_checks", 0),
            inspection_data.get("review_checks", 0),
            inspection_data.get("na_checks", 0),
            panels_json,
            declarations_json,
            compliance_json,
            1 if inspection_data.get("report_generated") else 0,
            inspection_data.get("latest_report_id"),
            inspection_data.get("latest_report_url"),
            inspection_data.get("report_version", 0),
            inspection_data.get("report_generated_at"),
            inspection_data.get("inspector_remarks", ""),
            inspection_data.get("conclusion", ""),
            inspection_data.get("signoff_name", ""),
            inspection_data.get("signoff_date", ""),
            created_at,
            now
        ))
    
    conn.commit()
    conn.close()
    return inspection_id

def get_inspection(inspection_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inspections WHERE id = ?", (inspection_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    d = dict(row)
    d["panels"] = json.loads(d.get("panels_json") or "[]")
    d["declarations"] = json.loads(d.get("declarations_json") or "[]")
    d["compliance_results"] = json.loads(d.get("compliance_results_json") or "[]")
    d["report_generated"] = bool(d.get("report_generated"))
    return d

def list_inspections(
    search_query: Optional[str] = None,
    status_filter: Optional[str] = None,
    date_filter: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM inspections WHERE 1=1"
    params = []
    
    if status_filter and status_filter != "ALL":
        query += " AND overall_status = ?"
        params.append(status_filter)
        
    if date_filter:
        query += " AND inspection_date LIKE ?"
        params.append(f"%{date_filter}%")
        
    if search_query:
        query += """ AND (
            id LIKE ? OR 
            product_name LIKE ? OR 
            brand LIKE ? OR 
            shop_name LIKE ? OR 
            district LIKE ? OR
            state LIKE ?
        )"""
        pattern = f"%{search_query}%"
        params.extend([pattern, pattern, pattern, pattern, pattern, pattern])
        
    query += " ORDER BY updated_at DESC LIMIT ?"
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for row in rows:
        d = dict(row)
        d["report_generated"] = bool(d.get("report_generated"))
        results.append(d)
    return results

def get_dashboard_metrics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM inspections")
    total_inspections = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM inspections WHERE overall_status = 'POTENTIAL_VIOLATIONS'")
    violations = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM inspections WHERE overall_status = 'NEEDS_REVIEW'")
    needs_review = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM inspections WHERE overall_status = 'COMPLIANT'")
    compliant = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM inspections WHERE report_generated = 1")
    reports_generated = cursor.fetchone()[0]
    
    conn.close()
    
    recent = list_inspections(limit=10)
    
    return {
        "total_inspections": total_inspections,
        "inspections_with_violations": violations,
        "inspections_needing_review": needs_review,
        "compliant_inspections": compliant,
        "reports_generated": reports_generated,
        "recent_inspections": recent
    }

def save_report_record(
    inspection_id: str,
    report_number: str,
    version: int,
    pdf_path: str,
    pdf_url: str,
    inspector_remarks: str = "",
    conclusion: str = "",
    signoff_name: str = "",
    signoff_date: str = ""
):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    report_id = f"REP-{report_number}-V{version}"
    
    cursor.execute("""
    INSERT INTO inspection_reports (
        id, inspection_id, report_number, version,
        pdf_path, pdf_url, inspector_remarks, conclusion,
        signoff_name, signoff_date, generated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report_id, inspection_id, report_number, version,
        pdf_path, pdf_url, inspector_remarks, conclusion,
        signoff_name, signoff_date, now
    ))
    conn.commit()
    conn.close()
    return report_id
