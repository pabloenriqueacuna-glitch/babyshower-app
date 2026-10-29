# AGENTS.md — Baby Shower Web App

App de lista de regalos para Baby Shower. Invitados reservan regalos; un admin carga el
inventario desde un Excel y ve reservas. Con Supabase configurado, los datos se comparten
entre dispositivos en tiempo real; sin configurar, usa LocalStorage como fallback local.

## Comandos
- `npm run dev` — servidor Vite (guest por defecto, admin en `#admin`).
- `npm run build` — `tsc -b && vite build` (typecheck + build). **No hay script de typecheck separado**; el build es la verificación de tipos.
- `npm run lint` — oxlint (config en `.oxlintrc.json`). Debe quedar sin warnings.
- `npm run preview` — sirve el build.
- No hay runner de tests. Verificar cambios con `npm run lint && npm run build`.

## Stack
- React 19 + TypeScript, Vite, **Tailwind CSS v4**.
- Tailwind v4 se integra con el plugin `@tailwindcss/vite` (ver `vite.config.ts`). **No hay `tailwind.config.js`**: los tokens de tema (paleta pastel: `celeste-*`, `rosado-*`, `menta-*`, `crema-*`) se definen en `src/index.css` con `@theme`.
- `read-excel-file` v9 para leer `.xlsx` en el navegador.
- `@supabase/supabase-js` para el backend compartido opcional (tablas + RPC + Realtime).

## Estructura
```
src/
├── App.tsx                  # enruta por hash: "" invitado | "#admin"
├── context/
│   ├── regalos.ts           # Contexto + hook useRegalos (sin JSX, por regla fast-refresh)
│   └── RegalosContext.tsx   # RegalosProvider (solo exporta el componente)
├── hooks/{useLocalStorage,useAuthAdmin}.ts
├── lib/supabase.ts          # Cliente Supabase (null si no hay variables de entorno)
├── services/datos.ts        # Lectura/escritura compartida + suscripción Realtime
├── utils/{inventario,parseInventario,almacenLocal,categorias,notificaciones}.ts
├── components/              # Navbar, FiltroCategorias, ListaRegalos, RegaloCard, ModalReserva
├── components/admin/        # LoginAdmin, PanelAdmin, CargadorXlsx
├── mockData.ts              # CATEGORIAS + seed de ejemplo
└── types/index.ts           # Regalo, Reserva, ResultadoImportacion
supabase/schema.sql          # Tablas, RLS, RPCs y Realtime para Supabase
```

## Modelo y reglas de negocio
- `Regalo` tiene `categoria` (además de `cantidadTotal`/`cantidadDisponible`).
- Las categorías se normalizan (`trim` + minúsculas) al importar y se comparan de forma insensible a mayúsculas/acentos (`src/utils/categorias.ts`); el filtro y el agrupado derivan las categorías presentes del inventario, no solo de `CATEGORIAS`.
- Reserva válida: `1 <= cantidad <= cantidadDisponible`. Al confirmar se descuenta de inmediato. En modo compartido, el descuento y la reserva son atómicos vía RPC.
- `cantidadDisponible === 0` → la tarjeta muestra "Agotado" y deshabilita el botón.
- Lógica pura en `src/utils/inventario.ts` (`estaAgotado`, `cantidadValida`, `descontarStock`).

## Importación Excel/Numbers (admin)
- Columnas esperadas (encabezados por nombre, sin importar orden): **Categoría, Producto, Cantidad, Cantidad disponible**. La columna **"Me anoto" se ignora**.
- Si falta "Cantidad disponible" o viene vacía, se usa "Cantidad". Fila inválida (Producto vacío o Cantidad no numérica) → error con nº de fila y **no se importa nada**.
- Se aceptan `.xlsx` y `.numbers` (Apple Numbers). `parseInventario` elige el parser por extensión; `parseNumbers` usa `cupertino-files` (import dinámico) y comparte `construirDesdeFilas` con el parser de Excel. Las filas vacías de Numbers se descartan.
- Importar **reemplaza todo el inventario y borra las reservas** (`cargarInventario`).
- Acceso admin: hash `#admin`. Contraseña por defecto `baby2026`, guardada en LocalStorage (`babyShower.adminClave`); la sesión vive en `babyShower.adminSesion`. No es seguridad real, solo separación de roles.

## Backend compartido (Supabase, opcional)
- Sin `VITE_SUPABASE_URL` ni `VITE_SUPABASE_ANON_KEY`, `src/lib/supabase.ts` deja `supabase = null` y todo funciona con LocalStorage (cada navegador aislado).
- Con ambas variables, `RegalosProvider` carga desde Supabase, se suscribe a Realtime y escribe vía RPC (`reservar_regalo`, `cargar_inventario`).
- `contar_reservas` devuelve solo el total; el cliente no lee nombres ni correos de las reservas.
- Setup: crear un proyecto en Supabase, ejecutar `supabase/schema.sql` en el SQL Editor y definir las variables en `.env` local y en Vercel.
- `cargar_inventario` reemplaza todo el inventario y borra las reservas; se usa para importar, "Restaurar datos de ejemplo" y "Vaciar inventario".
- La seguridad sigue siendo de roles: la clave admin es solo UI y las RPC están expuestas al rol `anon`. No usar para datos sensibles.

## Gotchas
- **`read-excel-file` v9**: importar `{ readSheet }` desde `'read-excel-file/browser'` (no existe el import raíz `'read-excel-file'`). El export default devuelve todas las hojas; `readSheet` devuelve las filas de una hoja.
- Claves de LocalStorage: `babyShower.regalos`, `babyShower.reservas`, `babyShower.adminSesion`, `babyShower.adminClave`.
- En modo compartido, `babyShower.regalos` y `babyShower.reservas` se ignoran; en modo local, las pestañas del mismo origen se sincronizan con el evento `storage`.
- "Restaurar datos de ejemplo" y "Vaciar inventario" en modo local solo afectan a ese navegador. Para que admin e invitados compartan datos entre dispositivos hay que configurar Supabase.
- El orden de categorías está fijo en `CATEGORIAS` (`src/mockData.ts`).
- Supabase bloquea `DELETE` sin `WHERE` (safeupdate). En las RPC usar `delete from ... where true;`.

## Convenciones
- **Todo en Español**: identificadores, comentarios y UI.
- Estética pastel infantil, mobile-first. Componentes funcionales y tipados; usar `import type` para tipos (el tsconfig tiene `verbatimModuleSyntax`).
