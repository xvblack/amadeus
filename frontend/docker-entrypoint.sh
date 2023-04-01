#!/bin/bash

# Define the possible commands
COMMANDS=("server" "migrate-db" "recreate-index")

# Check if the command is valid
if [[ ! " ${COMMANDS[@]} " =~ " $1 " ]]; then
  echo "Invalid command. Valid commands are: ${COMMANDS[@]}"
  exit 1
fi

# Execute the appropriate command
case $1 in
  "server")
    shift
    exec node server.js "$@"
    ;;
  "migrate-db")
    exec npx prisma migrate deploy
    ;;
  "recreate-index")
    exec node scripts/recreate-index.ts
    ;;
esac