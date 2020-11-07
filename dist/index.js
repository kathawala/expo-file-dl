"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadToFolder = void 0;
var FileSystem = require("expo-file-system");
var Notifications = require("expo-notifications");
var MediaLibrary = require("expo-media-library");
var expo_notifications_1 = require("expo-notifications");
var baseNotificationRequestInput = {
    identifier: '',
    content: {
        title: '',
        body: '',
        vibrate: [250],
        priority: expo_notifications_1.AndroidNotificationPriority.HIGH,
        sticky: false
    },
    trigger: {
        channelId: ''
    }
};
function initBaseNotificationRequestInput(filename, channelId) {
    var baseNotificationRI = __assign(__assign({}, baseNotificationRequestInput), { content: __assign(__assign({}, baseNotificationRequestInput.content), { title: filename }), trigger: { channelId: channelId } });
    return baseNotificationRI;
}
function getNotifParams(baseNotificationRI, nState, nContent) {
    var identifier = '';
    var body = '';
    var sticky = false;
    var customNotifContent = {};
    switch (nState) {
        case 'downloading':
            identifier = "dl" + baseNotificationRI.content.title;
            body = 'Downloading...';
            sticky = true;
            if (nContent !== undefined)
                customNotifContent = nContent.downloading;
            break;
        case 'finished':
            identifier = "fin" + baseNotificationRI.content.title;
            body = 'Completed!';
            sticky = false;
            if (nContent !== undefined)
                customNotifContent = nContent.finished;
            break;
        case 'error':
            identifier = "err" + baseNotificationRI.content.title;
            body = 'Failed to download';
            sticky = false;
            if (nContent !== undefined)
                customNotifContent = nContent.error;
            break;
        default:
            break;
    }
    return __assign(__assign({}, baseNotificationRI), { identifier: identifier, content: __assign(__assign(__assign({}, baseNotificationRI.content), { body: body,
            sticky: sticky }), customNotifContent) });
}
function dismissAndShowErr(notifToDismissId, errNotificationRI) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(notifToDismissId !== undefined)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Notifications.dismissNotificationAsync(notifToDismissId)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, Notifications.scheduleNotificationAsync(errNotificationRI)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// NOTE: This function assumes permissions have been granted and does not
// take responsibilty for whether permissions are granted or not
// IT WILL SILENTLY FAIL IF YOU DON'T REQUEST AND GET CAMERA_ROLL permissions
function downloadToFolder(uri, filename, folder, channelId, notificationType, notificationContent) {
    return __awaiter(this, void 0, void 0, function () {
        var baseNotificationRI, customNotifContent, skipNotifications, dlNotificationRI, errNotificationRI, finNotificationRI, fileUri, downloadedFile, asset, album, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseNotificationRI = initBaseNotificationRequestInput(filename, channelId);
                    customNotifContent = notificationType && notificationType.notification === 'custom' ? notificationContent : undefined;
                    skipNotifications = notificationType && notificationType.notification === 'none';
                    dlNotificationRI = getNotifParams(baseNotificationRI, "downloading", customNotifContent);
                    errNotificationRI = getNotifParams(baseNotificationRI, "error", customNotifContent);
                    finNotificationRI = getNotifParams(baseNotificationRI, "finished", customNotifContent);
                    if (!!skipNotifications) return [3 /*break*/, 2];
                    return [4 /*yield*/, Notifications.scheduleNotificationAsync(dlNotificationRI)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    fileUri = "" + FileSystem.documentDirectory + filename;
                    return [4 /*yield*/, FileSystem.downloadAsync(uri, fileUri)];
                case 3:
                    downloadedFile = _a.sent();
                    if (!(downloadedFile.status != 200)) return [3 /*break*/, 6];
                    if (!!skipNotifications) return [3 /*break*/, 5];
                    return [4 /*yield*/, dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, false];
                case 6:
                    _a.trys.push([6, 13, , 16]);
                    return [4 /*yield*/, MediaLibrary.createAssetAsync(downloadedFile.uri)];
                case 7:
                    asset = _a.sent();
                    return [4 /*yield*/, MediaLibrary.getAlbumAsync(folder)];
                case 8:
                    album = _a.sent();
                    if (!(album == null)) return [3 /*break*/, 10];
                    return [4 /*yield*/, MediaLibrary.createAlbumAsync(folder, asset, false)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, MediaLibrary.addAssetsToAlbumAsync([asset], album, false)];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12: return [3 /*break*/, 16];
                case 13:
                    e_1 = _a.sent();
                    if (!!skipNotifications) return [3 /*break*/, 15];
                    return [4 /*yield*/, dismissAndShowErr(dlNotificationRI.identifier, errNotificationRI)];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15: return [2 /*return*/, false];
                case 16:
                    if (!skipNotifications) return [3 /*break*/, 17];
                    return [2 /*return*/, true];
                case 17:
                    if (!(dlNotificationRI.identifier !== undefined)) return [3 /*break*/, 19];
                    return [4 /*yield*/, Notifications.dismissNotificationAsync(dlNotificationRI.identifier)];
                case 18:
                    _a.sent();
                    _a.label = 19;
                case 19: return [4 /*yield*/, Notifications.scheduleNotificationAsync(finNotificationRI)];
                case 20:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.downloadToFolder = downloadToFolder;
//# sourceMappingURL=index.js.map