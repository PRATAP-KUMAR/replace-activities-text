/*
  Replace Activities Text - Gnome Shell Extension.
  A Simple Extension to Change 'Activities' Label with Logo and Text
  
  This extension is derived from https://extensions.gnome.org/extension/358/activities-configurator/
  This extension's prefrences window is derived from https://extensions.gnome.org/extension/1476/unlock-dialog-background/
  
  Thanks to both the above extensions Authors.
  
  -------------------------------------------------------------------------------------------------------------------------
  
  Copyright (c)

  This extension is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This extension is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see
  < https://www.gnu.org/licenses/old-licenses/gpl-2.0.html >.

  This extension is a derived work of the Gnome Shell.
*/



'use strict';

const { GObject, Shell, St, Atk, Clutter, Gio, GLib } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;

var ActivitiesIconButton = GObject.registerClass(
class ActivitiesIconButton extends PanelMenu.Button {

    _init() {
        super._init(0.0, null, true);
        this.container.name = 'panelActivitiesIconButtonContainer';
        this.accessible_role = Atk.Role.TOGGLE_BUTTON;
        this.name = 'panelActivitiesIconButton';
        this._iconLabelBox = new St.BoxLayout({style_class: 'space'});
        this._iconBin = new St.Bin();
        this._textBin = new St.Bin();
        this._iconLabelBox.add(this._iconBin);
        this._label = new St.Label({ text: "", y_align:Clutter.ActorAlign.CENTER });
        this._textBin.child = this._label;
        this._iconLabelBox.add(this._textBin);
        this.add_actor(this._iconLabelBox);
        this.label_actor = this._label;
        
        this._overviewShowingSig = 0;
        this._overviewHidingSig = 0;

        this._overviewShowingSig = Main.overview.connect('showing', () => {
            this.add_style_pseudo_class('overview');
            this.add_accessible_state(Atk.StateType.CHECKED);
        });
        this._overviewHidingSig = Main.overview.connect('hiding', () => {
            this.remove_style_pseudo_class('overview');
            this.remove_accessible_state(Atk.StateType.CHECKED);
        });
    }

    set label(labelText) {
        this._label.set_text(labelText);
    }

    get label() {
        return (this._label.get_text());
    }

    vfunc_event(event) {
        if (event.type() == Clutter.EventType.TOUCH_END ||
            event.type() == Clutter.EventType.BUTTON_RELEASE) {
            if (Main.overview.shouldToggleByCornerOrButton())
                Main.overview.toggle();
        }
        return Clutter.EVENT_PROPAGATE;
    }

    vfunc_key_release_event(keyEvent) {
        let symbol = keyEvent.keyval;
        if (symbol == Clutter.KEY_Return || symbol == Clutter.KEY_space) {
            if (Main.overview.shouldToggleByCornerOrButton()) {
                Main.overview.toggle();
                return Clutter.EVENT_STOP;
            }
        }

        return Clutter.EVENT_PROPAGATE;
    }
});

