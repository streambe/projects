# Deployment Guide - Tateti

**Responsable**: Margaret Hamilton (DevOps) + Carl Sagan (Cloud)
**Ultima actualizacion**: 2026-04-01

---

## 1. Arquitectura de Deploy

Tateti es un sitio estatico compuesto por un unico archivo `index.html`. Se despliega en **Vercel** como static site, sin proceso de build, sin dependencias y sin variables de entorno.

```
[index.html] --push/CLI--> [Vercel CDN] --> usuario final
```

- **Plataforma**: Vercel (Free tier)
- **Tipo**: Static site (sin framework)
- **Archivos desplegados**: `index.html`
- **Build command**: ninguno
- **Output directory**: `.` (raiz del proyecto)
- **Dominio**: asignado automaticamente por Vercel

### Datos del proyecto Vercel

| Campo | Valor |
|-------|-------|
| Project ID | `prj_zinvpH9j1GXuxfeOFfNXy7cioTQB` |
| Org/Team ID | `team_Gk1Pg2M1JnUCGAFhEuxCWz4i` |
| Project Name | `tateti` |

---

## 2. Variables de Entorno

**No se requiere ninguna variable de entorno.** El proyecto es 100% estatico y autocontenido.

---

## 3. Paso a Paso para Deploy

### Opcion A: Deploy via Vercel CLI

```bash
# 1. Instalar Vercel CLI (si no esta instalado)
npm install -g vercel

# 2. Ir al directorio del proyecto
cd projects/tateti

# 3. Deploy a preview (staging)
vercel --yes

# 4. Deploy a produccion
vercel --prod --yes
```

### Opcion B: Deploy via Git Push

Si el proyecto esta vinculado a un repositorio en Vercel:

```bash
# Push a main/master despliega automaticamente a produccion
git push origin main

# Push a cualquier otra rama genera un preview URL automatico
git push origin feature/mi-rama
```

### Opcion C: Deploy manual desde el dashboard

1. Ir a https://vercel.com/dashboard
2. Seleccionar el proyecto `tateti`
3. Click en "Deployments" > "Redeploy" en el ultimo deploy exitoso

---

## 4. URLs

| Ambiente | URL |
|----------|-----|
| Produccion | https://tateti.vercel.app |
| Preview (por deploy) | https://tateti-{hash}.vercel.app |
| Dashboard | https://vercel.com/team_Gk1Pg2M1JnUCGAFhEuxCWz4i/tateti |

---

## 5. Checklist Pre-Deploy

- [ ] El archivo `index.html` existe en la raiz del proyecto
- [ ] El archivo `index.html` abre correctamente en el navegador local
- [ ] No hay errores en la consola del navegador
- [ ] El juego funciona correctamente (turnos, deteccion de ganador, reinicio)
- [ ] No se han incluido archivos sensibles (.env, credenciales, etc.)

---

## 6. Troubleshooting

### El deploy falla con "No Output Directory"
Verificar que el directorio de deploy contiene `index.html` en la raiz. Vercel necesita al menos un archivo HTML.

### La pagina muestra 404
El proyecto puede estar configurado con un output directory incorrecto. Verificar en Vercel Dashboard > Settings > General > Output Directory que este vacio o en `.`.

### Los estilos o JS no cargan
Verificar que todos los recursos estan embebidos en el `index.html` o que las rutas relativas son correctas. Al ser un solo archivo, esto no deberia ocurrir.

### El CLI pide login
Ejecutar `vercel login` y autenticarse con la cuenta asociada al team `team_Gk1Pg2M1JnUCGAFhEuxCWz4i`.

### Rollback a una version anterior
```bash
# Listar deployments
vercel ls tateti

# Promover un deployment anterior a produccion
vercel promote <deployment-url>
```

---

## 7. Configuracion del Proyecto

El archivo `.vercel/project.json` vincula el directorio local con el proyecto en Vercel:

```json
{
  "projectId": "prj_zinvpH9j1GXuxfeOFfNXy7cioTQB",
  "orgId": "team_Gk1Pg2M1JnUCGAFhEuxCWz4i",
  "projectName": "tateti"
}
```

Este archivo NO debe eliminarse. Sin el, el CLI pedira re-vincular el proyecto.
