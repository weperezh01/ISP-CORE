-- Migración: Agregar campos ONE y otros campos faltantes a tabla clientes
-- Fecha: 2025-09-07
-- Propósito: Soportar datos de ubicación ONE y campos adicionales del frontend

-- Agregar campos ONE de ubicación
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS provincia VARCHAR(100) COMMENT 'Provincia según ONE',
ADD COLUMN IF NOT EXISTS municipio VARCHAR(100) COMMENT 'Municipio según ONE',
ADD COLUMN IF NOT EXISTS distrito_municipal VARCHAR(100) COMMENT 'Distrito Municipal según ONE',
ADD COLUMN IF NOT EXISTS seccion VARCHAR(100) COMMENT 'Sección según ONE',
ADD COLUMN IF NOT EXISTS paraje VARCHAR(100) COMMENT 'Paraje según ONE';

-- Agregar campos de coordenadas GPS
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10, 8) COMMENT 'Latitud GPS',
ADD COLUMN IF NOT EXISTS longitud DECIMAL(11, 8) COMMENT 'Longitud GPS';

-- Agregar campos adicionales del frontend
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS telefono1 VARCHAR(20) COMMENT 'Teléfono principal',
ADD COLUMN IF NOT EXISTS telefono2 VARCHAR(20) COMMENT 'Teléfono secundario',
ADD COLUMN IF NOT EXISTS correo_electronico VARCHAR(255) COMMENT 'Email del cliente',
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20) COMMENT 'Cédula de identidad',
ADD COLUMN IF NOT EXISTS pasaporte VARCHAR(20) COMMENT 'Número de pasaporte',
ADD COLUMN IF NOT EXISTS referencia TEXT COMMENT 'Referencia de ubicación';

-- Agregar campos para personas jurídicas
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS persona_juridica BOOLEAN DEFAULT FALSE COMMENT 'Es persona jurídica o física',
ADD COLUMN IF NOT EXISTS rnc VARCHAR(20) COMMENT 'Registro Nacional del Contribuyente',
ADD COLUMN IF NOT EXISTS razon_social VARCHAR(255) COMMENT 'Razón social (personas jurídicas)';

-- Agregar campos adicionales de dirección detallada
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS sector_barrio VARCHAR(100) COMMENT 'Sector o barrio',
ADD COLUMN IF NOT EXISTS calle VARCHAR(100) COMMENT 'Nombre de la calle',
ADD COLUMN IF NOT EXISTS numero VARCHAR(20) COMMENT 'Número de casa/edificio',
ADD COLUMN IF NOT EXISTS edificio VARCHAR(100) COMMENT 'Nombre del edificio',
ADD COLUMN IF NOT EXISTS apartamento VARCHAR(20) COMMENT 'Número de apartamento',
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10) COMMENT 'Código postal',
ADD COLUMN IF NOT EXISTS referencia_exacta TEXT COMMENT 'Referencia exacta de ubicación';

-- Agregar campos de auditoría
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS usuario_creacion INT COMMENT 'Usuario que creó el registro',
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización';

-- Agregar índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clientes_provincia ON clientes(provincia);
CREATE INDEX IF NOT EXISTS idx_clientes_municipio ON clientes(municipio);
CREATE INDEX IF NOT EXISTS idx_clientes_cedula ON clientes(cedula);
CREATE INDEX IF NOT EXISTS idx_clientes_rnc ON clientes(rnc);
CREATE INDEX IF NOT EXISTS idx_clientes_gps ON clientes(latitud, longitud);
CREATE INDEX IF NOT EXISTS idx_clientes_persona_juridica ON clientes(persona_juridica);

-- Actualizar el campo telefono existente si es necesario
-- (Renombrar telefono a telefono1 si solo hay un campo telefono)
-- ALTER TABLE clientes CHANGE telefono telefono1 VARCHAR(20) COMMENT 'Teléfono principal';

-- Verificar la estructura actualizada
-- DESCRIBE clientes;