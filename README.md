# Doppler Kubernetes Controller

A custom Kubernetes Controller which polls Doppler's servers and updates environment variables automatically.

## Motivation

Doppler is a universal secrets manager which offers ease of use to our team in development. However, they don't have a native Kubernetes integration which automatically updates environment variables.

This tool aims to solve that issue and to allow secrets editing directly in Doppler.

## Installing on a Kubernetes Cluster

After downloading this repo, edit the refresh rate as needed in `k8s/manifest.yml` and simply run:

```bash
kubectl apply -f ./k8s/manifest.yml
```

An example of a `DopplerSecret` deployment can be found at `k8s/example.yml`.

## Local Development

Assuming you have a local Kubernetes Cluster (I used Docker Desktop) and [Tilt](https://tilt.dev/), you can simply run this command:

```bash
tilt up
```
