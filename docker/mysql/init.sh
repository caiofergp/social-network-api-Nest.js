#!/bin/bash
set -e

URL_TO_PARSE="${DATABASE_URL_TEST:-$DATABASE_URL}"

if [ -n "$URL_TO_PARSE" ]; then
    DB_NAME=$(echo $URL_TO_PARSE | sed -E 's/.*\/([^?]+).*/\1/')
    
    if [ -n "$DB_NAME" ] && [ "$DB_NAME" != "$MYSQL_DATABASE" ]; then
        echo "Creating database '$DB_NAME' extracted from environment..."
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
            CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;
EOSQL
    fi
else
    echo "No test database URL found. Skipping secondary database creation."
fi

