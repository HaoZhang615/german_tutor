param location string
param tags object
param name string
param databaseName string = 'GermanTutor'
param backendIdentityPrincipalId string
param backendIdentityName string

resource cosmosDbAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: name
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    publicNetworkAccess: 'Enabled'
  }
}

resource cosmosDbDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  name: databaseName
  parent: cosmosDbAccount
  properties: {
    resource: {
      id: databaseName
    }
  }
}

resource conversationsContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = {
  name: 'Conversations'
  parent: cosmosDbDatabase
  properties: {
    resource: {
      id: 'Conversations'
      partitionKey: {
        kind: 'Hash'
        paths: ['/session_id']
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        includedPaths: [
          { path: '/*' }
        ]
        excludedPaths: [
          { path: '/"_etag"/?' }
        ]
      }
    }
  }
}

resource backendIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: backendIdentityName
}

var cosmosDataContributor = '00000000-0000-0000-0000-000000000002'

resource sqlRoleAssignment 'Microsoft.DocumentDB/databaseAccounts/sqlRoleAssignments@2021-04-15' = {
  name: guid(cosmosDataContributor, backendIdentity.id, cosmosDbAccount.id)
  parent: cosmosDbAccount
  properties: {
    roleDefinitionId: resourceId('Microsoft.DocumentDB/databaseAccounts/sqlRoleDefinitions', name, cosmosDataContributor)
    principalId: backendIdentityPrincipalId
    scope: cosmosDbAccount.id
  }
}

output endpoint string = cosmosDbAccount.properties.documentEndpoint
output databaseName string = cosmosDbDatabase.name
output conversationsContainerName string = conversationsContainer.name
output accountId string = cosmosDbAccount.id
