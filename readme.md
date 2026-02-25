# Production-Ready GitOps Infrastructure

[![Kubernetes](https://img.shields.io/badge/kubernetes-%23326ce5.svg?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-ef7b4d?style=for-the-badge&logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh/)
[![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=Prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/grafana-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white)](https://grafana.com/)

A comprehensive, production-grade Kubernetes infrastructure demonstrating a complete **GitOps workflow**. This repository serves as the single source of truth for deploying a highly available Go-based REST API with Redis caching, utilizing modern DevOps practices.

## Architecture Overview

The system is strictly separated into two repositories following GitOps best practices:

1. **[App Repository](https://github.com/ZoFirsT/k8s-gitops-app):** Contains application source code (Go) and CI pipeline.
2. **Infra Repository (This Repo):** Contains Helm charts, ArgoCD applications, and cluster configurations.

```mermaid
graph TD
    %% Define Nodes
    Dev([Developer])
    AppRepo[fa:fa-code App Repository<br/>(Go, Dockerfile)]
    CI[fa:fa-cogs GitHub Actions<br/>CI Pipeline]
    Registry[(fa:fa-database GHCR<br/>Container Registry)]
    InfraRepo[fa:fa-file-code Infra Repository<br/>(Helm, Manifests)]
    ArgoCD[fa:fa-sync ArgoCD<br/>GitOps Controller]
    K8s((fa:fa-server Kubernetes Cluster))
    
    %% Define Flow
    Dev -->|1. Push Code| AppRepo
    AppRepo -->|2. Trigger| CI
    CI -->|3. Build & Push Image| Registry
    CI -->|4. Update Image Tag| InfraRepo
    ArgoCD -->|5. Watch for Changes| InfraRepo
    ArgoCD -->|6. Sync State| K8s
    K8s -->|7. Pull Image| Registry
    
    classDef default fill:#2D3748,stroke:#4A5568,stroke-width:2px,color:#fff;
    classDef repo fill:#2B6CB0,stroke:#2C5282,color:#fff;
    classDef cluster fill:#276749,stroke:#22543D,color:#fff;
    class AppRepo,InfraRepo repo;
    class K8s cluster;
```

## Key Capabilities

| Feature | Description |
|---------|-------------|
| **GitOps CD** | Declarative continuous deployment using ArgoCD |
| **Automated CI** | Multi-architecture (amd64/arm64) image builds via GitHub Actions |
| **Auto-scaling** | Configured Horizontal Pod Autoscaler (HPA) based on CPU utilization |
| **Observability** | Complete monitoring stack with kube-prometheus-stack (Prometheus & Grafana) |
| **Ingress Controller** | Traffic routing handled by NGINX Ingress |
| **Resilience** | Health checks (Liveness/Readiness probes) and graceful shutdowns configured |

## Repository Structure

```
.
├── apps/                   # ArgoCD Application manifests
├── bootstrap/              # Initial cluster setup scripts
├── charts/                 # Custom Helm charts
│   ├── api-service/        # Main Go API deployment chart
│   └── redis/              # Redis caching deployment chart
├── environments/           # Environment-specific values (Staging/Prod)
└── scripts/                # Utility scripts (e.g., k6 load testing)
```

## Local Setup & Runbook

### 1. Prerequisites

Ensure the following tools are installed on your local machine:

- `docker`
- `k3d`
- `kubectl`
- `helm`
- `argocd`
- `k6`

### 2. Provision the Cluster

Spin up a local Kubernetes cluster using k3d (1 Control Plane, 2 Worker Nodes):

```bash
k3d cluster create --config k3d-config.yaml
```

### 3. Initialize Core Infrastructure

Install the NGINX Ingress Controller:

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 4. Deploy GitOps Controller (ArgoCD)

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ArgoCD to be ready
kubectl wait --namespace argocd --for=condition=ready pod -l app.kubernetes.io/name=argocd-server --timeout=300s
```

### 5. Apply Applications

Kick off the GitOps sync process by applying the ArgoCD manifests:

```bash
kubectl apply -f apps/redis.yaml
kubectl apply -f apps/api-service.yaml
```

## Observability & Load Testing

### Monitoring Dashboard

We use `kube-prometheus-stack` for monitoring. To access Grafana:

```bash
kubectl port-forward svc/prom-stack-grafana -n monitoring 3000:80
```

Browse to **http://localhost:3000** (Default credentials: `admin` / `admin`).

### HPA Auto-scaling Test

To simulate high traffic and trigger the Horizontal Pod Autoscaler, run the included k6 load test:

```bash
cd scripts
k6 run load-test.js
```

Monitor the scaling events in real-time:

```bash
kubectl get hpa -n gitops-demo -w
```

---

*Architected and maintained by **ZoFirsT***
