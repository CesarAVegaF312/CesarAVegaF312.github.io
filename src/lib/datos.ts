// Lectura y validación de los archivos de src/data/.
// Las páginas y el aviso de presentaciones faltantes leen el contenido desde aquí.

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const RAIZ = process.cwd();
const DIR_DATOS = path.join(RAIZ, 'src', 'data');
const DIR_PUBLIC = path.join(RAIZ, 'public');

export type Nivel = 'pregrado' | 'maestria';

export interface Presentacion {
  titulo: string;
  archivo?: string;
  url?: string;
}

export interface Taller {
  titulo: string;
  repo?: string;
  url?: string;
  descripcion?: string;
}

export interface Modulo {
  titulo: string;
  descripcion?: string;
  presentaciones: Presentacion[];
  talleres: Taller[];
  material: Presentacion[];
}

export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  nivel: Nivel;
  programa?: string;
  descripcion: string;
  aeva?: string;
  periodo?: string;
  nombre_modulos: string;
  modulos: Modulo[];
  talleres: Taller[];
}

export interface Charla {
  titulo: string;
  anio?: number | string;
  propuesta: boolean;
  evento?: string;
  lugar?: string;
  enlace?: string;
  archivo?: string;
}

export interface Actividad {
  titulo: string;
  periodo?: string;
}

export interface Semillero {
  nombre: string;
  contexto?: string;
  descripcion?: string;
  enlace?: string;
  texto_enlace?: string;
  actividades: Actividad[];
}

export interface Formacion {
  titulo: string;
  institucion?: string;
  anio?: string;
}

export interface Cargo {
  cargo: string;
  lugar?: string;
  periodo?: string;
}

export interface Perfil {
  nombre: string;
  afiliacion: string;
  resumen: string;
  presentacion: string[];
  areas: string[];
  formacion: Formacion[];
  trayectoria: Cargo[];
  contacto: { correo?: string; linkedin?: string };
  usuario_github: string;
}

/** Enlace listo para mostrar: dirección, texto y formato. */
export interface EnlaceVisible {
  titulo: string;
  href: string;
  formato?: string;
  externo: boolean;
}

function leerYaml(nombre: string): any {
  const ruta = path.join(DIR_DATOS, nombre);
  try {
    return parse(fs.readFileSync(ruta, 'utf8')) ?? {};
  } catch (error) {
    throw new Error(`No se pudo leer src/data/${nombre}: ${(error as Error).message}`);
  }
}

function exigir(condicion: unknown, mensaje: string): asserts condicion {
  if (!condicion) throw new Error(`Error en los datos: ${mensaje}`);
}

function lista<T>(valor: unknown): T[] {
  return Array.isArray(valor) ? (valor as T[]) : [];
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : valor == null ? '' : String(valor);
}

// ------------------------------------------------------------------ Perfil

export function cargarPerfil(): Perfil {
  const datos = leerYaml('perfil.yaml');
  return {
    nombre: texto(datos.nombre),
    afiliacion: texto(datos.afiliacion),
    resumen: texto(datos.resumen),
    presentacion: lista<string>(datos.presentacion).map(texto).filter(Boolean),
    areas: lista<string>(datos.areas).map(texto).filter(Boolean),
    formacion: lista<any>(datos.formacion)
      .filter((f) => texto(f?.titulo))
      .map((f) => ({
        titulo: texto(f.titulo),
        institucion: texto(f.institucion) || undefined,
        anio: texto(f.anio) || undefined,
      })),
    trayectoria: lista<any>(datos.trayectoria)
      .filter((t) => texto(t?.cargo))
      .map((t) => ({
        cargo: texto(t.cargo),
        lugar: texto(t.lugar) || undefined,
        periodo: texto(t.periodo) || undefined,
      })),
    contacto: {
      correo: texto(datos.contacto?.correo) || undefined,
      linkedin: texto(datos.contacto?.linkedin) || undefined,
    },
    usuario_github: texto(datos.usuario_github) || 'CesarAVegaF312',
  };
}

// ------------------------------------------------------------------ Cursos

