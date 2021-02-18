import axios from 'axios'
const { Client } = require('kubernetes-client')

const _createSecretManifest = (data) => {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name: 'testing-secret'
    },
    type: 'Opaque',
    data
  }
}

setInterval(async () => {
  console.log('Polling from Doppler')

  const logs = await axios({
    url: 'https://api.doppler.com/v3/configs/config/logs',
    headers: {
      'api-key': 'dp.st.dev.p83nlqya6H6917AWjdM7CREz0HJjI7bdsZxh6Njs'
    }
  })

  const latestLog = logs.data.logs[0].created_at

  const { data } = await axios({
    url: 'https://api.doppler.com/v3/configs/config/secrets',
    headers: {
      'api-key': 'dp.st.dev.p83nlqya6H6917AWjdM7CREz0HJjI7bdsZxh6Njs'
    }
  })

  data.secrets['LATEST_ENV_UPDATE'] = {
    computed: latestLog
  }

  const client = new Client({ version: '1.13' })

  const previousData = await client.api.v1
    .namespaces('default')
    .secrets('testing-secret')
    .get()

  if (
    Buffer.from(latestLog).toString('base64') !==
    previousData?.body?.data?.LATEST_ENV_UPDATE
  ) {
    Object.keys(data.secrets).map(function (key) {
      data.secrets[key] = Buffer.from(data.secrets[key].computed).toString(
        'base64'
      )
    })

    console.log('Updating Kube')

    const secretManifest = _createSecretManifest(data.secrets)

    try {
      await client.api.v1
        .namespaces('default')
        .secrets.post({ body: secretManifest })
    } catch (e) {
      await client.api.v1
        .namespaces('default')
        .secrets('testing-secret')
        .put({ body: secretManifest })
    }
    await client.apis.apps.v1
      .namespaces('default')
      .deployments('alpine')
      .patch({
        body: {
          metadata: {
            annotations: {
              LATEST_ENV_UPDATE: latestLog
            }
          },
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubrnetes.io/restartedAt': latestLog,
                  'LATEST_ENV_UPDATE': latestLog
                }
              }
            }
          }
        }
      })
    console.log('Kube Updated')
  } else {
    console.log('No need to update')
  }
}, 15000)
