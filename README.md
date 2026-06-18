# VidalCasino 2.0 - Frontend

Este repositorio contiene el frontend del proyecto **VidalCasino 2.0**, desarrollado para la evaluación EP3 de Introducción a Herramientas DevOps. La aplicación corresponde a una plataforma web de casino integrada con un backend principal y microservicios desplegados en Amazon EKS.

## Descripción general

El frontend permite a los usuarios interactuar con el sistema VidalCasino mediante una interfaz web. Desde esta aplicación se puede iniciar sesión, visualizar el panel principal, revisar el historial de transacciones, reclamar bonos, realizar apuestas deportivas y consultar estadísticas.

La aplicación se encuentra desplegada en un clúster de Kubernetes en Amazon EKS y es el único componente expuesto públicamente mediante un Service de tipo `LoadBalancer`. Los demás servicios se mantienen internos mediante `ClusterIP`.

## Arquitectura del sistema

El sistema VidalCasino está compuesto por los siguientes servicios:

* **casino-frontend:** interfaz web del sistema, expuesta mediante LoadBalancer.
* **casino-backend:** backend principal del casino, expuesto internamente como ClusterIP.
* **bonos-service:** microservicio encargado de la gestión y reclamación de bonos.
* **apuestas-service:** microservicio encargado de apuestas deportivas.
* **estadisticas-service:** microservicio encargado de estadísticas de usuario y métricas globales.
* **postgres:** base de datos interna utilizada por los servicios.

## Tecnologías utilizadas

* Angular
* Docker
* Nginx
* Kubernetes
* Amazon EKS
* Amazon ECR
* GitHub Actions
* PostgreSQL
* AWS Academy Learner Lab

## Despliegue en Kubernetes

Los manifiestos de Kubernetes se encuentran en la carpeta:

```txt
k8s/
```

Archivos principales:

```txt
k8s/deployment.yaml
k8s/service.yaml
k8s/hpa.yaml
```

El frontend se despliega como un `Deployment` con 2 réplicas y se expone mediante un `Service` de tipo `LoadBalancer`.

También se configuró un `HorizontalPodAutoscaler` para escalar el frontend según uso de CPU.

## CI/CD

El despliegue automático se realiza mediante GitHub Actions. El archivo de workflow se encuentra en:

```txt
.github/workflows/deploy.yml
```

El pipeline se ejecuta al realizar un push sobre la rama `deploy`.

El flujo CI/CD realiza las siguientes acciones:

1. Descarga el código del repositorio.
2. Configura credenciales temporales de AWS Academy.
3. Inicia sesión en Amazon ECR.
4. Construye la imagen Docker del frontend.
5. Publica la imagen en Amazon ECR con tags `latest`, `v1.0.4` y el SHA del commit.
6. Conecta `kubectl` al clúster EKS.
7. Actualiza el Deployment en Kubernetes.
8. Verifica el rollout y muestra el estado final de los recursos.

## Evidencias principales

Para validar el despliegue se utilizan comandos como:

```powershell
kubectl get deployments
kubectl get svc
kubectl get hpa
kubectl get pods -o wide
kubectl describe deployment casino-frontend
```

## Estado esperado

El frontend debe quedar desplegado en EKS con:

* Deployment disponible.
* Service de tipo LoadBalancer.
* Imagen almacenada en Amazon ECR.
* Pipeline CI/CD exitoso en GitHub Actions.
* Pods en estado Running.
* HPA activo.