const ID_VALIDO = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function cargarCursos(): Curso[] {
  const datos = leerYaml('cursos.yaml');
  const cursos = lista<any>(datos.cursos);
  const ids = new Set<string>();

  return cursos.map((c, i) => {
    const donde = `cursos.yaml, curso ${i + 1}`;
    exigir(c && typeof c === 'object', `${donde} no tiene el formato esperado.`);
    const id = texto(c.id);
    exigir(id, `${donde} no tiene "id".`);
    exigir(
      ID_VALIDO.test(id),
      `${donde}: el id "${id}" solo puede tener minúsculas, números y guiones.`,
    );
    exigir(!ids.has(id), `${donde}: el id "${id}" está repetido.`);
    ids.add(id);
    exigir(texto(c.codigo), `curso "${id}" no tiene "codigo".`);
    exigir(texto(c.nombre), `curso "${id}" no tiene "nombre".`);
    exigir(
      c.nivel === 'pregrado' || c.nivel === 'maestria',
      `curso "${id}": "nivel" debe ser pregrado o maestria.`,
    );

    return {
      id,
      codigo: texto(c.codigo),
      nombre: texto(c.nombre),
      nivel: c.nivel,
      programa: texto(c.programa) || undefined,
      descripcion: texto(c.descripcion),
      aeva: texto(c.aeva) || undefined,
      periodo: texto(c.periodo) || undefined,
      nombre_modulos: texto(c.nombre_modulos) || 'Módulos',
      modulos: lista<any>(c.modulos).map((m, j) => leerModulo(m, `curso "${id}", módulo ${j + 1}`)),
      talleres: lista<any>(c.talleres).map((t, j) => leerTaller(t, `curso "${id}", taller ${j + 1}`)),
    };
  });
}

function leerModulo(m: any, donde: string): Modulo {
  exigir(m && texto(m.titulo), `${donde} no tiene "titulo".`);
  return {
    titulo: texto(m.titulo),
    descripcion: texto(m.descripcion) || undefined,
    presentaciones: lista<any>(m.presentaciones).map((p, k) =>
      leerEnlace(p, `${donde}, presentación ${k + 1}`),
    ),
    talleres: lista<any>(m.talleres).map((t, k) => leerTaller(t, `${donde}, taller ${k + 1}`)),
    material: lista<any>(m.material).map((e, k) => leerEnlace(e, `${donde}, material ${k + 1}`)),
  };
}

/** Presentación o material: un título con un archivo en public/ o una URL. */
function leerEnlace(p: any, donde: string): Presentacion {
  exigir(p && texto(p.titulo), `${donde} no tiene "titulo".`);
  exigir(texto(p.archivo) || texto(p.url), `${donde} necesita "archivo" o "url".`);
  return {
    titulo: texto(p.titulo),
    archivo: texto(p.archivo) || undefined,
    url: texto(p.url) || undefined,
  };
}

function leerTaller(t: any, donde: string): Taller {
  exigir(t && texto(t.titulo), `${donde} no tiene "titulo".`);
  exigir(texto(t.repo) || texto(t.url), `${donde} necesita "repo" o "url".`);
  return {
    titulo: texto(t.titulo),
    repo: texto(t.repo) || undefined,
    url: texto(t.url) || undefined,
    descripcion: texto(t.descripcion) || undefined,
  };
}

/** Nombre corto del nivel: Pregrado o Maestría. */
export function nivelCorto(nivel: Nivel): string {
  return nivel === 'pregrado' ? 'Pregrado' : 'Maestría';
}

/** Nombre completo del nivel, como se muestra en la página del curso. */
export function nivelLargo(nivel: Nivel): string {
  return nivel === 'pregrado' ? 'Pregrado' : 'Maestría en Ingeniería de Software';
}

/** Cursos con el mismo nombre o el mismo código en otro nivel. */
export function cursosRelacionados(curso: Curso, cursos: Curso[]): Curso[] {
  return cursos.filter(
    (otro) => otro.id !== curso.id && (otro.nombre === curso.nombre || otro.codigo === curso.codigo),
  );
}

/** Nombre del curso, con el nivel entre paréntesis si otro curso se llama igual. */
export function nombreVisible(curso: Curso, cursos: Curso[]): string {
  return cursosRelacionados(curso, cursos).length > 0
    ? `${curso.nombre} (${nivelCorto(curso.nivel)})`
    : curso.nombre;
}

// ------------------------------------------------------ Charlas y semilleros

export function cargarCharlas(): Charla[] {
  const datos = leerYaml('charlas.yaml');
  return lista<any>(datos.charlas).map((c, i) => {
    const donde = `charlas.yaml, charla ${i + 1}`;
    exigir(c && texto(c.titulo), `${donde} no tiene "titulo".`);
    const propuesta = c.propuesta === true;
    exigir(propuesta || texto(c.anio), `${donde} no tiene "anio" (o "propuesta: true" si aún no se presenta).`);
    return {
      titulo: texto(c.titulo),
      anio: texto(c.anio) ? c.anio : undefined,
      propuesta,
      evento: texto(c.evento) || undefined,
      lugar: texto(c.lugar) || undefined,
      enlace: texto(c.enlace) || undefined,
      archivo: texto(c.archivo) || undefined,
    };
  });
}

