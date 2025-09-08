import { PermissionsAndroid, Platform } from 'react-native';

async function requestBluetoothPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                {
                    title: "Permiso para conectar Bluetooth",
                    message: "La aplicación necesita permiso para conectarse a dispositivos Bluetooth",
                    buttonNeutral: "Preguntar más tarde",
                    buttonNegative: "Cancelar",
                    buttonPositive: "Aceptar",
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permiso concedido");
            } else {
                console.log("Permiso denegado");
            }
        } catch (err) {
            console.warn(err);
        }
    }
}

export default requestBluetoothPermissions;
