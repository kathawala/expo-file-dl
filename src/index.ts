import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import {
  AndroidNotificationPriority,
  NotificationContentInput,
  NotificationRequestInput,
} from "expo-notifications";
import { Platform } from "react-native";

const ios = Platform.OS === "ios";
const imageFileExts = [
  "jpg",
  "jpeg",
  "tiff",
  "tif",
  "raw",
  "dng",
  "png",
  "gif",
  "bmp",
  "heic",
  "webp",
];

export type EFDL_NotificationType = {
  notification: "managed" | "custom" | "none";
};

export type EDFL_NotificationContent = {
  downloading: NotificationContentInput;
  finished: NotificationContentInput;
  error: NotificationContentInput;
};

export interface EFDL_Options {
  notificationType?: EFDL_NotificationType;
  notificationContent?: EDFL_NotificationContent;
  downloadProgressCallback?: FileSystem.DownloadProgressCallback;
}

export type EDFL_NotificationState = "downloading" | "finished" | "error";

const baseNotificationRequestInput: NotificationRequestInput = {
  identifier: "",
  content: {
    title: "",
    body: "",
    vibrate: [250],
    priority: AndroidNotificationPriority.HIGH,
    autoDismiss: true,
    sticky: false,
  },
  trigger: {
    channelId: "",
  },
};

function initBaseNotificationRequestInput(
  filename: string,
  channelId: string
): NotificationRequestInput {
  let baseNotificationRI = {
    ...baseNotificationRequestInput,
    content: {
      ...baseNotificationRequestInput.content,
      title: filename,
    },
    trigger: {
      channelId,
      seconds: 1,
      repeats: false,
    },
  };
  return baseNotificationRI;
}

function getNotifParams(
  baseNotificationRI: NotificationRequestInput,
  nState: EDFL_NotificationState,
  nContent?: EDFL_NotificationContent
): NotificationRequestInput {
  let identifier = "";
  let body = "";
  let sticky = false;
  let customNotifContent: NotificationContentInput = {};
  switch (nState) {
    case "downloading":
      identifier = `dl${baseNotificationRI.content.title}`;
      body = "Downloading...";
      sticky = true;
      if (nContent !== undefined) customNotifContent = nContent.downloading;
      break;
    case "finished":
      identifier = `fin${baseNotificationRI.content.title}`;
      body = "Completed!";
      sticky = false;
      if (nContent !== undefined) customNotifContent = nContent.finished;
      break;
    case "error":
      identifier = `err${baseNotificationRI.content.title}`;
      body = "Failed to download";
      sticky = false;
      if (nContent !== undefined) customNotifContent = nContent.error;
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
      ...customNotifContent,
    },
  };
}

async function dismissAndShowErr(
  notifToDismissId: string | undefined,
  errNotificationRI: NotificationRequestInput
): Promise<void> {
  if (notifToDismissId !== undefined) {
    await Notifications.dismissNotificationAsync(notifToDismissId);
  }
  await Notifications.scheduleNotificationAsync(errNotificationRI);
  return;
}

async function downloadFile(
  uri: string,
  fileUri: string,
  downloadProgressCallback?: FileSystem.DownloadProgressCallback
) {
  if (downloadProgressCallback) {
    const downloadResumable = FileSystem.createDownloadResumable(
      uri,
      fileUri,
      {},
      downloadProgressCallback!
    );
    return await downloadResumable.downloadAsync();
  } else {
    return await FileSystem.downloadAsync(uri, fileUri);
  }
}

// NOTE: This function assumes permissions have been granted and does not
// take responsibilty for whether permissions are granted or not
// IT WILL SILENTLY FAIL IF YOU DON'T REQUEST AND GET MEDIA_LIBRARY permissions
export async function downloadToFolder(
  uri: string,
  filename: string,
  folder: string,
  channelId: string,
  options?: EFDL_Options
): Promise<boolean> {
  let baseNotificationRI: NotificationRequestInput = initBaseNotificationRequestInput(
    filename,
    channelId
  );
  const customNotifContent =
    options &&
    options.notificationType &&
    options.notificationType.notification === "custom"
      ? options.notificationContent
      : undefined;
  const skipNotifications =
    options &&
    options.notificationType &&
    options.notificationType.notification === "none";
  const dlNotificationRI: NotificationRequestInput = getNotifParams(
    baseNotificationRI,
    "downloading",
    customNotifContent
  );
  const errNotificationRI: NotificationRequestInput = getNotifParams(
    baseNotificationRI,
    "error",
    customNotifContent
  );
  const finNotificationRI: NotificationRequestInput = getNotifParams(
    baseNotificationRI,
    "finished",
    customNotifContent
  );

  if (!skipNotifications)
    await Notifications.scheduleNotificationAsync(dlNotificationRI);

  const fileUri: string = `${FileSystem.documentDirectory}${filename}`;
  const downloadedFile: FileSystem.FileSystemDownloadResult | undefined = await downloadFile(
    uri,
    fileUri,
    options?.downloadProgressCallback
  );

  if (!downloadedFile || downloadedFile.status != 200) {
    if (!skipNotifications)
      await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
    return false;
  }

  try {
    // if this is not an image file on iOS
    // we use "Sharing" library and quit early (let iOS handle it)
    if (
      ios &&
      imageFileExts.every(
        (x) => !downloadedFile.uri.toLocaleLowerCase().endsWith(x)
      )
    ) {
      const UTI = "public.item";
      const shareResult = await Sharing.shareAsync(downloadedFile.uri, {
        UTI,
      });
      return true;
    }

    // the file is either a photo on iOS or any file type on Android
    // in which case we can download the file directly to the Download folder
    const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
    const album = await MediaLibrary.getAlbumAsync(folder);
    if (album == null) {
      await MediaLibrary.createAlbumAsync(folder, asset, false);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
    }
  } catch (e) {
    console.log(`ERROR: ${e}`);
    if (!skipNotifications)
      await dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI);
    return false;
  }

  if (skipNotifications) {
    return true;
  } else {
    if (dlNotificationRI.identifier !== undefined) {
      await Notifications.dismissNotificationAsync(dlNotificationRI.identifier);
    }
    await Notifications.scheduleNotificationAsync(finNotificationRI);
    return true;
  }
}
