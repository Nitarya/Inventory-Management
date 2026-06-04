#!/usr/bin/env python3
"""
Seed script for Inventory & Order Management System.

Usage:
    python seed.py                          # localhost:8000
    python seed.py https://my-api.com       # custom URL
    python seed.py http://localhost:8000 admin admin123

Defaults: http://localhost:8000  admin  admin123
"""

import sys
import urllib.request
import urllib.error
import json

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
ADMIN_USER = sys.argv[2] if len(sys.argv) > 2 else "admin"
ADMIN_PASS = sys.argv[3] if len(sys.argv) > 3 else "admin123"


# ── helpers ──────────────────────────────────────────────────────────

def req(method, path, body=None, token=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            if raw:
                return json.loads(raw)
            return None
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        try:
            msg = json.loads(detail).get("detail", detail)
        except json.JSONDecodeError:
            msg = detail
        print(f"  ⚠  {method} {path} → {e.code} {msg}")
        return None


def ok(method, path, body=None, token=None):
    result = req(method, path, body, token)
    assert result is not None, f"{method} {path} failed"
    return result


# ── main ─────────────────────────────────────────────────────────────

def main():
    print(f"🌱  Seeding inventory database at {BASE_URL}")
    print(f"    User: {ADMIN_USER}")
    print()

    # 1. Login ─────────────────────────────────────────────────────────
    print("🔑  Logging in …")
    token = ok("POST", "/api/auth/login", {"username": ADMIN_USER, "password": ADMIN_PASS})["access_token"]
    print("    Token obtained\n")

    # 2. Create 10 products ────────────────────────────────────────────
    print("📦  Creating 10 products …")

    products = [
        {"name": "Wireless Keyboard",     "sku": "KB-001", "price": 49.99,  "quantity": 25, "category": "Electronics",   "description": "Bluetooth mechanical keyboard"},
        {"name": "USB-C Monitor 27\"",     "sku": "MN-001", "price": 349.00, "quantity": 2,  "category": "Electronics",   "description": "4K USB-C hub monitor"},
        {"name": "Ergonomic Mouse",        "sku": "MS-001", "price": 29.99,  "quantity": 40, "category": "Accessories",   "description": "Vertical ergonomic mouse"},
        {"name": "Laptop Stand",           "sku": "LS-001", "price": 39.99,  "quantity": 15, "category": "Accessories",   "description": "Adjustable aluminium stand"},
        {"name": "Webcam 1080p",           "sku": "WC-001", "price": 79.99,  "quantity": 1,  "category": "Electronics",   "description": "1080p auto-focus webcam"},
        {"name": "Noise-Cancelling Headphones", "sku": "HP-001", "price": 199.00, "quantity": 12, "category": "Audio", "description": "Over-ear Bluetooth headphones"},
        {"name": "USB-C Hub 7-in-1",       "sku": "UB-001", "price": 34.99,  "quantity": 30, "category": "Electronics",   "description": "7-port USB-C adapter"},
        {"name": "Desk Lamp LED",          "sku": "DL-001", "price": 24.99,  "quantity": 20, "category": "Office",        "description": "Adjustable warm/cool LED"},
        {"name": "Mechanical Keyboard Switches", "sku": "KS-001", "price": 14.99, "quantity": 100, "category": "Accessories", "description": "Cherry MX Blue switches (pack of 10)"},
        {"name": "Monitor Arm",            "sku": "MA-001", "price": 89.99,  "quantity": 0,  "category": "Office",        "description": "Gas spring dual-monitor arm"},
    ]

    created_products = []
    for p in products:
        result = req("POST", "/api/products", p, token)
        if result:
            created_products.append(result)
            print(f"    ✓ {result['sku']:8s}  {result['name']:35s}  qty: {result['quantity']:3d}  ${result['price']:.2f}")
        else:
            print(f"    ✗ {p['sku']:8s}  {p['name']:35s}  (may already exist — skipping)")

    if not created_products:
        # fetch existing if all failed (duplicates from a previous run)
        created_products = req("GET", "/api/products", token=token) or []

    print(f"    → {len(created_products)} product(s) ready\n")

    # 3. Create 5 customers ───────────────────────────────────────────
    print("👤  Creating 5 customers …")

    customers = [
        {"name": "Priya Sharma",   "email": "priya@example.com",    "phone": "+91-98765-43210", "address": "42 MG Road, Indiranagar, Bengaluru, Karnataka"},
        {"name": "Rahul Verma",    "email": "rahul@example.com",    "phone": "+91-98765-43211", "address": "15 Sector 18, Noida, Uttar Pradesh"},
        {"name": "Ananya Gupta",   "email": "ananya@example.com",   "phone": "+91-98765-43212", "address": "88 Linking Road, Bandra West, Mumbai, Maharashtra"},
        {"name": "Vikram Patel",   "email": "vikram@example.com",   "phone": "+91-98765-43213", "address": "7/1 Kankulia Road, Kalighat, Kolkata, West Bengal"},
        {"name": "Sneha Reddy",    "email": "sneha@example.com",    "phone": "+91-98765-43214", "address": "21 Jubilee Hills, Road No 12, Hyderabad, Telangana"},
    ]

    created_customers = []
    for c in customers:
        result = req("POST", "/api/customers", c, token)
        if result:
            created_customers.append(result)
            print(f"    ✓ {result['name']:20s}  {result['email']}")
        else:
            print(f"    ✗ {c['name']:20s}  {c['email']}  (may already exist — skipping)")

    if not created_customers:
        created_customers = req("GET", "/api/customers", token=token) or []

    print(f"    → {len(created_customers)} customer(s) ready\n")

    # 4. Place a few orders ───────────────────────────────────────────
    print("📋  Placing orders …")

    # Build a lookup: sku → product
    by_sku = {p["sku"]: p for p in created_products}

    orders = [
        {"items": [{"product_id": by_sku["KB-001"]["id"], "quantity": 2},
                   {"product_id": by_sku["MS-001"]["id"], "quantity": 1}],
         "note": "Priya orders keyboard + mouse"},
        {"items": [{"product_id": by_sku["HP-001"]["id"], "quantity": 1},
                   {"product_id": by_sku["UB-001"]["id"], "quantity": 2}],
         "note": "Rahul orders headphones + hub"},
        {"items": [{"product_id": by_sku["LS-001"]["id"], "quantity": 1},
                   {"product_id": by_sku["DL-001"]["id"], "quantity": 2}],
         "note": "Ananya orders stand + lamp"},
        {"items": [{"product_id": by_sku["KS-001"]["id"], "quantity": 5}],
         "note": "Vikram buys mechanical keyboard switches (pack of 5)"},
    ]

    for i, order in enumerate(orders):
        customer = created_customers[i % len(created_customers)]
        payload = {"customer_id": customer["id"], "items": order["items"]}
        result = req("POST", "/api/orders", payload, token)
        if result:
            print(f"    ✓ Order #{result['id']}  ${result['total_amount']:.2f}  ({order['note']})")
        else:
            print(f"    ✗ Order ({order['note']})")

    print()

    # 5. Summary ───────────────────────────────────────────────────────
    print("🔍  Final stock check (low-stock items):")
    for p in created_products:
        current = next(
            (cp for cp in (req("GET", f"/api/products/{p['id']}", token=token) or []) if isinstance(cp, dict)),
            p
        )
        # fetch fresh
        fresh = req("GET", f"/api/products/{p['id']}", token=token)
        if fresh:
            qty = fresh["quantity"]
            if qty < 3:
                print(f"    ⚠  {fresh['sku']:8s}  {fresh['name']:35s}  stock: {qty}")

    print()
    print("✅  Seeding complete!")
    print(f"\n    Login at {BASE_URL}  (admin / admin123)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"  ⚠  Seed failed: {e}")
        print("     The application will still start. Run seeding manually later.")
        sys.exit(0)  # exit cleanly so container doesn't restart
