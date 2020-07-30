import React, {useEffect} from 'react';
import {
    ImageBackground,
    Text,
    StyleSheet,
    Image,
    View,
    TouchableOpacity
} from 'react-native';
import SplashScreen from "react-native-splash-screen";
import LinearGradient from 'react-native-linear-gradient';
import {Button} from '../../components/Button';

export default function Welcome ({navigation})
{
    useEffect(() =>
    {

    }, []);

    useEffect(() =>
    {
        setTimeout(() => SplashScreen.hide(), 50);
    }, []);

    function toSignIn ()
    {
        navigation.navigate('Auth', {mode : "SignIn"});
    }

    function toSignUp ()
    {
        navigation.navigate('Auth', {mode : "SignUp"});
    }

    return (
        <LinearGradient colors={['#474042', '#000']} style={styles.gradient}>
            <ImageBackground source={require('../../assets/textured_background.png')} style={styles.image}>

                <View style={styles.wrapper}>
                    <View></View>

                    <View style={styles.buttonsWrapper}>
                        <Text style={styles.header}>Welcome to The DarkRoom</Text>

                        <Button text="Login" onPress={toSignIn}/>

                        <Button text="Register" onPress={toSignUp}/>

                    </View>

                    <View>
                        <View style={styles.bullet}>
                            <Image style={[{height : 35, aspectRatio : 0.975}, styles.bulletIcon]} source={require('../../assets/40years.png')}/>
                            <Text style={styles.bulletText}>40+ Years of Quality</Text>
                            <Text style={styles.bulletText}>Photo Developing</Text>
                        </View>
                        <View style={styles.bullet}>
                            <Image style={[{height : 35, aspectRatio : 1.21}, styles.bulletIcon]} source={require('../../assets/best.png')}/>
                            <Text style={styles.bulletText}>Voted Best Photo Lab</Text>
                            <Text style={styles.bulletText}>In an Independent User Poll</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </LinearGradient>
    )
}


const styles = StyleSheet.create({
    wrapper : {
        flex: 1,
        resizeMode: "cover",
        justifyContent: 'space-between'
    },
    gradient : {
        flex: 1
    },
    image: {
        flex: 1,
    },
    buttonsWrapper : {
        alignItems : 'center',
        marginTop: 50,
        width: '100%',
        paddingHorizontal: 20
    },
    header : {
        color: 'white',
        fontSize: 16,
        marginBottom: 40
    },
    bullet : {
        alignItems : 'center',
        marginBottom: 30
    },
    bulletText : {
        color: '#999',
        fontSize: 13
    },
    bulletIcon : {
        marginBottom : 10
    }
});
