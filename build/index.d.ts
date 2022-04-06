import * as FileSystem from "expo-file-system";
import { NotificationContentInput } from "expo-notifications";
export declare type EFDL_NotificationType = {
    notification: "managed" | "custom" | "none";
};
export declare type EDFL_NotificationContent = {
    downloading: NotificationContentInput;
    finished: NotificationContentInput;
    error: NotificationContentInput;
};
export interface EFDL_Options {
    notificationType?: EFDL_NotificationType;
    notificationContent?: EDFL_NotificationContent;
    downloadProgressCallback?: FileSystem.DownloadProgressCallback;
}
export declare type EDFL_NotificationState = "downloading" | "finished" | "error";
export declare function downloadToFolder(uri: string, filename: string, folder: string, channelId: string, options?: EFDL_Options): Promise<boolean>;
