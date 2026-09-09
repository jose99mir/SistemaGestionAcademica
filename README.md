# Sistema de Gestión Académica

Sistema web para la gestión académica y atención al ciudadano de una institución educativa.

La plataforma centraliza diferentes procesos institucionales y permite a estudiantes, docentes y administradores acceder a funcionalidades específicas de acuerdo con su rol.

## Descripción

El Portal Académico está diseñado bajo una arquitectura de **microservicios**, utilizando el patrón **MVC (Model-View-Controller)** para organizar la lógica interna de los componentes que conforman el sistema.

La arquitectura de microservicios permite separar las principales funcionalidades en componentes independientes, mientras que el patrón MVC facilita la organización y mantenimiento de la lógica de cada componente.

Entre sus principales funcionalidades se encuentran:

- Autenticación y gestión de usuarios.
- Gestión de roles.
- Gestión académica.
- Gestión de asignaturas y matrículas.
- Administración de calificaciones.
- Gestión de cortes académicos.
- Gestión de solicitudes PQRS.

## Roles

### Estudiante

Permite:

- Consultar asignaturas y matrículas.
- Consultar calificaciones.
- Consultar notas por corte.
- Consultar información académica.
- Registrar solicitudes PQRS.
- Consultar y realizar seguimiento a sus solicitudes.

### Docente

Permite:

- Consultar grupos y asignaturas.
- Consultar estudiantes.
- Registrar calificaciones.
- Modificar calificaciones.
- Gestionar notas por corte.

### Administrador

Permite:

- Gestionar usuarios.
- Gestionar roles.
- Administrar materias.
- Gestionar información académica.
- Administrar la configuración general del sistema.

## Arquitectura

El proyecto utiliza una arquitectura basada en **microservicios** y el patrón de diseño **MVC (Model-View-Controller)**.

### Microservicios

La arquitectura de microservicios permite dividir el sistema en diferentes componentes independientes, cada uno orientado a una responsabilidad específica.

Esta separación facilita:

- La organización del sistema.
- El mantenimiento del código.
- La escalabilidad.
- La evolución independiente de las funcionalidades.
- La separación de responsabilidades.

### Patrón MVC

Dentro de los componentes del sistema se utiliza el patrón **MVC** para organizar la lógica de aplicación.

- **Model:** representa los datos y la interacción con la información almacenada.
- **View:** representa la interfaz y presentación de la información.
- **Controller:** gestiona las solicitudes y coordina la lógica entre los modelos y las vistas.

La combinación de **microservicios + MVC** permite mantener una arquitectura modular, organizada y fácil de mantener.

## Tecnologías

| Área | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Arquitectura Frontend | SPA |
| Backend | Node.js, Express |
| Arquitectura Backend | Microservicios |
| Patrón de diseño | MVC |
| Autenticación | JWT |
| Comunicación | API REST |
| Base de datos | MySQL |
| Contenedorización | Docker |
| Control de versiones | Git |

## Módulos

### Autenticación y Usuarios

Responsable de la autenticación de los usuarios, gestión de roles y control de acceso a las funcionalidades de la plataforma.

### Gestión Académica

Permite administrar y consultar información relacionada con materias, asignaturas, matrículas, grupos, estudiantes y calificaciones.

### Calificaciones

Permite registrar, modificar y consultar notas organizadas de acuerdo con los diferentes cortes académicos.

### PQRS

Permite registrar y realizar seguimiento a:

- Peticiones.
- Quejas.
- Reclamos.
- Sugerencias.

##




