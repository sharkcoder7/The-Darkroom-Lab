package com.thedarkroom;

import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "TheDarkRoom";
  }

  @Override
      protected void onCreate(Bundle savedInstanceState) {
          SplashScreen.show(this, false);
          super.onCreate(savedInstanceState);
      }

  @Override
		public void onConfigurationChanged(Configuration newConfig) {
		  super.onConfigurationChanged(newConfig);
		  Intent intent = new Intent("onConfigurationChanged");
		  intent.putExtra("newConfig", newConfig);
		  this.sendBroadcast(intent);
	  }
}
