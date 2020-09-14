import React, {useEffect, useRef, useState} from 'react';
import {
    ImageBackground,
    Text,
    StyleSheet,
    View,
    TouchableOpacity, TextInput, Platform,
} from 'react-native';
import SplashScreen from "react-native-splash-screen";
import LinearGradient from 'react-native-linear-gradient';
import {Button} from '../components/Button';
import {useRequest} from '../helper';
import {setToken} from '../ducks/main';
import {BestLabSeal, OrderPromo, YearsOfQuality} from '../components/icons';
import {openUrl, SharedUtils} from '../shared';
import BottomSheet from 'reanimated-bottom-sheet'
import {SheetHeader} from '../components/SheetHeader';
import {SheetBody} from '../components/SheetBody';
import analytics from '@react-native-firebase/analytics';
import * as DeviceInfo from 'react-native-device-info';

export default function Welcome ({navigation})
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const passwordInput = useRef();
    const bottomSheetEl = useRef();
    const {request, loading} = useRequest();

    useEffect(() =>
    {

    }, []);

    useEffect(() =>
    {
        setTimeout(() => SplashScreen.hide(), 50);
    }, []);

    async function submit ()
    {
        if (email === '' || password === '')
        {
            return ;
        }

        try
        {
            const deviceId = Platform.OS + ' ' + DeviceInfo.getUniqueId();
            const token = await request(`/auth/signIn`, {withAuth : false, method : "POST", body : JSON.stringify({email, password, device_name : deviceId})});
            setToken(token);
            navigation.replace('Albums');
            analytics().logEvent('signIn', {email});
        }
        catch (e)
        {
            SharedUtils.Alert.alert('The Darkroom Lab', 'Incorrect username or password',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                {cancelable: false},
            );
        }
        finally
        {

        }
    }

    function openForgotPasswordPage () {
        openUrl('https://thedarkroom.com/shop/my-account/lost-password/');
    }

    function openRegistrationSheet ()
    {
        bottomSheetEl.current.snapTo(1);
    }

    function renderHeader()
    {
        return <SheetHeader title="Register" onPress={() => bottomSheetEl.current.snapTo(0)}/>;
    }

    function renderContent ()
    {
        return (
            <SheetBody>
                <Text style={[styles.firstLine, styles.text]}>This application is a gallery for customers that have placed and order.</Text>
                <Text style={styles.text}>
                    If you don't have an account, you can register at <Text onPress={() => openUrl('https://thedarkmoon.com')} style={styles.linkInText}>thedarkmoon.com</Text>
                </Text>
                <View style={styles.registerIconWrapper}>
                    <OrderPromo style={styles.registerIcon}/>
                </View>
            </SheetBody>
        );
    }

    return (
        <React.Fragment>
                <LinearGradient colors={['#474042', '#000']} style={styles.gradient}>
                <ImageBackground source={require('../assets/textured_background.png')} style={styles.image}>

                    <View style={styles.wrapper}>
                        <View></View>

                        <View style={styles.buttonsWrapper}>
                            <Text style={styles.header}>Login</Text>

                            <TextInput style={styles.input}
                                       onSubmitEditing={() => { passwordInput.current.focus(); }}
                                       blurOnSubmit={false}
                                       placeholderTextColor="#fff"
                                       textContentType="emailAddress"
                                       keyboardType="email-address"
                                       returnKeyType="next"
                                       onChangeText={setEmail}
                                       autoCapitalize='none'
                                       textAlign={'center'}
                                       placeholder={"Username or email address"}/>

                            <TextInput style={styles.input}
                                       onSubmitEditing={submit}
                                       ref={passwordInput}
                                       placeholderTextColor="#fff"
                                       textContentType="password"
                                       returnKeyType="done"
                                       onChangeText={setPassword}
                                       secureTextEntry={true}
                                       autoCapitalize = 'none'
                                       textAlign={'center'}
                                       placeholder={"Password"}/>


                               <Button disabled={loading} text={loading ? 'Wait...' : 'Submit'} onPress={submit} style={[styles.button, {opacity : loading ? 0.7 : 1}]}/>

                               <TouchableOpacity onPress={openForgotPasswordPage} style={styles.link}>
                                   <Text style={styles.linkText}>Forgot Password</Text>
                               </TouchableOpacity>

                                <TouchableOpacity onPress={openRegistrationSheet} style={styles.link}>
                                    <Text style={styles.linkText}>Don't have an account?</Text>
                                </TouchableOpacity>
                        </View>

                        <View style={styles.bulletsWrapper}>
                            <View style={styles.bullet}>
                                <YearsOfQuality style={styles.bulletIcon}/>
                                <Text style={styles.bulletText}>40+ Years of Quality</Text>
                                <Text style={styles.bulletText}>Photo Developing</Text>
                            </View>
                            <View style={styles.bullet}>
                                <BestLabSeal style={styles.bulletIcon}/>
                                <Text style={styles.bulletText}>Voted Best Photo Lab</Text>
                                <Text style={styles.bulletText}>In an Independent User Poll</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </LinearGradient>
            <BottomSheet
                ref={bottomSheetEl}
                initialSnap={0}
                snapPoints={[0, 400]}
                renderContent={renderContent}
                renderHeader={renderHeader}
            />
        </React.Fragment>
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
        fontSize: 24,
        marginBottom: 20
    },
    bulletsWrapper : {
        flexDirection : 'row',
        justifyContent: 'space-between',
        paddingHorizontal : 20
    },
    bullet : {
        alignItems : 'center',
        marginBottom: 30
    },
    bulletText : {
        color: '#999',
        fontSize: 12
    },
    bulletIcon : {
        marginBottom : 15,
        transform: [{ scale: 1.2 }]
    },
    input : {
        width: '100%',
        paddingHorizontal: 10,
        paddingVertical: 20,
        fontSize: 18,
        backgroundColor : '#00000050',
        borderWidth: 1,
        borderColor: '#999',
        marginBottom: 10,
        color: '#fff'
    },
    button : {
        marginTop: 15
    },
    link : {
        marginTop: 25
    },
    linkText : {
        color: '#3e9d99',
        fontSize: 16
    },
    firstLine : {
        marginBottom: 15
    },
    text : {
        fontSize: 16,
        color: '#97989a'
    },
    linkInText : {
        color: '#3e9d99',
    },
    registerIconWrapper : {
        alignItems : 'center',
        marginTop: 30
    },
    registerIcon : {
    }
});
