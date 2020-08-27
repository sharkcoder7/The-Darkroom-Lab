/*import { Appearance } from 'react-native-appearance'*/

/*const osTheme = Appearance.getColorScheme();*/

export const hitSlop = {top: 10, bottom: 10, left: 10, right: 10};

export const ThemeColors = {
    primaryText: {
        light: 'black',
        dark: 'white',
    },
    backgroundColor: {
        light: '#fff',
        dark: '#403a3b',
    },
};

export const getTheme = (mode) => {
    let Theme = {};
    for (let key in ThemeColors) {
        Theme[key] = ThemeColors[key][mode];
    }
    return Theme;
};
