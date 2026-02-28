# CortexFS CLI

```
        ██████╗ ██████╗ ██████╗ ████████╗███████╗██╗  ██╗
       ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝╚██╗██╔╝
       ██║     ██║   ██║██████╔╝   ██║   █████╗   ╚███╔╝
       ██║     ██║   ██║██╔══██╗   ██║   ██╔══╝   ██╔██╗
       ╚██████╗╚██████╔╝██║  ██║   ██║   ███████╗██╔╝ ██╗
        ╚═════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝

                   Cognitive Memory System
```

CLI para gestionar memoria cognitiva persistente organizada por contextos y categorías.

## Requisitos

- [Bun](https://bun.sh/) v1.0+

## Instalación

```bash
# Clonar e instalar dependencias
cd cortexFS_CLI
bun install

# Compilar binario
bun run build:bin

# Instalar globalmente (requiere permisos)
bun run install:bin
```

Después de la instalación, el comando `cortex` estará disponible globalmente.

## Configuración Inicial

Antes de usar el CLI, configura el directorio raíz donde se almacenará la memoria:

```bash
cortex config ~/mi-cerebro
```

Este comando crea la estructura base en el path especificado.

## Comandos

### `cortex`

Ejecutar sin argumentos muestra el logo ASCII del sistema.

```bash
cortex
```

### `cortex config <path>`

Configura el directorio raíz del cerebro.

```bash
cortex config /path/to/brain
```

La configuración se guarda en `~/.cortex/config.json`.

---

### Gestión de Conocimiento

#### `cortex save <category> <id> <content>`

Guarda una nueva entrada de conocimiento.

```bash
cortex save decisiones auth-strategy "Usar JWT para autenticación stateless"
cortex save bugs issue-123 "Memory leak en el componente UserList"
cortex save notas arquitectura "Microservicios con event sourcing"
```

#### `cortex read <category> <id>`

Lee una entrada específica.

```bash
cortex read decisiones auth-strategy
```

Salida:
```json
{
  "content": "Usar JWT para autenticación stateless",
  "createdAt": "2026-02-28T10:30:00.000Z"
}
```

#### `cortex update <category> <id> <content>`

Actualiza una entrada existente.

```bash
cortex update decisiones auth-strategy "Migrar a OAuth2 con refresh tokens"
```

#### `cortex delete <category> <id>`

Elimina una entrada.

```bash
cortex delete bugs issue-123
```

---

### Búsqueda y Listado

#### `cortex list [category]`

Lista categorías o entradas dentro de una categoría.

```bash
# Listar todas las categorías
cortex list

# Listar entradas en una categoría
cortex list decisiones
```

#### `cortex search <query>`

Busca en todo el contenido del contexto actual (case-insensitive).

```bash
cortex search "JWT"
cortex search "memory leak"
```

---

### Gestión de Sesiones

#### `cortex save-state <summary>`

Guarda el estado actual de una sesión de trabajo.

```bash
cortex save-state "Implementando módulo de autenticación, falta testing"
```

#### `cortex load-state`

Carga el estado más reciente de la sesión.

```bash
cortex load-state
```

## Contextos

El CLI usa el nombre del directorio actual como **contexto**. Esto permite tener memorias separadas por proyecto:

```
~/projects/app-web/     → contexto: "app-web"
~/projects/api-backend/ → contexto: "api-backend"
```

Cada contexto tiene su propia estructura de categorías y sesiones.

## Estructura de Archivos

```
~/.cortex/
└── config.json                 # Configuración global

<brain-root>/
└── contexts/
    └── <context-name>/
        ├── decisiones/
        │   ├── auth-strategy.json
        │   └── database.json
        ├── bugs/
        │   └── issue-123.json
        ├── notas/
        │   └── arquitectura.json
        └── sessions/
            ├── state-1709123456789.json
            └── state-1709127890123.json
```

## Desarrollo

```bash
# Ejecutar en modo desarrollo
bun run dev

# Compilar a JavaScript
bun run build

# Compilar binario ejecutable
bun run build:bin

# Limpiar archivos compilados
bun run clean
```

## Dependencias

- **commander** - Framework para CLI

## Licencia

MIT
