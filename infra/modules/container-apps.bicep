param location string
param tags object
param environmentName string
param containerRegistryName string
param logAnalyticsWorkspaceId string
param applicationInsightsConnectionString string
param openAiEndpoint string
param openAiResourceId string
param realtimeDeploymentName string
param ttsDeploymentName string
param cosmosDbEndpoint string = ''
param cosmosDbDatabase string = ''
param cosmosDbConversationsContainer string = ''
param backendIdentityId string
param backendIdentityClientId string
param backendIdentityPrincipalId string

resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-11-01-preview' = {
  name: replace(containerRegistryName, '-', '')
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: environmentName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: reference(logAnalyticsWorkspaceId, '2023-09-01').customerId
        sharedKey: listKeys(logAnalyticsWorkspaceId, '2023-09-01').primarySharedKey
      }
    }
  }
}

resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'ca-backend'
  location: location
  tags: union(tags, { 'azd-service-name': 'backend' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${backendIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'http'
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
        }
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              value: openAiEndpoint
            }
            {
              name: 'AZURE_OPENAI_REALTIME_DEPLOYMENT'
              value: realtimeDeploymentName
            }
            {
              name: 'AZURE_OPENAI_TTS_DEPLOYMENT'
              value: ttsDeploymentName
            }
            {
              name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
              value: applicationInsightsConnectionString
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: backendIdentityClientId
            }
            {
              name: 'CORS_ORIGINS'
              value: '*'
            }
            {
              name: 'COSMOSDB_ENDPOINT'
              value: cosmosDbEndpoint
            }
            {
              name: 'COSMOSDB_DATABASE'
              value: cosmosDbDatabase
            }
            {
              name: 'COSMOSDB_CONVERSATIONS_CONTAINER'
              value: cosmosDbConversationsContainer
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 5
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2024-06-01-preview' existing = {
  name: last(split(openAiResourceId, '/'))
}

resource openAiRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(openAiResourceId, backendIdentityId, 'Cognitive Services OpenAI User')
  scope: openAiAccount
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '5e0bd9bd-7b93-4f28-af87-19fc36ad61bd')
    principalId: backendIdentityPrincipalId
    principalType: 'ServicePrincipal'
  }
}

output environmentName string = containerAppsEnvironment.name
output environmentId string = containerAppsEnvironment.id
output containerRegistryEndpoint string = containerRegistry.properties.loginServer
output containerRegistryName string = containerRegistry.name
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