export function cargarSemilleros(): Semillero[] {
  const datos = leerYaml('semilleros.yaml');
  return lista<any>(datos.semilleros).map((s, i) => {
    const donde = `semilleros.yaml, semillero ${i + 1}`;
    exigir(s && texto(s.nombre), `${donde} no tiene "nombre".`);
    return {
      nombre: texto(s.nombre),
      contexto: texto(s.contexto) || undefined,
      descripcion: texto(s.descripcion) || undefined,
      enlace: texto(s.enlace) || undefined,
      texto_enlace: texto(s.texto_enlace) || undefined,
      actividades: lista<any>(s.actividades).map((a) => ({
        titulo: texto(a?.titulo),
        periodo: texto(a?.periodo) || undefined,
      })),
    };
  });
}

// ------------------------------------------------- Archivos en public/

/** Ruta relativa a public/ del archivo de una presentación de un curso. */
function rutaPresentacion(curso: Curso, archivo: string): string {
  return path.posix.join('presentaciones', curso.id, archivo);
}

function rutaCharla(archivo: string): string {
  return path.posix.join('charlas', archivo);
}

function existeEnPublic(rutaRelativa: string): boolean {
  return fs.existsSync(path.join(DIR_PUBLIC, rutaRelativa));
}

function hrefPublico(rutaRelativa: string): string {
  return '/' + rutaRelativa.split('/').map(encodeURIComponent).join('/');
}

function formatoDe(direccion: string): string | undefined {
  const limpia = direccion.split(/[?#]/)[0].toLowerCase();
  if (limpia.endsWith('.pdf')) return 'PDF';
  if (limpia.endsWith('.html') || limpia.endsWith('.htm') || limpia.endsWith('/')) return 'HTML';
  return undefined;
}

/**
 * Presentaciones de un módulo que se pueden mostrar: las que tienen URL
 * y las que tienen un archivo que ya existe en public/.
 */
export function presentacionesVisibles(curso: Curso, modulo: Modulo): EnlaceVisible[] {
  return enlacesVisibles(curso, modulo.presentaciones);
}

/** Material de un módulo que se puede mostrar, con la misma regla que las presentaciones. */
export function materialVisible(curso: Curso, modulo: Modulo): EnlaceVisible[] {
  return enlacesVisibles(curso, modulo.material);
}

function enlacesVisibles(curso: Curso, lista: Presentacion[]): EnlaceVisible[] {
  const visibles: EnlaceVisible[] = [];
  for (const p of lista) {
    if (p.archivo) {
      const ruta = rutaPresentacion(curso, p.archivo);
      if (!existeEnPublic(ruta)) continue;
      visibles.push({ titulo: p.titulo, href: hrefPublico(ruta), formato: formatoDe(p.archivo), externo: false });
    } else if (p.url) {
      visibles.push({ titulo: p.titulo, href: p.url, formato: formatoDe(p.url), externo: true });
    }
  }
  return visibles;
}

/** Enlace al material de una charla, si existe. */
export function materialCharla(charla: Charla): EnlaceVisible | undefined {
  if (charla.archivo) {
    const ruta = rutaCharla(charla.archivo);
    if (existeEnPublic(ruta)) {
      return { titulo: 'Material', href: hrefPublico(ruta), formato: formatoDe(charla.archivo), externo: false };
    }
  }
  if (charla.enlace) {
    return { titulo: 'Material', href: charla.enlace, formato: formatoDe(charla.enlace), externo: true };
  }
  return undefined;
}

export function urlTaller(taller: Taller, usuarioGithub: string): string {
  return taller.url ?? `https://github.com/${usuarioGithub}/${taller.repo}`;
}

/** Archivos de presentaciones y material declarados en los YAML que todavía no están en public/. */
export function archivosFaltantes(): string[] {
  const faltantes: string[] = [];
  for (const curso of cargarCursos()) {
    for (const modulo of curso.modulos) {
      for (const p of [...modulo.presentaciones, ...modulo.material]) {
        if (!p.archivo) continue;
        const ruta = rutaPresentacion(curso, p.archivo);
        if (!existeEnPublic(ruta)) faltantes.push(`public/${ruta}`);
      }
    }
  }
  for (const charla of cargarCharlas()) {
    if (!charla.archivo) continue;
    const ruta = rutaCharla(charla.archivo);
    if (!existeEnPublic(ruta)) faltantes.push(`public/${ruta}`);
  }
  return faltantes;
}
