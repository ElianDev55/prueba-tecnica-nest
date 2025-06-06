# Prueba Técnica NestJS

Este repositorio contiene una API RESTful desarrollada con NestJS como parte de una prueba técnica. La aplicación maneja entidades como usuarios, empresas, departamentos, ciudades y productos, implementando relaciones entre ellas usando TypeORM.

## Estructura del Proyecto

El proyecto implementa una arquitectura modular siguiendo las mejores prácticas de NestJS:

- **Módulos**: Cada entidad tiene su propio módulo (users, companies, departments, cities, products).
- **Controladores**: Manejan las solicitudes HTTP y delegan la lógica de negocio a los servicios.
- **Servicios**: Contienen la lógica de negocio y se comunican con los repositorios.
- **Entidades**: Definen el esquema de la base de datos usando decoradores de TypeORM.
- **DTOs**: Definen la estructura de los datos para las operaciones de entrada/salida.

## Tecnologías Utilizadas

- **NestJS**: Framework para construir aplicaciones del lado del servidor.
- **TypeORM**: ORM para TypeScript y JavaScript.
- **PostgreSQL**: Base de datos relacional.
- **Docker**: Contenedorización de la aplicación y sus dependencias.
- **bcrypt**: Librería para hash de contraseñas.

## Requisitos

- Node.js (v14 o superior)
- npm o yarn
- Docker y Docker Compose
- PostgreSQL

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/ElianDev55/prueba-tecnica-nest.git
cd prueba-tecnica-nest
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno (crear archivo `.env` en la raíz del proyecto):

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=nestjs_db
```

## Ejecución con Docker

El proyecto incluye un Dockerfile multietapa que optimiza el proceso de construcción y despliegue:

- **Etapa dev**: Para desarrollo
- **Etapa dev-deps**: Instalación de dependencias para desarrollo
- **Etapa builder**: Compilación del proyecto
- **Etapa prod-deps**: Instalación de dependencias para producción
- **Etapa prod**: Configuración final para producción

### Iniciar la aplicación con Docker Compose

```bash
docker-compose up -d
```

Esto levantará la aplicación y la base de datos PostgreSQL en contenedores separados.

### Iniciar la aplicación sólo con Docker

```bash
# Para desarrollo
docker build --target dev -t prueba-tecnica-nest:dev .
docker run -p 3000:3000 -v $(pwd):/app prueba-tecnica-nest:dev

# Para producción
docker build --target prod -t prueba-tecnica-nest:prod .
docker run -p 3000:3000 prueba-tecnica-nest:prod
```

## Autenticación

### Registro de Usuario

```
POST /auth/register
```

Ejemplo JSON para registro:

```json
{
  "nombre": "Carlos Rodríguez",
  "email": "carlos.rodriguez@ejemplo.com",
  "password": "clave123456"
}
```

### Inicio de Sesión

```
POST /auth/login
```

Ejemplo JSON para login:

```json
{
  "email": "carlos.rodriguez@ejemplo.com",
  "password": "clave123456"
}
```

## Endpoints de la API

La API expone endpoints para gestionar todas las entidades. A continuación se muestran ejemplos de formato JSON para cada una:

### Usuarios

```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@ejemplo.com",
  "password": "contraseña123",
  "company": {
    "id": 1
  }
}
```

### Productos

```json
{
  "nombre": "Laptop HP Pavilion",
  "descripcion": "Laptop con procesador i5, 8GB RAM, 512GB SSD, pantalla de 15.6 pulgadas",
  "precio": 799.99,
  "company": {
    "id": 1
  }
}
```

### Departamentos

```json
{
  "nombre": "Cundinamarca"
}
```

### Empresas

```json
{
  "nombre": "TechSolutions SAS",
  "direccion": "Calle 123 #45-67, Zona Industrial",
  "city": {
    "id": 1
  },
  "department": {
    "id": 1
  }
}
```

### Ciudades

```json
{
  "nombre": "Bogotá",
  "department": {
    "id": 1
  }
}
```

## Flujo para crear datos relacionados

Para trabajar con las relaciones entre entidades, se recomienda seguir este orden:

1. Crear un departamento:

```json
{
  "nombre": "Antioquia"
}
```

2. Crear una ciudad en ese departamento:

```json
{
  "nombre": "Medellín",
  "department": {
    "id": 2
  }
}
```

3. Crear una empresa en esa ciudad:

```json
{
  "nombre": "MedTech Innovations",
  "direccion": "Carrera 70 #10-15, El Poblado",
  "city": {
    "id": 2
  },
  "department": {
    "id": 2
  }
}
```

4. Crear un usuario para esa empresa:

```json
{
  "nombre": "Ana Gómez",
  "email": "ana.gomez@medtech.com",
  "password": "seguro456",
  "company": {
    "id": 2
  }
}
```

5. Crear un producto para esa empresa:

```json
{
  "nombre": "Kit Médico Portátil",
  "descripcion": "Kit de primeros auxilios con instrumental básico para atención médica de emergencia",
  "precio": 149.99,
  "company": {
    "id": 2
  }
}
```

## Nota sobre el despliegue

Aunque el proyecto incluye configuración para Docker, el despliegue en Digital Ocean no se pudo completar debido a la falta de créditos disponibles en la plataforma. Para un despliegue local, utilizar Docker Compose como se indicó anteriormente.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, crear un fork del repositorio y enviar un pull request con las mejoras propuestas.
