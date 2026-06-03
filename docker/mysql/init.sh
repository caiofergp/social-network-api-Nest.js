#!/bin/bash
set -e

if [ -n "$DATABASE_URL_TEST" ]; then
    DB_NAME=$(echo $DATABASE_URL_TEST | sed -E 's/.*\/([^?]+).*/\1/')
    
    if [ -n "$DB_NAME" ]; then
        echo "Creating database '$DB_NAME' from DATABASE_URL_TEST..."
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
            CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
EOSQL
    fi
else
    echo "DATABASE_URL_TEST not defined. Skipping database creation."
fi
