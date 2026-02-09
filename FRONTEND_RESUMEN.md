# Frontend - Guía Rápida de Arquitectura

## Stack Tecnológico
- **Framework**: React 18
- **Lenguaje**: JavaScript ES6+
- **Estado Global**: Context API + Custom Hooks
- **Routing**: React Router v6
- **HTTP**: Axios
- **Visualización**: Recharts
- **Estilos**: CSS Modules
- **Build**: Vite

---

## Arquitectura

**Modelo:** Separación de Capas (Presentación, Lógica, Datos)

### Capas del Sistema

1. **Presentational Layer**
   - Componentes visuales (UI)
   - Reciben datos por props
   - Sin lógica de negocio

2. **Business Logic Layer**
   - Custom Hooks
   - Context (estado global)
   - Procesamiento de datos

3. **Data Access Layer**
   - Servicios API (Axios)
   - Comunicación con backend

---

## Estructura de Directorios

```
src/
├── main.jsx                     # Punto de entrada
├── App.jsx                      # Componente raíz
├── assets/                      # Imágenes, estilos globales
├── components/
│   ├── common/                  # Componentes reutilizables
│   ├── layout/                  # Header, Sidebar, Footer
│   └── charts/                  # Gráficos (Recharts)
├── pages/                       # Páginas/Vistas completas
├── hooks/                       # Custom Hooks
├── context/                     # Context API
├── services/                    # Llamadas a API
├── utils/                       # Formatters, validators, helpers
└── routes/                      # Configuración de rutas
```

---

## Patrones de Diseño

### 1. Componentes Presentacionales vs Contenedores

**Presentacionales (Dumb):**
- Solo muestran UI
- Reciben datos por props
- Sin estado ni efectos
- Altamente reutilizables

**Contenedores (Smart):**
- Manejan lógica y estado
- Llaman a APIs
- Usan hooks y effects
- Orquestan componentes presentacionales

**Por qué:** Separación de responsabilidades (SRP)

---

### 2. Custom Hooks

**Qué son:** Funciones que encapsulan lógica reutilizable.

**Ventajas:**
- Reutilización de lógica
- Componentes más limpios
- Testing más fácil
- Separación de concerns

**Convenciones:**
- Nombre empieza con `use`
- Pueden usar otros hooks
- Retornan datos y/o funciones

**Ejemplos de casos de uso:**
- `useDrivers`: Estado y fetch de pilotos
- `useFetch`: Fetch genérico
- `useDebounce`: Retrasar ejecución
- `useLocalStorage`: Sincronizar con localStorage

---

### 3. Composición de Componentes

**Concepto:** Combinar componentes pequeños para crear complejos.

**Ventajas:**
- Mayor reutilización
- Más fácil de testear
- Código más legible
- Mantenimiento aislado

**Principio:** Open/Closed - Extender sin modificar

---

## Gestión de Estado

### Context API

**Cuándo usar:**
- Datos necesarios en múltiples niveles
- Usuario autenticado
- Tema visual
- Configuración global

**Cuándo NO usar:**
- Estado local de un componente (usar `useState`)
- Datos que cambian muy frecuentemente
- Apps muy grandes (considerar Redux/Zustand)

**Estructura:**
- Un Context por dominio (no un Context gigante)
- Custom hook para consumir (`useApp`, `useAuth`)
- Validar uso dentro del Provider

---

## Routing (React Router v6)

### Conceptos Clave

**BrowserRouter:** Envuelve toda la app

**Routes:** Contiene todas las rutas

**Route:** Define una ruta específica
- `path`: URL
- `element`: Componente a renderizar

**Outlet:** Placeholder para rutas hijas

**Layout Pattern:** Componente que envuelve rutas con header/sidebar común

### Navegación

**NavLink:** Link con clase activa automática

**useNavigate:** Navegación programática

**useParams:** Obtener parámetros de URL

**useSearchParams:** Query strings

---

## Integración con API (Axios)

### Estructura Recomendada

1. **Instancia Base**
   - Configurar `baseURL`
   - Headers por defecto
   - Timeout

2. **Interceptors**
   - **Request**: Agregar tokens, logging
   - **Response**: Manejo global de errores, refresh tokens

3. **Servicios por Dominio**
   - Un archivo por entidad
   - Métodos CRUD + específicos
   - Retornan promesas

