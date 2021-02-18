export interface SecretManifest {
  apiVersion: string
  kind: string
  metadata: {
    name: string
  }
  type: string
  data: Record<string, string>
}

const createSecretManifest = (
  secretName: string,
  secrets: { computed: string }
): SecretManifest => {
  Object.keys(secrets).map((key) => {
    secrets[key] = Buffer.from(secrets[key].computed).toString('base64')
  })

  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: secretName
    },
    type: 'Opaque',
    data: secrets
  }
}

export default createSecretManifest
