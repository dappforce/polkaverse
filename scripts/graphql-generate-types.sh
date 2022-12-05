#!/bin/sh

GRAPHQL_URL=$(echo $(grep -v '^#' .env | grep -e "GRAPHQL_URL" | sed -e 's/.*=//'))

if [[ "$GRAPHQL_URL" != "" ]]; then
  echo "Connect to GraphQL server: $GRAPHQL_URL"
  npx apollo codegen:generate --endpoint=$GRAPHQL_URL --target=typescript --tagName=gql --addTypename --globalTypesFile=src/types/graphql-global-types.ts
else
  echo "Failed to generate types: Variable GRAPHQL_URL not found in .env!"
fi
