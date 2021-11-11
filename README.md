# ionicons ![market place image](https://vsmarketplacebadge.apphb.com/version/realappie.ionicons.svg)

Get ionicicons autocomplete & see ionicons in use in your vscode gutter

## Features

![image-gif](https://raw.githubusercontent.com/realappie/ionicons-vscode/master/resources/autocomplete.gif)

![image](https://user-images.githubusercontent.com/10495548/115973706-721a5c00-a557-11eb-8cd4-31c69f126c40.png)

## Requirements

This currently only works for ionic icons in angular, react & vue are not supported yet.

```html
<ion-icon name="close"><ion-icon>
```

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `ionicons.darkModeIconColor`: What color to use for icons in dark mode, defaults to `white`
* `ionicons.iconsVersion`: Which version of ionicons to use, defaults to `5.4.0`
* `ionicons.logLevel`: What types of log to see in the output section, defaults to `info`

## Known Issues

React ionicons usage is not supported yet.
