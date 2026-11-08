# API de catálogo de productos

API REST para administrar el catálogo de una tienda en línea: categorías y productos, con paginación, filtros, búsqueda, validación de datos y tests automáticos.

**Stack:** Node.js, Express 5, MySQL 8, Docker, Zod, Jest y Supertest.

## Requisitos

- Node.js 20 o superior
- Docker Desktop

## Cómo correrlo

```bash
git clone https://github.com/StivenP6160/prueba1-catalogo.git
cd prueba1-catalogo
cp .env.example .env
docker compose up -d
npm install
npm run dev
```

La primera vez, MySQL tarda unos 15 segundos en arrancar. Docker crea las tablas y carga 3 categorías y 10 productos de ejemplo automáticamente.

Para comprobar que funciona: `GET http://localhost:3000/health` debe responder `{ "status": "ok", "database": "connected" }`.

Para reiniciar la base a los datos de ejemplo: `docker compose down -v && docker compose up -d`.

## Tests

```bash
npm test                # corre los 39 tests
npm run test:coverage   # tests + reporte de cobertura (96% de líneas)
```

Los tests usan una base aparte (`catalogo_test`) que se crea y se limpia sola, así que no tocan los datos de desarrollo.

## Endpoints

### Categorías

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/categories` | Lista todas las categorías |
| GET | `/api/categories/:id` | Detalle de una categoría |
| POST | `/api/categories` | Crea una categoría |
| PUT | `/api/categories/:id` | Cambia el nombre de una categoría |
| DELETE | `/api/categories/:id` | Borra una categoría (solo si no tiene productos) |

### Productos

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/products` | Lista productos con paginación, filtros y orden |
| GET | `/api/products/:id` | Detalle de un producto |
| POST | `/api/products` | Crea un producto |
| PATCH | `/api/products/:id` | Actualiza solo los campos enviados |
| DELETE | `/api/products/:id` | Borrado lógico del producto |

**Parámetros de `GET /api/products`:**

| Parámetro | Ejemplo | Descripción |
| --- | --- | --- |
| `page` | `2` | Página (por defecto 1) |
| `limit` | `20` | Productos por página (por defecto 10, máximo 100) |
| `category` | `3` | Filtra por id de categoría |
| `minPrice` / `maxPrice` | `50000` | Rango de precio |
| `search` | `camiseta` | Busca en el nombre, sin importar tildes ni mayúsculas |
| `sort` | `price_asc` | `newest`, `price_asc`, `price_desc` o `name_asc` |

**Ejemplo de petición:**

```
GET /api/products?category=1&sort=price_asc&limit=2
```

**Ejemplo de respuesta:**

```json
{
  "data": [
    { "id": 1, "sku": "CAM-001", "name": "Camiseta básica blanca", "price": 39900, "stock": 50, "category_name": "Camisetas" }
  ],
  "pagination": { "page": 1, "limit": 2, "total": 4, "totalPages": 2 }
}
```

**Ejemplo para crear un producto (`POST /api/products`):**

```json
{
  "sku": "cal-004",
  "name": "Medias deportivas",
  "description": "Pack x3",
  "price": 24900,
  "stock": 30,
  "category_id": 3
}
```

### Errores

Todos los errores responden con el mismo formato:

```json
{
  "error": {
    "message": "Datos inválidos",
    "details": [{ "field": "price", "message": "El precio debe ser mayor a 0" }]
  }
}
```

| Código | Cuándo |
| --- | --- |
| 400 | Datos inválidos, JSON mal escrito o parámetros incorrectos |
| 404 | El recurso o la ruta no existe |
| 409 | SKU o nombre de categoría repetido, o categoría con productos |
| 500 | Error interno (el detalle solo queda en el log del servidor) |

## Postman

En la carpeta `postman/` está la colección con todas las peticiones. Impórtala en Postman (**Import**), y la variable `baseUrl` ya viene configurada en `http://localhost:3000`.

## Estructura

```
src/
  routes/        URLs y qué controller atiende cada una
  controllers/   Leen la petición y arman la respuesta
  services/      Reglas de negocio
  repositories/  Consultas SQL
  schemas/       Validaciones con Zod
  middlewares/   Validación y manejo de errores
  utils/         AppError y validadores reutilizables
database/        Esquema y datos de ejemplo (Docker los carga al iniciar)
tests/           Tests con Jest y Supertest
```

## Decisiones

- **Capas separadas (routes, controllers, services, repositories):** cada archivo tiene una sola responsabilidad. Si mañana cambio MySQL por otra base, solo cambian los repositories.
- **Precios en `DECIMAL(10,2)`:** `FLOAT` guarda los números de forma aproximada, y eso no sirve para dinero.
- **Reglas también en la base de datos:** `UNIQUE` en el SKU, llave foránea hacia categorías y `CHECK` para que el precio y el stock no sean negativos. Así los datos quedan protegidos aunque el código tenga un error.
- **Seguridad contra inyección SQL:** todos los valores van con parámetros `?`. El orden (`sort`) usa una lista blanca porque no se puede parametrizar. Hay un test que lo comprueba.
- **Validación con Zod y `.strict()`:** rechaza los campos que no están permitidos (por ejemplo `is_active`) para evitar *mass assignment*.
- **Borrado lógico de productos:** en una tienda, un producto puede estar en órdenes antiguas, así que en vez de eliminarlo se marca como inactivo. La consecuencia es que su SKU no se puede reutilizar.
- **`PATCH` para productos:** permite actualizar un solo campo sin mandar el producto completo.
- **Test de regresión:** encontré un error en el que un `PATCH` ponía el stock en 0 porque Zod 4 aplica los valores por defecto aunque el campo sea opcional. Lo arreglé y agregué un test para que no vuelva a pasar.

## Qué mejoraría con más tiempo

- Autenticación con JWT para proteger la creación, edición y borrado.
- Documentación interactiva con Swagger.
- Imágenes de producto (tabla `product_images`).
- Logs estructurados con `pino`.
- Correr los tests automáticamente en cada push con GitHub Actions.