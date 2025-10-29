# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.innsbluck.fridge.* {
  native <methods>;
}

-keep class com.innsbluck.fridge.WryActivity {
  public <init>(...);

  void setWebView(com.innsbluck.fridge.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.innsbluck.fridge.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.innsbluck.fridge.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.innsbluck.fridge.RustWebChromeClient,com.innsbluck.fridge.RustWebViewClient {
  public <init>(...);
}
