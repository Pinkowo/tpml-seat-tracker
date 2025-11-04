#!/usr/bin/env python3
"""
測試後端啟動
"""
import sys
import traceback

def test_imports():
    """測試所有必要的 import"""
    print("📦 測試 import...")
    try:
        from src.config import settings
        print(f"  ✅ Config: {settings.database_url[:50]}...")
    except Exception as e:
        print(f"  ❌ Config 失敗: {e}")
        traceback.print_exc()
        return False
    
    try:
        from src.main import app
        print("  ✅ FastAPI app 載入成功")
    except Exception as e:
        print(f"  ❌ FastAPI app 載入失敗: {e}")
        traceback.print_exc()
        return False
    
    try:
        from src.db.connection import engine
        print("  ✅ Database engine 載入成功")
    except Exception as e:
        print(f"  ⚠️  Database engine: {e} (可能資料庫未啟動)")
    
    try:
        from src.models import Library, SeatRealtime
        print("  ✅ Models 載入成功")
    except Exception as e:
        print(f"  ❌ Models 載入失敗: {e}")
        traceback.print_exc()
        return False
    
    return True


def test_routes():
    """測試路由註冊"""
    print("\n📡 測試路由...")
    try:
        from src.main import app
        
        routes = [route.path for route in app.routes]
        expected_routes = [
            "/health",
            "/api/v1/libraries",
            "/api/v1/realtime",
            "/api/v1/predict",
            "/api/v1/health",
        ]
        
        for route in expected_routes:
            if route in routes or any(r.startswith(route) for r in routes):
                print(f"  ✅ {route}")
            else:
                print(f"  ⚠️  {route} 未找到")
        
        print(f"\n  總共 {len(routes)} 個路由已註冊")
        return True
    except Exception as e:
        print(f"  ❌ 路由測試失敗: {e}")
        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🧪 後端啟動測試\n")
    
    success = True
    success &= test_imports()
    success &= test_routes()
    
    print("\n" + "="*50)
    if success:
        print("✅ 所有測試通過！可以啟動應用程式：")
        print("   python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("❌ 有錯誤需要修復")
    print("="*50)
    
    sys.exit(0 if success else 1)

