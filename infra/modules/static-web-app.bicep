param location string
param tags object
param name string
param backendUrl string

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: name
  location: location
  tags: union(tags, { 'azd-service-name': 'frontend' })
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      appLocation: 'src/frontend'
      outputLocation: 'dist'
      appBuildCommand: 'npm run build'
    }
  }
}

resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_API_URL: backendUrl
    VITE_WS_URL: replace(backendUrl, 'https://', 'wss://')
  }
}

output id string = staticWebApp.id
output name string = staticWebApp.name
output url string = 'https://${staticWebApp.properties.defaultHostname}'
output deploymentToken string = staticWebApp.listSecrets().properties.apiKey
