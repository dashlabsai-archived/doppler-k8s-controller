# Doppler Kubernetes Controller

A custom Kubernetes Controller which polls Doppler's servers and updates environment variables automatically.

**⚠️ WARNING:** Still in development. Not yet ready for production use.

## Motivation

Doppler is a universal secrets manager which offers ease of use to our team in development. However, they don't have a native Kubernetes integration which automatically updates environment variables.

This tool aims to solve that issue and to allow secrets editing directly in Doppler.

## Local Development

Am currently developing using a local Kubernetes Cluster in Docker Desktop with Tilt (a pretty cool tool which updates Kube configs on the fly locally).
