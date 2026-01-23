param location string
param tags object
param name string

resource openAiAccount 'Microsoft.CognitiveServices/accounts@2024-06-01-preview' = {
  name: name
  location: location
  tags: tags
  kind: 'OpenAI'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: toLower(name)
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      defaultAction: 'Allow'
    }
  }
}

resource realtimeDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-06-01-preview' = {
  parent: openAiAccount
  name: 'gpt-realtime'
  sku: {
    name: 'GlobalStandard'
    capacity: 5
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-realtime'
      version: '2025-08-28'
    }
  }
}

resource ttsDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-06-01-preview' = {
  parent: openAiAccount
  name: 'gpt-4o-mini-tts'
  sku: {
    name: 'GlobalStandard'
    capacity: 5
  }
  properties: {
    model: {
      format: 'OpenAI'
      name: 'gpt-4o-mini-tts'
      version: '2025-03-20'
    }
  }
  dependsOn: [
    realtimeDeployment
  ]
}

output id string = openAiAccount.id
output name string = openAiAccount.name
output endpoint string = openAiAccount.properties.endpoint
output realtimeDeploymentName string = realtimeDeployment.name
output ttsDeploymentName string = ttsDeployment.name
