import { NotificationContentInput } from 'expo-notifications';
export declare type EFDL_NotificationType = {
    notification: "managed" | "custom" | "none";
};
export declare type EDFL_NotificationContent = {
    downloading: NotificationContentInput;
    finished: NotificationContentInput;
    error: NotificationContentInput;
};
export declare type EDFL_NotificationState = "downloading" | "finished" | "error";
export declare function downloadToFolder(uri: string, filename: string, folder: string, channelId: string, notificationType?: EFDL_NotificationType, notificationContent?: EDFL_NotificationContent): Promise<boolean>;
