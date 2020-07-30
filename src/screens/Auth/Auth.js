import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
    SafeAreaView,
    Text,
    StyleSheet,
    Platform,
    ImageBackground,
    View,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";
import {Button} from '../../components/Button';
import {useRequest} from '../../helper';
import {setToken} from '../../ducks/main';
import {customBackButtonHeaderProps} from '../../components/BackButton';

export default function Auth ({route, navigation})
{
    const { mode } = route.params;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const passwordInput = useRef();
    const {request, loading, error} = useRequest();

    useLayoutEffect(() => {
        navigation.setOptions({
            ...customBackButtonHeaderProps('Back')
        });
    }, [navigation]);

    useEffect(() =>
    {

    }, []);

    async function submit ()
    {
        if (email === '' || password === '')
        {
            return ;
        }

        try
        {
            const response = await request(`/auth/${mode === 'SignIn' ? 'signIn' : 'signUp'}`, {method : "POST", body : JSON.stringify({email, password})});
            setToken(response);
            navigation.navigate('Albums');
        }
        catch (e)
        {
            alert('error:' + JSON.stringify(e));
        }
    }

    return (
        <LinearGradient colors={['#474042', '#000']} style={styles.gradient}>
            <ImageBackground source={require('../../assets/textured_background.png')} style={styles.image}>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrapper}>

                    <Text style={styles.header}>{mode === 'SignUp' ? 'Fill in info to Register' : 'Fill in info to Login'}</Text>

                    <TextInput style={styles.input}
                               onSubmitEditing={() => { passwordInput.current.focus(); }}
                               blurOnSubmit={false}
                               placeholderTextColor="#999"
                               textContentType="emailAddress"
                               keyboardType="email-address"
                               returnKeyType="next"
                               onChangeText={setEmail}
                               autoCapitalize = 'none'
                               placeholder={"Email"}/>

                    <TextInput style={styles.input}
                               onSubmitEditing={submit}
                               ref={passwordInput}
                               placeholderTextColor="#999"
                               textContentType="password"
                               returnKeyType="done"
                               onChangeText={setPassword}
                               secureTextEntry={true}
                               autoCapitalize = 'none'
                               placeholder={"Password"}/>

                    <Button style={styles.button} text={mode === 'SignUp' ? 'Register' : 'Login'} onPress={submit}/>

                </KeyboardAvoidingView>

            </ImageBackground>
        </LinearGradient>
    )
}


const styles = StyleSheet.create({
    gradient : {
        flex: 1
    },
    image: {
        flex: 1,
        paddingHorizontal: 20
    },
    header : {
        color: 'white',
        fontSize: 16,
        marginBottom: 40
    },
    wrapper : {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -60
    },
    input : {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 20,
        fontSize: 16,
        backgroundColor : '#33333380',
        borderWidth: 1,
        borderColor: '#999',
        marginBottom: 10,
        color: '#fff'
    },
    button : {
        marginTop: 25
    }
});