var ActivitiesIconButtonRightClick = GObject.registerClass(
class ActivitiesIconButtonRightClick extends PanelMenu.Button {

    _init() {
        super._init(0.0, null, true);
        this.container.name = 'panelActivitiesIconButtonContainer';
        this.accessible_role = Atk.Role.TOGGLE_BUTTON;
        this.name = 'panelActivitiesIconButton';
        this._iconLabelBox = new St.BoxLayout({style_class: 'space'});
        this._iconBin = new St.Bin();
        this._textBin = new St.Bin();
        this._iconLabelBox.add(this._iconBin);
        this._label = new St.Label({ text: "", y_align:Clutter.ActorAlign.CENTER });
        this._textBin.child = this._label;
        this._iconLabelBox.add(this._textBin);
        this.add_actor(this._iconLabelBox);
        this.label_actor = this._label;
        
        this._overviewShowingSig = 0;
        this._overviewHidingSig = 0;

        this._overviewShowingSig = Main.overview.connect('showing', () => {
            this.add_style_pseudo_class('overview');
            this.add_accessible_state(Atk.StateType.CHECKED);
        });
        this._overviewHidingSig = Main.overview.connect('hiding', () => {
            this.remove_style_pseudo_class('overview');
            this.remove_accessible_state(Atk.StateType.CHECKED);
        });
    }

    set label(labelText) {
        this._label.set_text(labelText);
    }

    get label() {
        return (this._label.get_text());
    }

    vfunc_event(event) {
        if (event.type() == Clutter.EventType.BUTTON_RELEASE && event.get_button() == 3) {
            let app_path = '/usr/bin/gnome-extensions';
            if (GLib.file_test(app_path, GLib.FileTest.EXISTS)) {
                ExtensionUtils.openPrefs();
            }
            return Clutter.EVENT_PROPAGATE;
        } else if (event.type() == Clutter.EventType.TOUCH_END ||
            event.type() == Clutter.EventType.BUTTON_RELEASE) {
            if (Main.overview.shouldToggleByCornerOrButton())
                Main.overview.toggle();
        }
        return Clutter.EVENT_PROPAGATE;
    }

    vfunc_key_release_event(keyEvent) {
        let symbol = keyEvent.keyval;
        if (symbol == Clutter.KEY_Return || symbol == Clutter.KEY_space) {
            if (Main.overview.shouldToggleByCornerOrButton()) {
                Main.overview.toggle();
                return Clutter.EVENT_STOP;
            }
        }

        return Clutter.EVENT_PROPAGATE;
    }
});

class Configurator {

    constructor() {
    }

    _connectSettings() {
        this._settings.connect('changed::icon-path', this._setIconAndLabel.bind(this));
        this._settings.connect('changed::text', this._setIconAndLabel.bind(this))
        this._settings.connect('changed::icon-size', this._setIconAndLabel.bind(this));
        this._settings.connect('changed::right-click', this._rightClick.bind(this));
    }
    
    _setIconAndLabel() {
    
            let iconPath = this._settings.get_string('icon-path');
            if (!GLib.file_test(iconPath, GLib.FileTest.EXISTS)) {
            this._activitiesIconButton._iconBin.hide();
            } else {
            
            this._activitiesIconButton._iconBin.child = new St.Icon(
            { gicon: Gio.icon_new_for_string(iconPath), icon_size: Main.panel.height*this._settings.get_double('icon-size')/2 });
            this._activitiesIconButton._iconBin.show();
            };
            
            let labelText = this._settings.get_string('text');
            
            if(labelText === "Default") { labelText = GLib.get_os_info("PRETTY_NAME") + ' | ' + (imports.misc.config.PACKAGE_NAME).toUpperCase() + ' ' + imports.misc.config.PACKAGE_VERSION;
            this._activitiesIconButton.label = labelText;
            this._activitiesIconButton._textBin.show(); } else if(!labelText) {
            this._activitiesIconButton._textBin.hide(); } else {
            
            this._activitiesIconButton.label = labelText;
            this._activitiesIconButton._textBin.show(); }
            
            if (!GLib.file_test(iconPath, GLib.FileTest.EXISTS) && (!labelText)) { this._activitiesIconButton.hide(); }
            else { this._activitiesIconButton.show(); }
    }
    
    _rightClick() {
    this.disable();
    this.enable();
    }
    
    enable() {
        this._settings = ExtensionUtils.getSettings();
        let rightClick = this._settings.get_boolean('right-click');
        
        if (!rightClick) { this._activitiesIconButton = new ActivitiesIconButton();
        } else { this._activitiesIconButton = new ActivitiesIconButtonRightClick();
        }
        
        this._connectSettings();
        this._setIconAndLabel();
        
        Main.panel.statusArea.activities.container.hide();
        Main.panel.addToStatusArea('activities-icon-button', this._activitiesIconButton, 0, 'left');
    }

    disable() {
            this._activitiesIconButton.destroy();
            this._activitiesIconButton = null;
            if(Main.sessionMode.currentMode == 'unlock-dialog') {
            Main.panel.statusArea.activities.container.hide(); } else
            Main.panel.statusArea.activities.container.show();
        }
};

function init() {
    return new Configurator();
}

