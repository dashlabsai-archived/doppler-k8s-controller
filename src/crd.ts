export default {
  apiVersion: 'apiextensions.k8s.io/v1',
  kind: 'CustomResourceDefinition',
  metadata: {
    name: 'dopplersecrets.k8s.dashlabs.ai'
  },
  spec: {
    group: 'k8s.dashlabs.ai',
    versions: [
      {
        name: 'v1',
        served: true,
        storage: true,
        schema: {
          openAPIV3Schema: {
            type: 'object',
            properties: {
              spec: {
                type: 'object',
                properties: {
                  dopplerAPIKey: {
                    type: 'string'
                  },
                  secretName: {
                    type: 'string'
                  },
                  updateDeployments: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    ],
    scope: 'Namespaced',
    names: {
      shortNames: ['ds'],
      kind: 'DopplerSecret',
      plural: 'dopplersecrets'
    }
  }
}
