import React from "react";
import {View, Text, StyleSheet } from 'react-native';

function Vacio(props){
    return(
        <View>
            <Text style={styles.text} >{props.text} </Text>
        </View>
    )
}

const styles= StyleSheet.create({
    text:{
        fontSize:20
    }
})

export default Vacio;