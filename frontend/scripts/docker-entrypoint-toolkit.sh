#!/bin/bash

# Define the possible commands
COMMANDS=("migrate-db" "recreate-index")

# Check if the command is valid
if [[ ! " ${COMMANDS[@]} " =~ " $1 " ]]; then
  echo "Invalid command. Valid commands are: ${COMMANDS[@]}"
  exit 1
fi

# Execute the appropriate command
case $1 in
  "migrate-db")
    echo "Migrating"
    exec npx prisma migrate deploy
    ;;
  "recreate-index")
    exec node scripts/recreate-index.js
    ;;
esac