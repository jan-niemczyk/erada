#!/bin/bash
set -e

mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  GRANT ALL PRIVILEGES ON \`session\`.* TO '$MYSQL_USER'@'%';
  FLUSH PRIVILEGES;
EOSQL
