targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment (e.g., dev, staging, prod)')
param environmentName string

@description('Primary location for all resources (must support gpt-realtime and gpt-mini-tts models for Azure OpenAI, e.g., eastus2)')
param location string

param containerRegistryName string = ''
param logAnalyticsName string = ''
param applicationInsightsName string = ''

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

// Frontend URL (set after first deployment or use existing value)
param frontendUrl string = ''

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = {
  'azd-env-name': environmentName
  application: 'german-tutor'
}

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module monitoring './modules/monitoring.bicep' = {
  name: 'monitoring'
  scope: rg
  params: {
    location: location
    tags: tags
    logAnalyticsName: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    applicationInsightsName: !empty(applicationInsightsName) ? applicationInsightsName : '${abbrs.insightsComponents}${resourceToken}'
  }
}

module backendIdentity './modules/identity.bicep' = {
  name: 'backend-identity'
  scope: rg
  params: {
    location: location
    tags: tags
    name: 'id-backend-${resourceToken}'
  }
}

module openai './modules/openai.bicep' = {
  name: 'openai'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.cognitiveServicesAccounts}${resourceToken}'
  }
}

module containerApps './modules/container-apps.bicep' = {
  name: 'container-apps'
  scope: rg
  params: {
    location: location
    tags: tags
    environmentName: '${abbrs.appManagedEnvironments}${resourceToken}'
    containerRegistryName: !empty(containerRegistryName) ? containerRegistryName : '${abbrs.containerRegistryRegistries}${resourceToken}'
    logAnalyticsWorkspaceId: monitoring.outputs.logAnalyticsWorkspaceId
    applicationInsightsConnectionString: monitoring.outputs.applicationInsightsConnectionString
    openAiEndpoint: openai.outputs.endpoint
    openAiResourceId: openai.outputs.id
    realtimeDeploymentName: openai.outputs.realtimeDeploymentName
    ttsDeploymentName: openai.outputs.ttsDeploymentName
    cosmosDbEndpoint: cosmosdb.outputs.endpoint
    cosmosDbDatabase: cosmosdb.outputs.databaseName
    cosmosDbConversationsContainer: cosmosdb.outputs.conversationsContainerName
    cosmosDbScenariosContainer: cosmosdb.outputs.scenariosContainerName
    backendIdentityId: backendIdentity.outputs.id
    backendIdentityClientId: backendIdentity.outputs.clientId
    backendIdentityPrincipalId: backendIdentity.outputs.principalId
    frontendUrl: !empty(frontendUrl) ? frontendUrl : 'https://placeholder.azurestaticapps.net'
    googleClientId: googleClientId
    googleClientSecret: googleClientSecret
    githubClientId: githubClientId
    githubClientSecret: githubClientSecret
    jwtSecretKey: jwtSecretKey
    jwtAlgorithm: jwtAlgorithm
    jwtAccessTokenExpireMinutes: jwtAccessTokenExpireMinutes
    jwtRefreshTokenExpireDays: jwtRefreshTokenExpireDays
    smtpHost: smtpHost
    smtpPort: smtpPort
    smtpUser: smtpUser
    smtpPassword: smtpPassword
    smtpFromEmail: smtpFromEmail
    smtpFromName: smtpFromName
    smtpUseTls: smtpUseTls
    verificationTokenExpireHours: verificationTokenExpireHours
    passwordResetTokenExpireHours: passwordResetTokenExpireHours
  }
}

module cosmosdb './modules/cosmosdb.bicep' = {
  name: 'cosmosdb'
  scope: rg
  params: {
    location: location
    tags: tags
    name: 'cosmos-${resourceToken}'
    backendIdentityPrincipalId: backendIdentity.outputs.principalId
    backendIdentityName: backendIdentity.outputs.name
  }
}

module staticWebApp './modules/static-web-app.bicep' = {
  name: 'static-web-app'
  scope: rg
  params: {
    location: location
    tags: tags
    name: '${abbrs.webStaticSites}${resourceToken}'
    backendUrl: containerApps.outputs.backendUrl
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name

output AZURE_OPENAI_ENDPOINT string = openai.outputs.endpoint
output AZURE_OPENAI_REALTIME_DEPLOYMENT string = openai.outputs.realtimeDeploymentName
output AZURE_OPENAI_TTS_DEPLOYMENT string = openai.outputs.ttsDeploymentName

output AZURE_CONTAINER_REGISTRY_ENDPOINT string = containerApps.outputs.containerRegistryEndpoint
output AZURE_CONTAINER_REGISTRY_NAME string = containerApps.outputs.containerRegistryName
output AZURE_CONTAINER_APPS_ENVIRONMENT_NAME string = containerApps.outputs.environmentName
output BACKEND_URL string = containerApps.outputs.backendUrl

output FRONTEND_URL string = staticWebApp.outputs.url

output COSMOSDB_ENDPOINT string = cosmosdb.outputs.endpoint
output COSMOSDB_DATABASE string = cosmosdb.outputs.databaseName
output COSMOSDB_CONVERSATIONS_CONTAINER string = cosmosdb.outputs.conversationsContainerName
output COSMOSDB_SCENARIOS_CONTAINER string = cosmosdb.outputs.scenariosContainerName
