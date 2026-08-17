"""Test script to verify all 54 SQLAlchemy models and configure their mappers."""

import os
import sys

# Add current directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import configure_mappers
from core.database import Base
import models  # Imports all models registered in models/__init__.py

def test_models():
    print("Initializing verification of SQLAlchemy model mappings...")
    try:
        # configure_mappers() compiles all mapper mappings and raises if there are errors (e.g. invalid relationships, missing back_populates, typos, etc.)
        configure_mappers()
        print("Success: All SQLAlchemy mappings and relationships are configured correctly!")
        
        # Print table count
        tables = Base.metadata.tables.keys()
        print(f"Total tables discovered in metadata: {len(tables)}")
        print("Tables:")
        for table in sorted(tables):
            print(f" - {table}")
            
    except Exception as e:
        print("Error configuring SQLAlchemy mappers:", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    test_models()
