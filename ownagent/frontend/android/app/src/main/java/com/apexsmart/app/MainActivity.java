package com.genzsmart.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.capacitorjs.plugins.statusbar.StatusBarPlugin;
import com.capacitorjs.plugins.keyboard.KeyboardPlugin;
import com.capacitorjs.plugins.splashscreen.SplashScreenPlugin;
import com.capacitorjs.plugins.filesystem.FilesystemPlugin;
import com.capacitorjs.plugins.share.SharePlugin;
import com.capacitorjs.plugins.preferences.PreferencesPlugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register plugins
        registerPlugin(StatusBarPlugin.class);
        registerPlugin(KeyboardPlugin.class);
        registerPlugin(SplashScreenPlugin.class);
        registerPlugin(FilesystemPlugin.class);
        registerPlugin(SharePlugin.class);
        registerPlugin(PreferencesPlugin.class);
    }
}
