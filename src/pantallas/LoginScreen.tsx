import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    Alert, 
    Text, 
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import Svg, { Path, Circle, Line, Rect, Polygon, G } from 'react-native-svg';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Función para calcular punto en curva cuadrática
const getPointOnQuadraticCurve = (t, p0, p1, p2) => {
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    return { x, y };
};

// Ondas: utilidades para dibujar arcos (sector de círculo)
const polarToCartesian = (cx, cy, r, deg) => {
    const rad = (deg - 90) * Math.PI / 180.0;
    return {
        x: cx + (r * Math.cos(rad)),
        y: cy + (r * Math.sin(rad)),
    };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

// Elemento animado para las ondas SVG
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Componente de líneas animadas
const AnimatedLines = ({ style }) => {
    const lineAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    
    const lightAnimations = useRef([
        new Animated.Value(0), // curve 0: left-to-right, starts at 0
        new Animated.Value(1), // curve 1: right-to-left, starts at 1
        new Animated.Value(0), // curve 2: left-to-right, starts at 0
        new Animated.Value(1), // curve 3: right-to-left, starts at 1
    ]).current;

    const pulseAnimations = useRef([
        new Animated.Value(0.5),
        new Animated.Value(0.5),
        new Animated.Value(0.5),
        new Animated.Value(0.5),
    ]).current;

    useEffect(() => {
        // Animar líneas apareciendo progresivamente (fibra óptica instalándose)
        const lineSequence = lineAnimations.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 800,
                delay: index * 200,
                easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                useNativeDriver: false,
            })
        );

        // Animar pulsos de luz como estrellas fugaces
        const lightSequence = lightAnimations.map((anim, index) => {
            // Las curvas pares (0,2) van izquierda→derecha: 0→1
            // Las curvas impares (1,3) van derecha→izquierda: 1→0
            const isRightToLeft = index % 2 === 1;
            const startValue = isRightToLeft ? 1 : 0;
            const endValue = isRightToLeft ? 0 : 1;

            // Valor inicial explícito
            anim.setValue(startValue);

            return Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 400 + 1000 + (Math.random() * 1000)), // Delay más aleatorio
                    Animated.timing(anim, {
                        toValue: endValue,
                        duration: 1400 + (Math.random() * 600), // Más rápido: reduce duración del recorrido
                        easing: Easing.linear, // Velocidad constante como estrella fugaz
                        useNativeDriver: false,
                    }),
                    Animated.delay(1000 + (Math.random() * 2000)), // Pausa más larga entre estrellas fugaces
                ])
            );
        });

        // Animar el pulso/brillo de cada punto de luz
        const pulseSequence = pulseAnimations.map((anim, index) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 800 + (index * 100),
                        easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
                        useNativeDriver: false,
                    }),
                    Animated.timing(anim, {
                        toValue: 0.3,
                        duration: 800 + (index * 100),
                        easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
                        useNativeDriver: false,
                    }),
                ])
            );
        });

        Animated.parallel([
            Animated.sequence(lineSequence),
            ...lightSequence,
            ...pulseSequence,
        ]).start();
    }, []);

    // Definir las curvas cuadráticas extendidas más allá de la pantalla para efecto estrella fugaz
    const curves = [
        {
            start: { x: -150, y: height * 0.18 },
            control: { x: width * 0.6, y: height * 0.12 },
            end: { x: width + 150, y: height * 0.22 }
        },
        {
            start: { x: width + 150, y: height * 0.35 },
            control: { x: width * 0.3, y: height * 0.28 },
            end: { x: -150, y: height * 0.42 }
        },
        {
            start: { x: -120, y: height * 0.58 },
            control: { x: width * 0.7, y: height * 0.52 },
            end: { x: width + 120, y: height * 0.64 }
        },
        {
            start: { x: width + 180, y: height * 0.78 },
            control: { x: width * 0.4, y: height * 0.72 },
            end: { x: -180, y: height * 0.84 }
        }
    ];

    // Generar paths SVG para las curvas
    const svgPaths = curves.map(curve => 
        `M ${curve.start.x},${curve.start.y} Q ${curve.control.x},${curve.control.y} ${curve.end.x},${curve.end.y}`
    );

    return (
        <View style={[style, { overflow: 'visible' }]}>
            {/* Líneas curvas usando SVG */}
            {curves.map((curve, index) => {
                const lineAnim = lineAnimations[index];

                return (
                    <Animated.View
                        key={`line-container-${index}`}
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            opacity: lineAnim
                        }}
                    >
                        <Svg height="100%" width="100%">
                            {/* Cable exterior (más sutil para enfoque en estrellas fugaces) */}
                            <Path
                                d={svgPaths[index]}
                                stroke="rgba(60, 80, 120, 0.15)"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* Núcleo de fibra óptica (muy tenue) */}
                            <Path
                                d={svgPaths[index]}
                                stroke="rgba(102, 178, 255, 0.25)"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                            {/* Brillo interno (apenas visible) */}
                            <Path
                                d={svgPaths[index]}
                                stroke="rgba(200, 230, 255, 0.15)"
                                strokeWidth="0.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </Svg>
                    </Animated.View>
                );
            })}

            {/* Puntos de luz que siguen las curvas usando View animadas */}
            {curves.map((curve, index) => {
                const lightAnim = lightAnimations[index];
                const lineOpacity = lineAnimations[index];
                const pulseAnim = pulseAnimations[index];

                return (
                    <Animated.View
                        key={`light-${index}`}
                        style={{
                            position: 'absolute',
                            opacity: lineOpacity.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1]
                            }),
                            transform: [
                                {
                                    // Centramos el contenedor de 80px en el punto de la curva (x - 40)
                                    translateX: lightAnim.interpolate({
                                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                                        outputRange: (
                                            index % 2 === 0
                                                ? [
                                                    getPointOnQuadraticCurve(0, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.1, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.2, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.3, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.4, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.5, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.6, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.7, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.8, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.9, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(1, curve.start, curve.control, curve.end).x - 40,
                                                ]
                                                : [
                                                    getPointOnQuadraticCurve(1, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.9, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.8, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.7, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.6, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.5, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.4, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.3, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.2, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0.1, curve.start, curve.control, curve.end).x - 40,
                                                    getPointOnQuadraticCurve(0, curve.start, curve.control, curve.end).x - 40,
                                                ]
                                        ),
                                        extrapolate: 'clamp'
                                    })
                                },
                                {
                                    // Centramos el contenedor de 24px en el punto de la curva (y - 12)
                                    translateY: lightAnim.interpolate({
                                        inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                                        outputRange: (
                                            index % 2 === 0
                                                ? [
                                                    getPointOnQuadraticCurve(0, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.1, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.2, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.3, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.4, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.5, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.6, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.7, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.8, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.9, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(1, curve.start, curve.control, curve.end).y - 12,
                                                ]
                                                : [
                                                    getPointOnQuadraticCurve(1, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.9, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.8, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.7, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.6, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.5, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.4, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.3, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.2, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0.1, curve.start, curve.control, curve.end).y - 12,
                                                    getPointOnQuadraticCurve(0, curve.start, curve.control, curve.end).y - 12,
                                                ]
                                        ),
                                        extrapolate: 'clamp'
                                    })
                                }
                            ]
                        }}
                    >
                        <View
                            style={{
                                width: 80, // contenedor centrado sobre el punto (ver translateX/Y)
                                height: 24,
                                justifyContent: 'center',
                                alignItems: 'center',
                                // backgroundColor: index % 2 === 1 ? 'rgba(255,0,0,0.3)' : 'rgba(0,255,0,0.3)', // DEBUG: para ver contenedores
                            }}
                        >
                            {/* Estela de la estrella fugaz - dirección basada en el índice */}
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 40,
                                    height: 3,
                                    // Para líneas que van izq->der: estela a la izquierda
                                    // Para líneas que van der->izq: estela a la derecha
                                    ...(index % 2 === 0 ? 
                                        { left: -20 } : 
                                        { right: -20 }
                                    ),
                                    backgroundColor: 'rgba(102, 178, 255, 0.3)',
                                    borderRadius: 1.5,
                                    shadowColor: '#66B2FF',
                                    shadowOffset: index % 2 === 0 ? 
                                        { width: -2, height: 0 } : 
                                        { width: 2, height: 0 },
                                    shadowOpacity: 0.6,
                                    shadowRadius: 4,
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 25,
                                    height: 2,
                                    ...(index % 2 === 0 ? 
                                        { left: -12 } : 
                                        { right: -12 }
                                    ),
                                    backgroundColor: 'rgba(102, 200, 255, 0.5)',
                                    borderRadius: 1,
                                }}
                            />
                            {/* Halo exterior grande para estrella fugaz */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    // El punto brillante va adelante del movimiento
                                    ...(index % 2 === 0 ? 
                                        { right: -10 } : 
                                        { left: -10 }
                                    ),
                                    width: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [20, 30],
                                        extrapolate: 'clamp'
                                    }),
                                    height: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [20, 30],
                                        extrapolate: 'clamp'
                                    }),
                                    borderRadius: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [10, 15],
                                        extrapolate: 'clamp'
                                    }),
                                    backgroundColor: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: ['rgba(102, 178, 255, 0.2)', 'rgba(102, 178, 255, 0.4)'],
                                        extrapolate: 'clamp'
                                    }),
                                    shadowColor: '#66B2FF',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [0.6, 1],
                                        extrapolate: 'clamp'
                                    }),
                                    shadowRadius: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [8, 16],
                                        extrapolate: 'clamp'
                                    }),
                                }}
                            />
                            {/* Núcleo brillante de la estrella */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    ...(index % 2 === 0 ? 
                                        { right: -2 } : 
                                        { left: -2 }
                                    ),
                                    width: 16,
                                    height: 16,
                                    borderRadius: 8,
                                    backgroundColor: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: ['rgba(102, 200, 255, 0.8)', 'rgba(255, 255, 255, 1)'],
                                        extrapolate: 'clamp'
                                    }),
                                    shadowColor: '#FFFFFF',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 1,
                                    shadowRadius: pulseAnim.interpolate({
                                        inputRange: [0.3, 1],
                                        outputRange: [4, 10],
                                        extrapolate: 'clamp'
                                    }),
                                }}
                            />
                            {/* Punto central ultra brillante */}
                            <View
                                style={{
                                    position: 'absolute',
                                    ...(index % 2 === 0 ? 
                                        { right: 2 } : 
                                        { left: 2 }
                                    ),
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: '#FFFFFF',
                                    shadowColor: '#FFFFFF',
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 1,
                                    shadowRadius: 6,
                                }}
                            />
                            {/* Punto central intenso */}
                            <View
                                style={{
                                    position: 'absolute',
                                    ...(index % 2 === 0 ? 
                                        { right: 6 } : 
                                        { left: 6 }
                                    ),
                                    width: 2,
                                    height: 2,
                                    borderRadius: 1,
                                    backgroundColor: '#FFFFFF',
                                }}
                            />
                        </View>
                    </Animated.View>
                );
            })}
        </View>
    );
};

