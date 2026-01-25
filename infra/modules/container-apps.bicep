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

// Frontend URL for OAuth redirects
param frontendUrl string

// OAuth Configuration
@secure()
param googleClientId string = ''
@secure()
param googleClientSecret string = ''
@secure()
param githubClientId string = ''
@secure()
param githubClientSecret string = ''

// JWT Configuration
@secure()
param jwtSecretKey string = ''
param jwtAlgorithm string = 'HS256'
param jwtAccessTokenExpireMinutes int = 60
param jwtRefreshTokenExpireDays int = 7

// SMTP Configuration
param smtpHost string = ''
param smtpPort int = 587
param smtpUser string = ''
@secure()
param smtpPassword string = ''
param smtpFromEmail string = ''
param smtpFromName string = 'German Tutor'
param smtpUseTls string = 'true'

// Token expiration
param verificationTokenExpireHours int = 24
param passwordResetTokenExpireHours int = 1

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
        {
          name: 'google-client-id'
          value: googleClientId
        }
        {
          name: 'google-client-secret'
          value: googleClientSecret
        }
        {
          name: 'github-client-id'
          value: githubClientId
        }
        {
          name: 'github-client-secret'
          value: githubClientSecret
        }
        {
          name: 'jwt-secret-key'
          value: jwtSecretKey
        }
        {
          name: 'smtp-password'
          value: smtpPassword
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
            {
              name: 'FRONTEND_URL'
              value: frontendUrl
            }
            {
              name: 'GOOGLE_CLIENT_ID'
              secretRef: 'google-client-id'
            }
            {
              name: 'GOOGLE_CLIENT_SECRET'
              secretRef: 'google-client-secret'
            }
            {
              name: 'GITHUB_CLIENT_ID'
              secretRef: 'github-client-id'
            }
            {
              name: 'GITHUB_CLIENT_SECRET'
              secretRef: 'github-client-secret'
            }
            {
              name: 'JWT_SECRET_KEY'
              secretRef: 'jwt-secret-key'
            }
            {
              name: 'JWT_ALGORITHM'
              value: jwtAlgorithm
            }
            {
              name: 'JWT_ACCESS_TOKEN_EXPIRE_MINUTES'
              value: string(jwtAccessTokenExpireMinutes)
            }
            {
              name: 'JWT_REFRESH_TOKEN_EXPIRE_DAYS'
              value: string(jwtRefreshTokenExpireDays)
            }
            {
              name: 'SMTP_HOST'
              value: smtpHost
            }
            {
              name: 'SMTP_PORT'
              value: string(smtpPort)
            }
            {
              name: 'SMTP_USER'
              value: smtpUser
            }
            {
              name: 'SMTP_PASSWORD'
              secretRef: 'smtp-password'
            }
            {
              name: 'SMTP_FROM_EMAIL'
              value: smtpFromEmail
            }
            {
              name: 'SMTP_FROM_NAME'
              value: smtpFromName
            }
            {
              name: 'SMTP_USE_TLS'
              value: smtpUseTls
            }
            {
              name: 'VERIFICATION_TOKEN_EXPIRE_HOURS'
              value: string(verificationTokenExpireHours)
            }
            {
              name: 'PASSWORD_RESET_TOKEN_EXPIRE_HOURS'
              value: string(passwordResetTokenExpireHours)
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