**Principio:** SRP - Un servicio por dominio

---

## Visualización de Datos (Recharts)

### Componentes Principales

**LineChart:** Evolución temporal (tiempos de vuelta)

**BarChart:** Comparaciones (pilotos, equipos)

**PieChart:** Proporciones

**ResponsiveContainer:** Adapta tamaño

### Configuración Esencial

- XAxis, YAxis: Ejes
- CartesianGrid: Grilla
- Tooltip: Info al pasar mouse
- Legend: Leyenda
- Data: Array de objetos

---

## Principios SOLID en React

### S - Single Responsibility
- Componente presentacional: solo UI
- Componente contenedor: solo lógica
- Hook: solo una funcionalidad

### O - Open/Closed
- Componentes genéricos con props
- Extender comportamiento sin modificar

### L - Liskov Substitution
- Componentes respetan contratos de props
- No romper funcionalidad en especializaciones

### I - Interface Segregation
- Props específicas por componente
- No forzar props innecesarias

### D - Dependency Inversion
- Componentes reciben servicios por props
- No instanciar servicios dentro

---

## Buenas Prácticas

### Nomenclatura

**Componentes:** PascalCase

**Funciones/variables:** camelCase

**Constantes:** UPPER_SNAKE_CASE

### Organización

**Imports:** React → Librerías → Componentes → Hooks → Servicios → Estilos

**Props:** Destructuring en parámetros

**Eventos:** Funciones nombradas para lógica compleja

### Conditional Rendering

- `&&` para condicional simple
- Ternario para if-else
- Early returns para casos complejos
- Evitar ternarios anidados

### Keys en Listas

- ID único cuando disponible
- Índice como último recurso
- Nunca omitir key

### useEffect

- Incluir TODAS las dependencias usadas
- `useCallback` para funciones en dependencias
- Array vacío solo si realmente no hay dependencias

### Evitar Prop Drilling

- Context para estado global
- Custom hooks para lógica compartida
- Composición de componentes

---

## Optimización

### Performance

**React.memo:** Componentes que no cambian frecuentemente

**useMemo:** Cálculos costosos

**useCallback:** Funciones que son props

⚠️ **No optimizar prematuramente**

### Loading States

Siempre mostrar:
- Indicador durante fetch
- Mensaje de error si falla
- Estado vacío si no hay datos

### Error Boundaries

- Capturan errores en árbol de componentes
- Evitan crash de toda la app
- Muestran UI de fallback
- Permiten logging

---

## Utilidades Comunes

### Formatters
- Fechas
- Números
- Monedas
- Tiempos

### Validators
- Email
- Teléfono
- Campos requeridos

### Helpers
- Transformaciones de datos
- Parsing
- Ordenamiento/filtrado

---

## Testing (Conceptual)

### Qué Testear

**Componentes críticos:** Lógica de negocio importante

**Custom hooks:** Lógica reutilizable

**Servicios:** Llamadas a API

**Flujos de usuario:** Escenarios principales

### Qué NO Testear

- Componentes triviales de UI
- Código de terceros
- Estilos CSS

---

## Checklist de Implementación

- [ ] Componente en directorio apropiado
- [ ] Estilos en CSS Module separado
- [ ] Estado con useState si necesario
- [ ] Effects con useEffect y dependencias correctas
- [ ] Custom hooks si lógica reutilizable
- [ ] Servicio API si hace peticiones
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Nomenclatura consistente
- [ ] Imports organizados
- [ ] Keys únicas en listas

---

## Antipatrones a Evitar

❌ **Lógica de negocio en componentes presentacionales**
❌ **Prop drilling excesivo**
❌ **Context para todo (usar solo cuando necesario)**
❌ **Componentes gigantes (>200 líneas)**
❌ **useEffect sin dependencias correctas**
❌ **Mutación directa de estado**
❌ **Olvidar keys en listas**
❌ **No manejar loading/error states**
❌ **Fetch en componentes sin custom hook**
❌ **Hardcodear configuraciones**

---

## Recursos

- React Docs: https://react.dev/
- React Router: https://reactrouter.com/
- Recharts: https://recharts.org/
- Axios: https://axios-http.com/
- Vite: https://vitejs.dev/

**Versión:** 1.0
