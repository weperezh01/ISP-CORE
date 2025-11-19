# Debug - Error de Reinicio de ONU

## Error Actual

```
Command failed: python3 /home/wdperezh01/backend/scripts/reboot_onu.py
  --olt-type huawei
  --puerto "0/1/0"
  --ont-id 0
```

**Código de error:** `INTERNAL_ERROR` (HTTP 500)

---

## Análisis del Problema

### Datos de la ONU desde la App

La app está enviando:
```
Serial: 48575443439B989D
OLT ID: 1
Puerto: 0/1/0
ONT ID: (probablemente NULL o no disponible)
```

### Problema Identificado

El backend está usando `--ont-id 0` que probablemente es incorrecto por una de estas razones:

1. **ONT ID NULL en la base de datos**
   - La ONU puede estar en estado "Pendiente" sin ONT ID asignado
   - El backend está usando `0` como default cuando no encuentra ONT ID

2. **Reinicio TR-069 no requiere ONT ID del PON**
   - Para reiniciar via TR-069, solo necesitas el **serial number** de la ONU
   - El ONT ID del puerto PON es irrelevante para comandos TR-069

3. **Confusión entre dos tipos de reinicio**
   - **Reinicio via CLI de OLT** (requiere puerto + ont_id del PON)
   - **Reinicio via TR-069/ACS** (solo requiere serial de la ONU)

---

## Solución Recomendada

### Opción A: Reinicio via TR-069 (RECOMENDADO)

Si tienes servidor ACS (GenieACS), el reinicio debería ser directo a la ONU:

```python
# backend/scripts/reboot_onu_tr069.py

import sys
import argparse
import requests

def reboot_onu_via_acs(onu_serial: str, acs_url: str = "http://localhost:7557"):
    """
    Reiniciar ONU via TR-069 usando GenieACS
    """
    # 1. Obtener device ID de GenieACS
    devices_response = requests.get(
        f"{acs_url}/devices",
        params={"query": json.dumps({"_id": onu_serial})}
    )

    if not devices_response.ok:
        raise Exception(f"No se pudo consultar GenieACS: {devices_response.status_code}")

    devices = devices_response.json()
    if not devices:
        raise Exception(f"ONU {onu_serial} no encontrada en ACS")

    device_id = devices[0]["_id"]

    # 2. Enviar tarea de reinicio
    task = {
        "name": "reboot"
    }

    task_response = requests.post(
        f"{acs_url}/devices/{device_id}/tasks",
        params={
            "timeout": 3000,
            "connection_request": True
        },
        json=task
    )

    if not task_response.ok:
        raise Exception(f"Error enviando comando de reinicio: {task_response.text}")

    return {
        "success": True,
        "message": "Comando de reinicio enviado via TR-069",
        "task_id": task_response.json().get("_id")
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--serial", required=True, help="Serial de la ONU")
    parser.add_argument("--acs-url", default="http://localhost:7557", help="URL del servidor ACS")

    args = parser.parse_args()

    try:
        result = reboot_onu_via_acs(args.serial, args.acs_url)
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)
```

**Endpoint del backend debería llamar:**
```python
# backend/routers/olts.py

@router.post("/olts/realtime/{olt_id}/onus/{serial}/tr069/reboot")
async def reboot_onu_tr069(olt_id: int, serial: str, body: dict, token: str = Depends(...)):
    # Validar confirmación
    if not body.get("confirm"):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "code": "CONFIRMATION_REQUIRED",
                "message": "Se requiere confirmación explícita para reiniciar ONU",
                "hint": 'Enviar { "confirm": true } en el body'
            }
        )

    # Reiniciar via TR-069 (NO requiere puerto ni ont_id)
    cmd = [
        "python3",
        "/home/wdperezh01/backend/scripts/reboot_onu_tr069.py",
        "--serial", serial,
        "--acs-url", "http://localhost:7557"  # Ajustar según tu config
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "code": "INTERNAL_ERROR",
                "message": "Error interno reiniciando ONU",
                "error": result.stderr
            }
        )

    return json.loads(result.stdout)
```

---

### Opción B: Reinicio via CLI de OLT (Fallback sin ACS)

Si NO tienes ACS, puedes reiniciar via CLI de la OLT, pero **necesitas el ONT ID correcto**:

```python
# backend/scripts/reboot_onu_cli.py

import paramiko
import argparse
import json
import sys

def reboot_onu_via_cli(olt_ip: str, olt_user: str, olt_pass: str,
                       puerto: str, ont_id: int, olt_type: str = "huawei"):
    """
    Reiniciar ONU via CLI de la OLT
    """
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(olt_ip, username=olt_user, password=olt_pass)
        shell = ssh.invoke_shell()

        if olt_type == "huawei":
            commands = [
                "enable",
                "config",
                f"interface gpon {puerto}",
                f"ont reset {ont_id}",
                "quit",
                "quit"
            ]
        elif olt_type == "zte":
            commands = [
                "enable",
                "configure terminal",
                f"interface gpon-olt_{puerto}",
                f"onu {ont_id} reset",
                "exit",
                "exit"
            ]
        else:
            raise ValueError(f"OLT type {olt_type} no soportado")

        output = ""
        for cmd in commands:
            shell.send(cmd + "\n")
            time.sleep(0.5)
            if shell.recv_ready():
                output += shell.recv(4096).decode()

        return {
            "success": True,
            "message": "Comando de reinicio enviado via CLI",
            "output": output
        }

    finally:
        ssh.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--olt-ip", required=True)
    parser.add_argument("--olt-user", required=True)
    parser.add_argument("--olt-pass", required=True)
    parser.add_argument("--olt-type", required=True, choices=["huawei", "zte"])
    parser.add_argument("--puerto", required=True)
    parser.add_argument("--ont-id", required=True, type=int)

    args = parser.parse_args()

    try:
        result = reboot_onu_via_cli(
            args.olt_ip, args.olt_user, args.olt_pass,
            args.puerto, args.ont_id, args.olt_type
        )
        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)
```

