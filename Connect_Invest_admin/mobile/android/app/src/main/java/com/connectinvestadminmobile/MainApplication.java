package com.connectinvestadminmobile;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.soloader.OpenSourceMergedSoMapping;
import com.facebook.soloader.SoLoader;
import java.io.IOException;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new java.util.ArrayList<>();
          packages.add(new com.facebook.react.shell.MainReactPackage());
          packages.add(new com.reactnativecommunity.asyncstorage.AsyncStoragePackage());
          packages.add(new com.th3rdwave.safeareacontext.SafeAreaContextPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return false;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return true;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    try {
      SoLoader.init(this, OpenSourceMergedSoMapping.INSTANCE);
    } catch (IOException e) {
      throw new RuntimeException("Failed to initialize SoLoader", e);
    }
  }
}
