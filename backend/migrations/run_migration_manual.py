#!/usr/bin/env python3
"""
Manual migration executor for tipo_usuario column removal
Use this script to manually execute the migration locally or for testing
"""

import os
import sys
import logging
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    """Execute migration manually"""
    logger.info("=" * 60)
    logger.info("🔧 MANUAL MIGRATION EXECUTOR")
    logger.info("=" * 60)
    
    # Check DATABASE_URL
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        logger.error("❌ DATABASE_URL environment variable not set")
        logger.info("💡 Set DATABASE_URL and try again:")
        logger.info("   export DATABASE_URL='postgresql://user:pass@host:port/dbname'")
        sys.exit(1)
    
    # Execute the migration
    try:
        from remove_tipo_usuario_column import TipoUsuarioColumnRemoval
        
        migration = TipoUsuarioColumnRemoval()
        success = migration.execute_migration()
        
        if success:
            logger.info("🎉 Migration executed successfully!")
            
            # Run validation
            logger.info("🔍 Running validation...")
            from validate_migration import MigrationValidator
            
            validator = MigrationValidator()
            validation_success = validator.run_validation()
            
            if validation_success:
                logger.info("✅ Migration and validation completed successfully!")
                sys.exit(0)
            else:
                logger.error("❌ Migration completed but validation failed!")
                sys.exit(1)
        else:
            logger.error("❌ Migration failed!")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
