# Página del profesor César Augusto Vega Fernández

Sitio público con los cursos, módulos, presentaciones y talleres del profesor, además de sus charlas y semilleros. Se publica en <https://cesaravegaf312.github.io/>.

El sitio está hecho con [Astro](https://astro.build/) y genera páginas estáticas, sin JavaScript en el navegador, sin analítica y sin cookies. Todo el contenido vive en archivos YAML dentro de `src/data/`: para agregar un curso, un módulo, una presentación o un taller solo hay que editar esos archivos. No hace falta tocar el código.

## Contenido

1. [Dónde está cada cosa](#1-dónde-está-cada-cosa)
2. [Editar desde GitHub, sin instalar nada](#2-editar-desde-github-sin-instalar-nada)
3. [Agregar una presentación](#3-agregar-una-presentación)
4. [Agregar un taller](#4-agregar-un-taller)
5. [Agregar un módulo](#5-agregar-un-módulo)
6. [Agregar un curso](#6-agregar-un-curso)
7. [Asistente del curso (AEVA)](#7-asistente-del-curso-aeva)
8. [Charlas y semilleros](#8-charlas-y-semilleros)
9. [Texto de la página de inicio](#9-texto-de-la-página-de-inicio)
10. [Ver el sitio en el computador](#10-ver-el-sitio-en-el-computador)
11. [Publicación](#11-publicación)
12. [Reglas básicas de YAML](#12-reglas-básicas-de-yaml)

## 1. Dónde está cada cosa

| Archivo o carpeta | Qué contiene |
|---|---|
| `src/data/cursos.yaml` | Cursos, módulos, presentaciones y talleres |
| `src/data/charlas.yaml` | Charlas y conferencias |
| `src/data/semilleros.yaml` | Semilleros y sus actividades |
| `src/data/perfil.yaml` | Nombre, afiliación y texto de la página de inicio |
| `public/presentaciones/<curso>/` | Archivos PDF o HTML de las presentaciones de cada curso |
| `public/charlas/` | Archivos PDF de las charlas |
| `src/pages/`, `src/layouts/`, `src/styles/`, `src/lib/` | Código del sitio (no hace falta editarlo para agregar contenido) |
| `.github/workflows/deploy.yml` | Publicación automática en GitHub Pages |

`<curso>` es el `id` del curso en `cursos.yaml`. Los ids actuales son: `arem`, `dalgo`, `dyas`, `fpln` (pregrado) y `arem-maestria`, `gcms`, `tyvs` (maestría).

## 2. Editar desde GitHub, sin instalar nada

1. Abra el repositorio en GitHub y entre al archivo, por ejemplo `src/data/cursos.yaml`.
2. Pulse el ícono del lápiz (**Edit this file**).
3. Haga el cambio. Respete la sangría: en YAML los espacios al inicio de la línea importan (ver la [sección 12](#12-reglas-básicas-de-yaml)).
4. Pulse **Commit changes…**, escriba una descripción corta (por ejemplo, "Agrega la presentación de grafos") y confirme en la rama `master`.
5. En la pestaña **Actions** aparece la publicación en curso. Cuando termina en verde, el cambio ya está en el sitio (uno o dos minutos).

Si la publicación termina en rojo, abra el registro del paso **Instalar, construir y subir el sitio**: el mensaje dice qué archivo y qué entrada tienen el problema (por ejemplo, `Error en los datos: curso "dyas", módulo 3, taller 2 no tiene "titulo".`). El sitio publicado no cambia hasta que el error se corrija.

## 3. Agregar una presentación

Cada módulo de `cursos.yaml` tiene una lista `presentaciones`. Una presentación puede ser un archivo que se sube al repositorio o un enlace a una presentación que ya está publicada en otro lugar.

### Presentación en PDF (o HTML) subida al repositorio

1. En GitHub, entre a la carpeta `public/presentaciones/<curso>/` (por ejemplo `public/presentaciones/dyas/`).
2. Pulse **Add file → Upload files**, arrastre el PDF y confirme con **Commit changes**.
3. El nombre del archivo debe coincidir exactamente con el campo `archivo` del módulo en `cursos.yaml`, incluidas mayúsculas, minúsculas y extensión. Se recomienda usar nombres sin espacios ni tildes, como `04-pruebas.pdf`.

Las entradas ya están creadas en `cursos.yaml`, así que en la mayoría de los casos basta con subir el archivo con el nombre que aparece allí. Por ejemplo, este módulo de DYAS espera el archivo `public/presentaciones/dyas/04-pruebas.pdf`:

```yaml
      - titulo: Pruebas
        presentaciones:
          - titulo: Pruebas
            archivo: 04-pruebas.pdf
```

Para agregar una segunda presentación al mismo módulo, añada otra entrada a la lista:

```yaml
        presentaciones:
          - titulo: Pruebas
            archivo: 04-pruebas.pdf
          - titulo: Pruebas de integración
            archivo: 04b-pruebas-integracion.pdf
```

**Archivos faltantes.** Mientras un archivo declarado en el YAML no exista en `public/`, la presentación no se muestra en el sitio, así que nunca hay enlaces rotos. Cada vez que el sitio se construye (en **Actions** o con `npm run build`) aparece un aviso con la lista de archivos que faltan:

```
[WARN] [aviso-presentaciones] Faltan 46 archivos de presentaciones. No se muestran en el sitio hasta que se suban:
  - public/presentaciones/arem/01-introduccion.pdf
  - ...
```

### Presentación publicada en otro lugar

Para una presentación HTML que ya está en un repositorio público con GitHub Pages, use `url` en lugar de `archivo`:

```yaml
        presentaciones:
          - titulo: Presentación de la unidad
            url: https://cesaravegaf312.github.io/AREM-S2_Modelado_y_Decision/presentacion.html
```

El sitio muestra junto a cada presentación una etiqueta `PDF` o `HTML` según la extensión.

## 4. Agregar un taller

Los talleres van en la lista `talleres` del módulo al que pertenecen:

```yaml
        talleres:
          - titulo: Mensajería con RabbitMQ
            repo: DYAS-RabbitMQ
            descripcion: >-
              Introduce la mensajería asíncrona con RabbitMQ mediante ejemplos
              de envío y recepción de mensajes en Java y Python.
```

- `repo` es el nombre del repositorio en `github.com/CesarAVegaF312`. El enlace se arma solo. Si el taller está en otra dirección, use `url: https://...` en lugar de `repo`.
- `descripcion` es una frase sobre lo que enseña el taller.
- El repositorio debe ser público; si es privado, el enlace no le funcionará a nadie más.

Los talleres o guías que sirven para todo el curso, y no para un módulo, van en la lista `talleres` del curso (al mismo nivel que `modulos`). En la página del curso aparecen al final, en "Guías y talleres de todo el curso".

En `cursos.yaml` hay algunos talleres de versiones anteriores de DYAS comentados con `#`. Para publicarlos, quite el `#` del inicio de esas líneas sin cambiar la sangría.

## 5. Agregar un módulo

Agregue una entrada a la lista `modulos` del curso, en la posición que le corresponde (el sitio los numera en el orden en que aparecen):

```yaml
    modulos:
      - titulo: Introducción
        ...
      - titulo: Programación dinámica
        descripcion: Opcional, una o dos frases.
        presentaciones:
          - titulo: Programación dinámica
            archivo: 09-programacion-dinamica.pdf
        talleres: []
```

Además de `presentaciones` y `talleres`, un módulo puede tener una lista `material` con otros enlaces (portadas, repositorios, lecturas):

```yaml
        material:
          - titulo: Portada de la unidad
            url: https://cesaravegaf312.github.io/AREM-S1_Marcos_y_Capacidades-repositorio/
```

Un módulo sin presentaciones visibles, talleres ni material muestra el texto "Sin material publicado por ahora."

## 6. Agregar un curso

1. Copie el bloque de un curso existente en `cursos.yaml` y péguelo al final de la lista `cursos`.
2. Cambie los campos:

```yaml
  - id: ingsoft                     # minúsculas, números y guiones; no se puede repetir
    codigo: INGSOFT
    nombre: Ingeniería de Software
    nivel: pregrado                 # pregrado o maestria
    descripcion: >-
      Una o dos frases sobre el curso.
    aeva: ""
    periodo: 2026-2                 # se muestra como "Material del periodo 2026-2"
    nombre_modulos: Módulos         # opcional: Módulos, Unidades o Sesiones
    modulos:
      - titulo: Introducción
        presentaciones:
          - titulo: Introducción
            archivo: 01-introduccion.pdf
```

3. Cree la carpeta de sus presentaciones: en GitHub, **Add file → Create new file**, escriba como nombre `public/presentaciones/<id>/.gitkeep` (las barras crean las carpetas) y confirme con **Commit changes**. Después suba los PDF a esa carpeta como se explica en la [sección 3](#3-agregar-una-presentación).

El curso aparece en la página **Cursos**, en el grupo de su nivel, y tiene su propia página en `/cursos/<id>/`.

## 7. Asistente del curso (AEVA)

Cada curso tiene el campo `aeva`. Si está vacío (`aeva: ""`), no se muestra nada. Si tiene una dirección, la página del curso muestra el enlace **Asistente del curso**:

```yaml
    aeva: https://direccion-del-asistente
```

## 8. Charlas y semilleros

**Charlas** (`src/data/charlas.yaml`). La página tiene dos grupos: **Charlas presentadas**, con `titulo`, `anio`, `evento` y `lugar`, y **Temas de charla**, que son los marcados con `propuesta: true` (temas disponibles que todavía no se han presentado; solo necesitan `titulo`). Cuando un tema se presente, quite `propuesta: true` y agregue `evento`, `anio` y `lugar`. Para enlazar el material:

- `enlace: https://...` para material publicado en otro lugar (diapositivas, video, repositorio), o
- `archivo: nombre.pdf` para un PDF subido a `public/charlas/`. Si el archivo no existe, no se muestra el enlace y aparece en el aviso de faltantes.

```yaml
  - titulo: El rol del Dev en DevSecOps
    anio: 2026
    evento: Nombre del evento
    lugar: Bogotá
    archivo: rol-dev-devsecops.pdf
```

**Semilleros** (`src/data/semilleros.yaml`). Cada semillero tiene `nombre` y, opcionalmente, `contexto`, `descripcion`, `enlace`, `texto_enlace` y una lista de `actividades` con `titulo` y `periodo`:

```yaml
    actividades:
      - titulo: Maratón de programación
        periodo: 2026-2
```

## 9. Texto de la página de inicio

En `src/data/perfil.yaml`, el campo `presentacion` guarda el texto corto de presentación. Mientras esté vacío, la página de inicio muestra un recuadro "Texto por completar". Cada párrafo es un elemento de la lista:

```yaml
presentacion:
  - Primer párrafo.
  - Segundo párrafo.
```

En el mismo archivo están el nombre, la afiliación y el resumen que aparecen debajo del nombre.

## 10. Ver el sitio en el computador

Requisitos: [Node.js](https://nodejs.org/) 24 (LTS) o 22.23 en adelante, y git.

```bash
git clone https://github.com/CesarAVegaF312/CesarAVegaF312.github.io.git
cd CesarAVegaF312.github.io
npm install
npm run dev
```

El sitio queda en <http://localhost:4321/> y se actualiza solo al guardar cambios en los YAML. Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor local con recarga automática |
| `npm run build` | Construye el sitio en `dist/` e imprime el aviso de presentaciones faltantes |
| `npm run preview` | Sirve la versión construida en `dist/` para revisarla |

## 11. Publicación

Cada cambio que llega a la rama `master` se publica solo con el workflow `.github/workflows/deploy.yml` (acción oficial de Astro para GitHub Pages, Node 24). También se puede lanzar a mano desde **Actions → Publicar en GitHub Pages → Run workflow**.

Configuración que se hace una sola vez en GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## 12. Reglas básicas de YAML

- La sangría se hace con espacios, nunca con tabuladores. Cada nivel usa dos espacios más que el anterior; copie la sangría de una entrada vecina.
- Cada elemento de una lista empieza con `- `.
- Si un texto contiene dos puntos seguidos de espacio (`: `) o empieza con comillas, encierre todo el texto entre comillas dobles: `titulo: "Del texto a los agentes: evolución del PLN"`.
- Para textos largos use `>-` y escriba el texto en las líneas siguientes, con más sangría:

  ```yaml
  descripcion: >-
    Primera línea del texto
    que continúa aquí.
  ```

- Las líneas que empiezan con `#` son comentarios y no se publican.

## Licencia

© César Augusto Vega Fernández. Material de los cursos bajo licencia [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es).
