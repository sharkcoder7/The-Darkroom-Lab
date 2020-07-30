
/*export function openUrl (url)
{
    utils.Linking.canOpenURL(url).then(supported =>
    {
        if (supported)
        {
            utils.Linking.openURL(url);
        }
        else
        {
            console.log("Don't know how to open URI: " + url);
        }
    });
}*/

export const SharedUtils =
{
    lazyLoadedModules : {
    },

    get Share ()
    {
        if (!this.lazyLoadedModules["Share"])
        {
            this.lazyLoadedModules["Share"] = require('react-native-share').default;
        }

        return this.lazyLoadedModules["Share"];
    },

};

/*
export async function onShare ()
{
    try
    {
        const result = await utils.Share.share({message: translate("shareText1") + translate("shareText2"),});

        if (result.action === utils.Share.sharedAction)
        {
            firebase.analytics().logEvent('appShared');

            if (result.activityType)
            {
            }
            else
            {
            }
        }
        else if (result.action === utils.Share.dismissedAction)
        {
        }
    }
    catch (error)
    {
        console.log(error);
    }
}

export async function onRate ()
{
    const options = {
        AppleAppID:"1284518530",
        GooglePackageName:"com.pairscrossplatform",
        preferredAndroidMarket: utils.AndroidMarket.Google,
        preferInApp: false,
        openAppStoreIfInAppFails: true,
        fallbackPlatformURL:"https://какая-пара.рф",
    };

    utils.Rate.rate(options, success => {
        if (success)
        {
            firebase.analytics().logEvent('appRate');
        }
    })
}*/