**IMPORTANTE:** Para esta opción, el backend **DEBE**:
1. Consultar la base de datos para obtener el ONT ID real de la ONU
2. NO usar `0` como default si no encuentra ONT ID
3. Retornar error claro si la ONU no tiene ONT ID asignado

```python
# backend/routers/olts.py

@router.post("/olts/realtime/{olt_id}/onus/{serial}/tr069/reboot")
async def reboot_onu_cli(olt_id: int, serial: str, body: dict, db: Session = Depends(...)):
    # 1. Obtener datos de la OLT desde DB
    olt = db.query(OLT).filter(OLT.id == olt_id).first()
    if not olt:
        raise HTTPException(status_code=404, detail="OLT no encontrada")

    # 2. Obtener datos de la ONU desde DB
    onu = db.query(ONU).filter(
        ONU.serial == serial,
        ONU.olt_id == olt_id
    ).first()

    if not onu:
        raise HTTPException(status_code=404, detail="ONU no encontrada")

    # 3. VALIDAR que la ONU tenga ONT ID asignado
    if onu.ont_id is None or onu.ont_id == 0:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "code": "ONU_NOT_AUTHORIZED",
                "message": "La ONU no tiene ONT ID asignado. Debe estar autorizada primero.",
                "hint": "Autoriza la ONU antes de intentar reiniciarla"
            }
        )

    if not onu.puerto:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "code": "MISSING_PORT",
                "message": "La ONU no tiene puerto PON asignado"
            }
        )

    # 4. Ejecutar comando con datos REALES
    cmd = [
        "python3",
        "/home/wdperezh01/backend/scripts/reboot_onu_cli.py",
        "--olt-ip", olt.ip_address,
        "--olt-user", olt.username,
        "--olt-pass", olt.password,
        "--olt-type", olt.vendor.lower(),  # "huawei" o "zte"
        "--puerto", onu.puerto,
        "--ont-id", str(onu.ont_id)  # ONT ID REAL de la DB
    ]

    # ... ejecutar comando ...
```

---

## Recomendación Final

**USAR OPCIÓN A (TR-069)** porque:
1. ✅ Más confiable (no depende de CLI de OLT)
2. ✅ Funciona incluso si la ONU cambia de puerto
3. ✅ No requiere ONT ID del puerto PON
4. ✅ Más rápido
5. ✅ Soporta más operaciones (no solo reinicio)

**Usar Opción B (CLI) solo si:**
- ❌ No tienes servidor ACS instalado
- ❌ No puedes instalar GenieACS
- ❌ Las ONUs no soportan TR-069

---

## Datos que la App Envía al Backend

Cuando el usuario presiona "Reiniciar" en la app:

```http
POST /api/olts/realtime/1/onus/48575443439B989D/tr069/reboot
Authorization: Bearer {token}
Content-Type: application/json

{
  "confirm": true
}
```

**Datos disponibles en el request:**
- `olt_id` = 1 (en la URL)
- `serial` = "48575443439B989D" (en la URL)
- `confirm` = true (en el body)

**Datos que el backend DEBE obtener de la DB si usa CLI:**
- Puerto PON de la ONU (ej: "0/1/5")
- ONT ID real de la ONU (ej: 25)
- IP de la OLT
- Credenciales de la OLT
- Vendor de la OLT (Huawei/ZTE)

---

## Testing del Script

### Probar script TR-069 manualmente:

```bash
python3 /home/wdperezh01/backend/scripts/reboot_onu_tr069.py \
  --serial 48575443439B989D \
  --acs-url http://localhost:7557
```

### Probar script CLI manualmente:

```bash
python3 /home/wdperezh01/backend/scripts/reboot_onu_cli.py \
  --olt-ip 192.168.1.100 \
  --olt-user admin \
  --olt-pass password123 \
  --olt-type huawei \
  --puerto "0/1/5" \
  --ont-id 25
```

---

## Checklist para Solucionar el Error

- [ ] Decidir: ¿Usar TR-069 (ACS) o CLI directo?
- [ ] Si TR-069: Verificar que GenieACS esté instalado y corriendo
- [ ] Si TR-069: Verificar que la ONU aparezca en GenieACS
- [ ] Si CLI: Obtener ONT ID REAL de la base de datos (NO usar 0)
- [ ] Si CLI: Validar que la ONU esté autorizada antes de reiniciar
- [ ] Actualizar el script de reinicio según la opción elegida
- [ ] Probar el script manualmente primero
- [ ] Integrar en el endpoint del backend
- [ ] Probar desde la app nuevamente

---

**Contacto:**
Si necesitas ayuda para instalar GenieACS o configurar TR-069, consulta:
- GenieACS Docs: https://docs.genieacs.com/
- `REQUISITOS_BACKEND_TR069.md` en la raíz del proyecto frontend