const LoginScreen = () => {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [loading, setLoading] = useState(true);
    const [loggingIn, setLoggingIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const navigation = useNavigation();
    
    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const logoRotation = useRef(new Animated.Value(0)).current;
    // Ondas sectoriales (izquierda y derecha, 3 fases cada una)
    const waveLeft = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];
    const waveRight = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const loginData = await AsyncStorage.getItem('@loginData');
                if (loginData) {
                    const parsedData = JSON.parse(loginData);
    
                    // Validar que los datos sean correctos antes de redirigir
                    if (parsedData && parsedData.token) {
                        redirigirUsuario(parsedData);
                    } else {
                        console.warn('Datos de inicio de sesión incompletos o inválidos');
                    }
                }
            } catch (error) {
                console.error('Error al verificar el estado de inicio de sesión:', error);
            } finally {
                setLoading(false);
                // Iniciar animaciones cuando termine la carga
                startAnimations();
            }
        };
    
        checkLoginStatus();
    }, []);
    
    const startAnimations = () => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
                useNativeDriver: true,
            }),
        ]).start();
        
        // Animación continua del logo
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoRotation, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(logoRotation, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Ondas sectoriales: ráfagas transparentes que se desvanecen
        const phaseDelays = [0, 300, 600];
        waveLeft.forEach((op, i) => {
            op.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.delay(phaseDelays[i]),
                    Animated.timing(op, { toValue: 1, duration: 0, useNativeDriver: false }),
                    Animated.timing(op, {
                        toValue: 0,
                        duration: 1400,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        });
        waveRight.forEach((op, i) => {
            op.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.delay(phaseDelays[i]),
                    Animated.timing(op, { toValue: 1, duration: 0, useNativeDriver: false }),
                    Animated.timing(op, {
                        toValue: 0,
                        duration: 1400,
                        easing: Easing.out(Easing.quad),
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        });
    };
    
    const redirigirUsuario = (data) => {
        // console.log('Datos de inicio de sesión:', data);
        console.log('Datos de inicio de sesión:', JSON.stringify(data, null, 2));

        const { nivel_usuario, isp } = data;

        switch (nivel_usuario) {
            case 'MEGA ADMINISTRADOR':
                navigation.navigate('Main', { data });
                break;
            case 'SUPER ADMINISTRADOR':
                navigation.navigate('IspListScreen');
                break;
            case 'ADMINISTRADOR':
            case 'OPERADOR':
                if (isp) {
                    navigation.navigate('IspDetailsScreen', { isp: data });
                } else {
                    Alert.alert('Error', 'No se encontró información de ISP para este usuario.');
                }
                break;
            case 'CLIENTE':
                navigation.navigate('ClientDetailsScreen');
                break;
            default:
                Alert.alert('Error', 'No tienes permisos para acceder a esta aplicación.');
                break;
        }
    };


    const handleLogin = async () => {
        if (!usuario.trim() || !contrasena.trim()) {
            Alert.alert('⚠️ Campos requeridos', 'Por favor, introduce tu usuario y contraseña.');
            return;
        }
    
        try {
            setLoggingIn(true);
            
            const response = await axios.post(
                'https://wellnet-rd.com:444/api/usuarios/login',
                { usuario, contrasena }
            );
    
            if (response.data.success) {
                // Almacenar los datos necesarios en AsyncStorage
                await AsyncStorage.setItem('@loginData', JSON.stringify(response.data));
    
                // Recuperar y mostrar en consola los datos guardados
                const savedData = await AsyncStorage.getItem('@loginData');
                console.log('Datos almacenados en AsyncStorage:', JSON.stringify(JSON.parse(savedData), null, 2));
    
                // Animación de éxito antes de redirigir
                await new Promise(resolve => {
                    Animated.sequence([
                        Animated.timing(scaleAnim, {
                            toValue: 1.1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scaleAnim, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]).start(resolve);
                });
                
                // Redirigir según los permisos
                redirigirUsuario(response.data);
            } else {
                Alert.alert(
                    '❌ Error de Inicio de Sesión',
                    response.data.error || 'Credenciales incorrectas'
                );
            }
        } catch (error) {
            const errorMessage = error.response
                ? error.response.data.error
                : 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            Alert.alert('🌐 Error de Conexión', errorMessage);
            console.error('Error al realizar la petición:', error);
        } finally {
            setLoggingIn(false);
        }
    };
    

    const logoRotationStyle = {
        transform: [{
            rotate: logoRotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
            })
        }]
    };

    if (loading) {
        return (
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <Animated.View style={[styles.loadingContainer, logoRotationStyle]}>
                    <Icon name="wifi" size={60} color="rgba(255, 255, 255, 0.9)" />
                </Animated.View>
                <Text style={styles.loadingText}>Cargando...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {/* Líneas animadas de fondo */}
            <AnimatedLines style={styles.animatedLinesContainer} />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <Animated.View 
                    style={[
                        styles.contentContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { translateY: slideAnim },
                                { scale: scaleAnim }
                            ]
                        }
                    ]}
                >
                    {/* Torre de Antena (estática, sin animaciones) */}
                    <View style={styles.logoContainer}>
                        <Svg width={140} height={120} viewBox="0 0 140 120">
                            {/* Base */}
                            <Rect x="55" y="100" width="30" height="6" fill="#4a5568" rx="2" />
                            {/* Patas laterales */}
                            <Path d="M45 100 L70 20 L95 100" stroke="#cbd5e1" strokeWidth="4" fill="none" />
                            {/* Traviesas en X */}
                            <Line x1="52" y1="96" x2="88" y2="84" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="88" y1="96" x2="52" y2="84" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="50" y1="78" x2="90" y2="66" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="90" y1="78" x2="50" y2="66" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="48" y1="60" x2="92" y2="48" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="92" y1="60" x2="48" y2="48" stroke="#94a3b8" strokeWidth="2" />
                            {/* Columna central */}
                            <Line x1="70" y1="22" x2="70" y2="100" stroke="#e2e8f0" strokeWidth="3" />
                            {/* Punta */}
                            <Rect x="68.5" y="14" width="3" height="8" fill="#e2e8f0" rx="1" />

                            {/* Brazos de soporte a antenas sectoriales */}
                            <Line x1="70" y1="30" x2="56" y2="32" stroke="#94a3b8" strokeWidth="2" />
                            <Line x1="70" y1="30" x2="84" y2="32" stroke="#94a3b8" strokeWidth="2" />

                            {/* Antena sectorial izquierda (vertical) */}
                            <G>
                                {/* Panel externo (centrado en 50,30) */}
                                <Rect x="44" y="18" width="12" height="24" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" transform="rotate(-18 50 30)" />
                                {/* Panel interno */}
                                <Rect x="46" y="20" width="8" height="20" rx="2" fill="#cbd5e1" transform="rotate(-18 50 30)" />
                            </G>

                            {/* Antena sectorial derecha (vertical) */}
                            <G>
                                {/* Panel externo (centrado en 90,30) */}
                                <Rect x="84" y="18" width="12" height="24" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" transform="rotate(18 90 30)" />
                                {/* Panel interno */}
                                <Rect x="86" y="20" width="8" height="20" rx="2" fill="#cbd5e1" transform="rotate(18 90 30)" />
                            </G>

                            {/* Ondas sectoriales (izquierda): mayor cobertura (230°→280°) y más alcance */}
                            <AnimatedPath
                                d={describeArc(50, 30, 24, 230, 280)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.6"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveLeft[0]}
                            />
                            <AnimatedPath
                                d={describeArc(50, 30, 34, 230, 280)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.45"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveLeft[1]}
                            />
                            <AnimatedPath
                                d={describeArc(50, 30, 48, 230, 280)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.3"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveLeft[2]}
                            />

                            {/* Ondas sectoriales (derecha): mayor cobertura (80°→130°) y más alcance */}
                            <AnimatedPath
                                d={describeArc(90, 30, 24, 80, 130)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.6"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveRight[0]}
                            />
                            <AnimatedPath
                                d={describeArc(90, 30, 34, 80, 130)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.45"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveRight[1]}
                            />
                            <AnimatedPath
                                d={describeArc(90, 30, 48, 80, 130)}
                                stroke="#e2e8f0"
                                strokeOpacity="0.3"
                                strokeWidth="2"
                                fill="none"
                                opacity={waveRight[2]}
                            />
                        </Svg>
                    </View>
                    
                    {/* Logo de la empresa */}
                    <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
                        <Image
                            source={require('../images/logo-well_technologies.png')}
                            style={styles.companyLogo}
                            resizeMode="contain"
                        />
                        <Text style={styles.subtitle}>Sistema de Gestión ISP</Text>
                    </Animated.View>

                    {/* Formulario de Login */}
                    <View style={styles.formContainer}>
                        {/* Campo Usuario */}
                        <Animated.View style={[
                            styles.inputContainer,
                            focusedInput === 'usuario' && styles.inputContainerFocused
                        ]}>
                            <Icon name="person" size={24} color={focusedInput === 'usuario' ? '#667eea' : '#888'} />
                            <TextInput
                                style={styles.input}
                                placeholder="Usuario"
                                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                value={usuario}
                                onChangeText={setUsuario}
                                autoCapitalize="none"
                                onFocus={() => setFocusedInput('usuario')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </Animated.View>

                        {/* Campo Contraseña */}
                        <Animated.View style={[
                            styles.inputContainer,
                            focusedInput === 'contrasena' && styles.inputContainerFocused
                        ]}>
                            <Icon name="lock" size={24} color={focusedInput === 'contrasena' ? '#667eea' : '#888'} />
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                                value={contrasena}
                                onChangeText={setContrasena}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                onFocus={() => setFocusedInput('contrasena')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <Icon 
                                    name={showPassword ? "visibility" : "visibility-off"} 
                                    size={24} 
                                    color="#888" 
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Botón de Login */}
                        <TouchableOpacity
                            style={[styles.loginButton, loggingIn && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={loggingIn}
                        >
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.loginButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loggingIn ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Icon name="login" size={24} color="white" />
                                        <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                        <Text style={styles.footerText}>
                            © 2025 Well Technologies
                        </Text>
                        <Text style={styles.versionText}>
                            ISP Core v2.0
                        </Text>
                    </Animated.View>
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    animatedLinesContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'visible',
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        zIndex: 2,
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height * 0.8,
    },
    loadingContainer: {
        padding: 20,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 20,
    },
    loadingText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyLogo: {
        width: 280,
        height: 80,
        marginBottom: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '400',
    },
    formContainer: {
        width: '100%',
        maxWidth: 380,
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    inputContainerFocused: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        transform: [{ scale: 1.02 }],
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: 'white',
        paddingVertical: 16,
        paddingHorizontal: 16,
        fontWeight: '500',
    },
    eyeButton: {
        padding: 4,
    },
    loginButton: {
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 30,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 12,
        letterSpacing: 1,
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    versionText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
        marginTop: 4,
    },
});

export default LoginScreen;
