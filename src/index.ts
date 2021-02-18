import axios from 'axios'
import { Client1_13 } from 'kubernetes-client'
import crd from './crd'
import createDeploymentManifest from './createDeploymentManifest'
import createSecretManifest from './createSecretManifest'

const client = new Client1_13({})

client.addCustomResourceDefinition(crd)

const uploadToKube = async (dopplerSecret, latestLog): Promise<void> => {
  const { data } = await axios({
    url: 'https://api.doppler.com/v3/configs/config/secrets',
    headers: {
      'api-key': dopplerSecret.spec.dopplerAPIKey
    }
  })

  data.secrets['LATEST_ENV_UPDATE'] = {
    computed: latestLog
  }

  const secretManifest = createSecretManifest(
    dopplerSecret.spec.secretName,
    data.secrets
  )

  try {
    await client.api.v1
      .namespaces(dopplerSecret.metadata.namespace)
      .secrets.post({ body: secretManifest })
  } catch (e) {
    await client.api.v1
      .namespaces(dopplerSecret.metadata.namespace)
      .secrets(dopplerSecret.spec.secretName)
      .put({ body: secretManifest })
  }
  dopplerSecret.spec.updateDeployments.forEach(
    async (deploymentName: string) => {
      await client.apis.apps.v1
        .namespaces(dopplerSecret.metadata.namespace)
        .deployments(deploymentName)
        .patch(createDeploymentManifest(latestLog))
      console.log(`(${latestLog}) [${deploymentName} - ${dopplerSecret.spec.secretName}] Secret Updated`)
    }
  )
}

setInterval(async () => {
  const namespaces = await client.api.v1.namespaces.get()

  namespaces.body.items.forEach(async (namespace) => {
    const dopplerSecrets = (await (
      await client.apis['k8s.dashlabs.ai'].v1
        .namespaces(namespace.metadata.name)
        .dopplersecrets.get()
    ).body.items.filter((x) => x.kind === 'DopplerSecret')) as any[]

    dopplerSecrets.forEach(async (dopplerSecret) => {
      const logs = await axios({
        url: 'https://api.doppler.com/v3/configs/config/logs',
        headers: {
          'api-key': dopplerSecret.spec.dopplerAPIKey
        }
      })

      const latestLog = logs.data.logs[0].created_at

      try {
        const previousData = await client.api.v1
        .namespaces(dopplerSecret.metadata.namespace)
        .secrets(dopplerSecret.spec.secretName)
          .get()

        if (
          Buffer.from(latestLog).toString('base64') !==
          previousData?.body?.data?.LATEST_ENV_UPDATE
        ) {
          await uploadToKube(dopplerSecret, latestLog)
        }
      } catch (e) {
        await uploadToKube(dopplerSecret, latestLog)
      }
    })
  })
}, Number(process.env.REFRESH_RATE))
