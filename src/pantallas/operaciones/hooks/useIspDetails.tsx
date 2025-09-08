// src/hooks/useIspDetails.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useIspDetails = () => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [nivelUsuario, setNivelUsuario] = useState('');
  const [permisosUsuario, setPermisosUsuario] = useState([]);
  const [id_isp, setId_isp] = useState({});
  const [conexionesResumen, setConexionesResumen] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@loginData');
        if (jsonValue) {
          const userData = JSON.parse(jsonValue);

          setNombreUsuario(userData.nombre);
          setUsuarioId(userData.id);
          setNivelUsuario(userData.nivel_usuario);
          setIsOwner(userData.owner === 'Y');

          await consultarPermisos(userData.id);
        } else {
          console.warn('No se encontraron datos del usuario en AsyncStorage.');
        }
      } catch (e) {
        console.error('Error al leer los datos del usuario:', e);
      }
    };

    obtenerDatosUsuario();
  }, []);

  const consultarPermisos = async (usuarioId) => {
    try {
      const response = await fetch('https://wellnet-rd.com:444/api/usuarios/permisos-del-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_usuario: usuarioId }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.isp && data.isp.id_isp) {
          await guardarIdIspSeleccionado(data.isp.id_isp);
          setId_isp(data.isp);
        }

        setPermisosUsuario(data.permisos || []);

        if (data.conexiones_resumen) {
          setConexionesResumen(data.conexiones_resumen);
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error al consultar permisos y registros:', error);
    }
  };

  const guardarIdIspSeleccionado = async (idIsp) => {
    try {
      await AsyncStorage.setItem('@selectedIspId', idIsp.toString());
    } catch (e) {
      console.error('❌ Error al guardar el ID de ISP en AsyncStorage:', e);
    }
  };

  const tienePermiso = (idPermiso) => {
    if (nivelUsuario === 'SUPER ADMINISTRADOR' || nivelUsuario === 'MEGA ADMINISTRADOR') {
      return true;
    }
    
    // Special case for owner permission
    if (idPermiso === 'owner') {
      return isOwner;
    }
    
    return permisosUsuario.some(
      (permiso) => permiso.id_permiso === idPermiso && permiso.estado_permiso === 'Y'
    );
  };

  return {
    nombreUsuario,
    usuarioId,
    nivelUsuario,
    permisosUsuario,
    id_isp,
    conexionesResumen,
    isOwner,
    tienePermiso
  };
};
