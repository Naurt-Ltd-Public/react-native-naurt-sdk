import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import notifee, { AndroidColor } from '@notifee/react-native';
import { NaurtPoint, NaurtRN } from 'react-native-naurt-sdk';

async function onDisplayNotification() {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
        id: 'location_service',
        name: 'Naurt Channel',
    });

    notifee.registerForegroundService(() => {
        return new Promise(() => {


            let naurt = new NaurtRN("4162b2e0-bc9d-4f7f-b9e8-ba75adcc85a2-7bdc58c5-b4ca-409d-8368-092a7ae88654", "standalone");

            console.log(naurt)
            let naurtEventEmitter = naurt.getEventEmitter();

            console.log("naurtEventEmitter: " + naurtEventEmitter)


            var eventListener = naurtEventEmitter.addListener("naurtDidUpdateLocation", (event) => {
                if (event === false) {
                    console.log("Got a null update (maybe indoors, not converged &c)");
                } else {
                    // You can parse with JSON
                    // let naurtData = JSON.parse(event);

                    // Or you can use the interface
                    let naurtInterface = event as NaurtPoint;
                    console.log(naurtInterface);

                    // setLatitude(naurtData.latitude);
                    // setLongitude(naurtData.longitude);
                }
            });

            naurtEventEmitter.addListener("naurtDidUpdateValidation", (event) => {
                console.log("Validated :" + event)
            });

            naurtEventEmitter.addListener("naurtDidUpdateAnalyticsSession", (event) => {
                console.log("Analytics Session updated: " + event)
            });
            // Long running task...
            var x = 0;
            setInterval(() => { x += 1; console.log("Hi, iter " + x); console.log(eventListener) }, 1000)



        });
    });
    // Display a notification
    notifee.displayNotification({
        title: 'Naurt Example Foreground service',
        body: 'Naurt',
        android: {
            channelId,
            asForegroundService: true,
            color: AndroidColor.RED,
            colorized: true,
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
                id: 'default',
            },
        },
    });


}
onDisplayNotification().then(() => console.log("Running notification"));

AppRegistry.registerComponent(appName, () => App);