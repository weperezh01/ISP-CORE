import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useTheme } from '../../ThemeContext';

const DatePickerComponent = ({ visible, onClose, onDateSelected }) => {
    const { isDarkMode } = useTheme();
    const styles = getStyles(isDarkMode);

    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

    const handleSelectDate = () => {
        const formattedDate = `${String(selectedDay).padStart(2, '0')}-${String(selectedMonth).padStart(2, '0')}-${selectedYear}`;
        onDateSelected(formattedDate);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.dateInputs}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Día</Text>
                            <TextInput
                                style={styles.input}
                                value={String(selectedDay)}
                                onChangeText={(text) => {
                                    const day = parseInt(text, 10);
                                    if (day >= 1 && day <= new Date(selectedYear, selectedMonth, 0).getDate()) {
                                        setSelectedDay(day);
                                    }
                                }}
                                keyboardType="numeric"
                                placeholder="Día"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Mes</Text>
                            <TextInput
                                style={styles.input}
                                value={String(selectedMonth)}
                                onChangeText={(text) => {
                                    const month = parseInt(text, 10);
                                    if (month >= 1 && month <= 12) {
                                        setSelectedMonth(month);
                                    }
                                }}
                                keyboardType="numeric"
                                placeholder="Mes"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Año</Text>
                            <TextInput
                                style={styles.input}
                                value={String(selectedYear)}
                                onChangeText={(text) => {
                                    const year = parseInt(text, 10);
                                    setSelectedYear(year);
                                }}
                                keyboardType="numeric"
                                placeholder="Año"
                                placeholderTextColor={isDarkMode ? '#aaa' : '#666'}
                            />
                        </View>
                    </View>
                    <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerColumn}>
                            <FlatList
                                data={days}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setSelectedDay(item)}>
                                        <Text style={styles.datePickerItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                snapToAlignment="center"
                                snapToInterval={30}
                                decelerationRate="fast"
                                contentContainerStyle={styles.datePickerContentContainer}
                            />
                        </View>
                        <View style={styles.datePickerColumn}>
                            <FlatList
                                data={months}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setSelectedMonth(item)}>
                                        <Text style={styles.datePickerItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                snapToAlignment="center"
                                snapToInterval={30}
                                decelerationRate="fast"
                                contentContainerStyle={styles.datePickerContentContainer}
                            />
                        </View>
                        <View style={styles.datePickerColumn}>
                            <FlatList
                                data={years}
                                keyExtractor={(item) => item.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => setSelectedYear(item)}>
                                        <Text style={styles.datePickerItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                snapToAlignment="center"
                                snapToInterval={30}
                                decelerationRate="fast"
                                contentContainerStyle={styles.datePickerContentContainer}
                            />
                        </View>
                    </View>
                </View>
                    <Button title="Seleccionar Fecha" onPress={handleSelectDate} />
            </View>
        </Modal>
    );
};

const getStyles = (isDarkMode: boolean) => StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: isDarkMode ? '#333' : '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    dateInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    inputWrapper: {
        width: '30%',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 8,
        padding: 8,
        borderRadius: 4,
        backgroundColor: isDarkMode ? '#333' : '#fff',
        color: isDarkMode ? '#fff' : '#000',
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: isDarkMode ? '#fff' : '#000',
        textAlign: 'center',
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        // paddingBottom: 50,
    },
    datePickerColumn: {
        width: '30%',
        height: Dimensions.get('window').height * 0.20,
        // marginBottom:50,
    },
    datePickerItem: {
        padding: 10,
        fontSize: 18,
        textAlign: 'center',
        color: isDarkMode ? '#fff' : '#000',
    },
    datePickerContentContainer: {
        alignItems: 'center',
        paddingBottom: 50,
    },
});

export default DatePickerComponent;
