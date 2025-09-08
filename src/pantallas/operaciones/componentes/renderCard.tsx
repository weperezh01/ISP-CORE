// src/screens/IspDetailsScreen/componentes/renderCard.js
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const renderCard = (item, navigation, styles, extraElement, tienePermiso, getColorForButton) => {
    // Verifica si el usuario tiene permiso para este ítem
    if (!tienePermiso(item.permiso)) return null;

    return (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.cardContainer,
                { backgroundColor: getColorForButton(item.id) },
            ]}
            onPress={() => {
                // Si tiene la prop "action", úsala; si no, navega
                if (item.action) {
                    item.action();
                } else {
                    navigation.navigate(item.screen, item.params);
                }
            }}
        >
            <View style={styles.cardContent}>
                {/* Icono */}
                <Icon name={item.icon} size={30} color="#fff" style={styles.cardIcon} />
                
                {/* Título */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Extra Element (ej. conexiones en avería) si aplica */}
                {item.id === '7' && extraElement && (
                    <View style={styles.extraContent}>{extraElement}</View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const CardButtonLayout = ({
    botonesData,
    navigation,
    styles,
    extraElement,
    tienePermiso,
    getColorForButton,
}) => {
    return (
        <FlatList
            data={botonesData}
            keyExtractor={(item) => item.id}
            numColumns={2} // Cambia a 3 o más según tu gusto
            contentContainerStyle={styles.cardsGrid}
            renderItem={({ item }) =>
                renderCard(item, navigation, styles, extraElement, tienePermiso, getColorForButton)
            }
        />
    );
};

export default CardButtonLayout;
