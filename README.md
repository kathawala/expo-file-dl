<!-- Add banner here -->
![banner](https://storage.googleapis.com/gh-assets/expo-file-dl.png)

<!-- omit in toc -->
# expo-file-dl

<!-- Add buttons here -->
![GitHub last commit](https://img.shields.io/github/last-commit/kathawala/expo-file-dl)

<!-- Describe your project in brief -->
A library which allows you to download files to an arbitrary folder on the mobile device while displaying notifications to the user about the status of the file download. Downloading files to a folder in Expo isn't super-obvious so this library is meant to bridge the gap a bit.
To use this library you need to be using `expo-notifications` (bare and managed workflow both supported) and need to have the following in your app:

1. An existing notification channel
2. A notification-handler function
3. `CAMERA_ROLL` permissions granted by the user

<!-- Some badges that you could use -->

<!-- ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/navendu-pottekkat/awesome-readme?include_prereleases)
: This badge shows the version of the current release.

![GitHub issues](https://img.shields.io/github/issues-raw/navendu-pottekkat/awesome-readme)
: This is a dynamic badge from [**Shields IO**](https://shields.io/) that tracks issues in your project and gets updated automatically. It gives the user an idea about the issues and they can just click the badge to view the issues.

![GitHub pull requests](https://img.shields.io/github/issues-pr/navendu-pottekkat/awesome-readme)
: This is also a dynamic badge that tracks pull requests. This notifies the maintainers of the project when a new pull request comes.

![GitHub All Releases](https://img.shields.io/github/downloads/navendu-pottekkat/awesome-readme/total): If you are not like me and your project gets a lot of downloads(*I envy you*) then you should have a badge that shows the number of downloads! This lets others know how **Awesome** your project is and is worth contributing to.

![GitHub](https://img.shields.io/github/license/navendu-pottekkat/awesome-readme)
: This shows what kind of open-source license your project uses. This is good idea as it lets people know how they can use your project for themselves.

![Tweet](https://img.shields.io/twitter/url?style=flat-square&logo=twitter&url=https%3A%2F%2Fnavendu.me%2Fnsfw-filter%2Findex.html): This is not essential but it is a cool way to let others know about your project! Clicking this button automatically opens twitter and writes a tweet about your project and link to it. All the user has to do is to click tweet. Isn't that neat? -->

<!-- omit in toc -->
# Demo-Preview

![screencap](https://storage.googleapis.com/gh-assets/managed.gif)

# Table of contents

<!-- After you have introduced your project, it is a good idea to add a **Table of contents** or **TOC** as **cool** people say it. This would make it easier for people to navigate through your README and find exactly what they are looking for.

Here is a sample TOC(*wow! such cool!*) that is actually the TOC for this README. -->

- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Usage](#usage)
  - [downloadToFolder](#downloadtofolder)
- [Development](#development)
- [Contribute](#contribute)
    - [Sponsor](#sponsor)
      - [Liberapay](#liberapay)
      - [PayPal](#paypal)
    - [Adding new features or fixing bugs](#adding-new-features-or-fixing-bugs)

# Installation
[(Back to top)](#table-of-contents)

## Managed Expo project

Just run

```
yarn add expo-file-dl
```

## Bare Expo project or plain React-Native project

First, install the following libraries in your project (follow the "Installation in bare React Native projects" instructions for each)

* `expo-file-system`
* `expo-media-library`
* `expo-notifications`
* `react-native-unimodules`

then run

```
yarn add expo-file-dl@bare
```

# Usage
[(Back to top)](#table-of-contents)

To see a full-code working example, you can check out this example app: [expo-file-dl-example](https://github.com/kathawala/expo-file-dl-example)

There is a `bare` branch which has a working app using the bare workflow in addition to the `master` branch which uses the managed workflow

To use the following functions, you need to have:

1. created a `NotificationChannel` using `Notifications.setNotificationChannelAsync` ([docs](https://docs.expo.io/versions/v39.0.0/sdk/notifications/#setnotificationchannelasyncidentifier-string-channel-notificationchannelinput-promisenotificationchannel--null))
2. set up a `NotificationHandler` using `Notifications.setNotificationHandler` ([docs](https://docs.expo.io/versions/v39.0.0/sdk/notifications/#setnotificationchannelasyncidentifier-string-channel-notificationchannelinput-promisenotificationchannel--null))
3. been granted `CAMERA_ROLL` permissions by the user, multiple ways to do this, one way is through `Permissions.askAsync(Permissions.CAMERA_ROLL)` ([docs](https://docs.expo.io/versions/v39.0.0/sdk/permissions/#permissionsaskasynctypes))

## downloadToFolder

```
import { downloadToFolder } from 'expo-file-dl';

...

      <Button title='Download' onPress={async () => {
        await downloadToFolder(uri, filename, folder, channelId);
      }}

```

Arguments:
* `uri`: `string` - the URI of the resource you want to download, currently handles images, videos, and audio well, unsure about other types of resources
* `filename`: `string` - the filename to save the resource to (only the filename, no path information)
* `folder`: `string` - the name of the folder on the device to save the resource to, if the folder does not exist it will be created
* `channelId`: `string` - the id of the NotificationChannel you created earlier
* `notificationType`?: `{ notification: "managed" | "custom" | "none" }` - Optional argument. The managed type uses set defaults for any and all notifications sent during file download. You can override these defaults with `{ notification: "custom" }` and you can opt out of sending notifications altogether with `{ notification: "none" }`
* `notificationContent`?: `{ downloading: NotificationContentInput, finished: NotificationContentInput, error: NotificationContentInput }` - Optional argument, only looked at if `notificationType` is set to `{ notification: "custom" }` otherwise it is ignored. See the [docs](https://docs.expo.io/versions/v39.0.0/sdk/notifications/#notificationcontentinput) for `NotificationContentInput` to see what options are available to customize

This function will download a file from the given URI to a file in the folder with the given name (and will create a folder with the given name if none currently exists). This downloaded file will be visible from other apps, including multimedia apps and file managers. While the download is occurring the user will receive status notifications.

Please see [expo-file-dl-example](https://github.com/kathawala/expo-file-dl-example) for a working example of this function in action


# Development
[(Back to top)](#table-of-contents)

The recommended way to work on this app is the following:

Clone this repo and install dependencies

```
git clone https://github.com/kathawala/expo-file-dl.git
cd expo-file-dl
yarn install
```

Clone the `expo-file-dl-example` repo and install dependencies

```
git clone https://github.com/kathawala/expo-file-dl-example.git
cd expo-file-dl-example
yarn install
```

Change `package.json` in the `expo-file-dl-example` code to point to the local copy of `expo-file-dl`

**package.json**
```
{
    ...
    "dependencies": {
        ...
        "expo-file-dl": "../expo-file-dl",
        ...
    }
    ...
}
```

Now you can make changes to `expo-file-dl`. When you want to test them out, go to the `expo-file-dl-example` directory and start the expo server

(if you don't have `expo` run `yarn add global expo-cli`)
```
cd ../expo-file-dl-example
expo start
```

And you can test the changes on your phone or emulator

# Contribute

### Sponsor
[(Back to top)](#table-of-contents)

If this saved you development time or you otherwise found it useful, leave a star or follow in GitHub.

You can also buy me a coffee to say thanks:

<!-- Liberapay -->
#### Liberapay
<a href="https://liberapay.com/kathawala/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a>

<!-- PayPal -->
#### PayPal
[![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=LHG78XBMVTU82&item_name=open+source+software&currency_code=USD)

### Adding new features or fixing bugs
[(Back to top)](#table-of-contents)

Follow the [instructions above](#development) if you want to set up the environment to write a PR

Bug reports are also welcome, please provide a minimum reproducible example along with a bug report
