import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';
import { AndroidNotificationPriority } from 'expo-notifications';
const baseNotificationRequestInput = {
    identifier: '',
    content: {
        title: '',
        body: '',
        vibrate: [250],
        priority: AndroidNotificationPriority.HIGH,
        sticky: false
    },
    trigger: {
        channelId: ''
    }
};
function initBaseNotificationRequestInput(filename, channelId) {
    let baseNotificationRI = {
        ...baseNotificationRequestInput,
        content: {
            ...baseNotificationRequestInput.content,
            title: filename
        },
        trigger: {
            channelId,
            seconds: 1,
            repeats: false
        }
    };
    return baseNotificationRI;
}
function getNotifParams(baseNotificationRI, nState, nContent) {
    let identifier = '';
    let body = '';
    let sticky = false;
    let customNotifContent = {};
    switch (nState) {
        case 'downloading':
            identifier = `dl${baseNotificationRI.content.title}`;
            body = 'Downloading...';
            sticky = true;
            if (nContent !== undefined)
                customNotifContent = nContent.downloading;
            break;
        case 'finished':
            identifier = `fin${baseNotificationRI.content.title}`;
            body = 'Completed!';
            sticky = false;
            if (nContent !== undefined)
                customNotifContent = nContent.finished;
            break;
        case 'error':
            identifier = `err${baseNotificationRI.content.title}`;
            body = 'Failed to download';
            sticky = false;
            if (nContent !== undefined)
                customNotifContent = nContent.error;
            break;
        default:
            break;
    }
    return {
        ...baseNotificationRI,
        identifier,
        content: {
            ...baseNotificationRI.content,
            body,
            sticky,
            ...customNotifContent
        }
    };
}
async function dismissAndShowErr(notifToDismissId, errNotificationRI) {
    if (notifToDismissId !== undefined) {
        await Notifications.dismissNotificationAsync(notifToDismissId);
    }
    await Notifications.scheduleNotificationAsync(errNotificationRI);
    return;
}
// NOTE: This function assumes permissions have been granted and does not
// take responsibilty for whether permissions are granted or not
// IT WILL SILENTLY FAIL IF YOU DON'T REQUEST AND GET CAMERA_ROLL permissions
export async function downloadToFolder(uri, filename, folder, channelId, notificationType, notificationContent) {
    let baseNotificationRI = initBaseNotificationRequestInput(filename, channelId);
    const customNotifContent = notificationType && notificationType.notification === 'custom' ? notificationContent : undefined;
    const skipNotifications = notificationType && notificationType.notification === 'none';
    const dlNotificationRI = getNotifParams(baseNotificationRI, "downloading", customNotifContent);
    const errNotificationRI = getNotifParams(baseNotificationRI, "error", customNotifContent);
    const finNotificationRI = getNotifParams(baseNotificationRI, "finished", customNotifContent);
    if (!skipNotifications)
        await Notifications.scheduleNotificationAsync(dlNotificationRI);
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    const downloadedFile = await FileSystem.downloadAsync(uri, fileUri);
    if (downloadedFile.status != 200) {
        if (!skipNotifications)
            await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
        return false;
    }
    try {
        const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
        const album = await MediaLibrary.getAlbumAsync(folder);
        if (album == null) {
            await MediaLibrary.createAlbumAsync(folder, asset, false);
        }
        else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        }
    }
    catch (e) {
        if (!skipNotifications)
            await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
        return false;
    }
    if (skipNotifications) {
        return true;
    }
    else {
        if (dlNotificationRI.identifier !== undefined) {
            await Notifications.dismissNotificationAsync(dlNotificationRI.identifier);
        }
        await Notifications.scheduleNotificationAsync(finNotificationRI);
        return true;
    }
}
//# sourceMappingURL=index.js.map