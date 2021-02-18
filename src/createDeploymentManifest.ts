const createDeploymentManifest = (latestLog: string) => {
  return {
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
  }
}

export default createDeploymentManifest
