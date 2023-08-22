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

import GObject from 'gi://GObject';
import St from 'gi://St';
import Atk from 'gi://Atk';
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as config from 'resource:///org/gnome/shell/misc/config.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const ActivitiesButton = GObject.registerClass(
    class ActivitiesButton extends PanelMenu.Button {
        _init(rightClick) {
            super._init(0, 'replace activities text extension', false);
            this.accessible_role = Atk.Role.TOGGLE_BUTTON;
            this._iconLabelBox = new St.BoxLayout();
            this._iconBin = new St.Bin();
            this._iconLabelBox.add(this._iconBin);
            this._label = new St.Label({text: '', y_align: Clutter.ActorAlign.CENTER});
            this._textBin = new St.Bin();
            this._textBin.child = this._label;
            this._iconLabelBox.add(this._textBin);
            this.add_actor(this._iconLabelBox);
            this.label_actor = this._label;
            this._boolean = rightClick;

            this._extension = Extension.lookupByURL(import.meta.url);

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
            return this._label.get_text();
        }

        vfunc_event(event) {
            if (event.type() === Clutter.EventType.BUTTON_RELEASE && event.get_button() === 3 && this._boolean) {
                this._extension.openPreferences();
                return Clutter.EVENT_PROPAGATE;
            } else {
                if (event.type() === Clutter.EventType.TOUCH_END ||
                    event.type() === Clutter.EventType.BUTTON_RELEASE) {
                    if (Main.overview.shouldToggleByCornerOrButton())
                        Main.overview.toggle();
                }
                return Clutter.EVENT_PROPAGATE;
            }
        }

        vfunc_key_release_event(keyEvent) {
            let symbol = keyEvent.keyval;
            if (symbol === Clutter.KEY_Return || symbol === Clutter.KEY_space) {
                if (Main.overview.shouldToggleByCornerOrButton()) {
                    Main.overview.toggle();
                    return Clutter.EVENT_STOP;
                }
            }
            return Clutter.EVENT_PROPAGATE;
        }

        destroy() {
            if (this._overviewShowingSig !== 0)
                Main.overview.disconnect(this._overviewShowingSig);
            if (this._overviewHidingSig !== 0)
                Main.overview.disconnect(this._overviewHidingSig);
            super.destroy();
        }
    }
);

export default class ReplaceActivitiesTextExtension extends Extension {
    _setIconAndLabel() {
        let iconPath = this._settings.get_string('icon-path');
        if (!GLib.file_test(iconPath, GLib.FileTest.EXISTS)) {
            this._activitiesButton._iconBin.hide();
        } else {
            this._activitiesButton._iconBin.child = new St.Icon(
                {
                    gicon: Gio.icon_new_for_string(iconPath),
                    icon_size: Main.panel.height * this._settings.get_double('icon-size') / 2,
                }
            );
            this._activitiesButton._iconBin.show();
        }

        let labelText = this._settings.get_string('text');

        if (labelText === '') {
            const text = `${GLib.get_os_info('PRETTY_NAME')} | ${config.PACKAGE_NAME.toUpperCase()} ${config.PACKAGE_VERSION}`;
            this._activitiesButton.label = text;
            this._activitiesButton._textBin.show();
        } else {
            this._activitiesButton.label = labelText;
            this._activitiesButton._textBin.show();
        }

        if (this._settings.get_boolean('no-text'))
            this._activitiesButton._textBin.hide();
        else
            this._activitiesButton._textBin.show();

        if (!GLib.file_test(iconPath, GLib.FileTest.EXISTS) && !this._activitiesButton._textBin.visible)
            this._activitiesButton.hide();
        else
            this._activitiesButton.show();

        this._activitiesButton.set_style(`-natural-hpadding: ${this._settings.get_int('padding')}px`);
        this._activitiesButton._iconBin.set_style(`color: ${this._settings.get_string('icon-color')}`);
        this._activitiesButton._textBin.set_style(`color: ${this._settings.get_string('text-color')}`);

        if (this._activitiesButton._iconBin.visible && !this._activitiesButton._textBin.visible)
            this._activitiesButton.set_style(`-natural-hpadding: ${this._settings.get_int('padding')}px; -minimum-hpadding: 0;`);

        if (this._activitiesButton._iconBin.visible && this._activitiesButton._textBin.visible) {
            this._activitiesButton._textBin.set_style(
                `padding-left: ${this._settings.get_int('gap')}px;
                color: ${this._settings.get_string('text-color')}`
            );
        }

        if (!this._activitiesButton._iconBin.visible && this._activitiesButton._textBin.visible) {
            this._activitiesButton._iconBin.show();
            this._activitiesButton._textBin.set_style(
                `padding-left: 0; color: ${this._settings.get_string('text-color')}`
            );
            this._activitiesButton._iconBin.hide();
        }
    }

    _connectSettings() {
        this._iconPathChangeId = this._settings.connect('changed::icon-path', this._setIconAndLabel.bind(this));
        this._textChangeId = this._settings.connect('changed::text', this._setIconAndLabel.bind(this));
        this._iconSizeChangeId = this._settings.connect('changed::icon-size', this._setIconAndLabel.bind(this));
        this._rightClickChangeId = this._settings.connect('changed::right-click', this._rightClick.bind(this));
        this._paddingChangedId = this._settings.connect('changed::padding', this._setIconAndLabel.bind(this));
        this._gapChangedId = this._settings.connect('changed::gap', this._setIconAndLabel.bind(this));
        this._iconColorChangedId = this._settings.connect('changed::icon-color', this._setIconAndLabel.bind(this));
        this._textColorChangedId = this._settings.connect('changed::text-color', this._setIconAndLabel.bind(this));
        this._noTextChangedId = this._settings.connect('changed::no-text', this._setIconAndLabel.bind(this));
    }

    _rightClick() {
        this.disable();
        this.enable();
    }

    enable() {
        this._settings = this.getSettings();

        let rightClick = this._settings.get_boolean('right-click');
        this._activitiesButton = new ActivitiesButton(rightClick);

        this._connectSettings();
        this._setIconAndLabel();

        Main.panel.statusArea.activities.container.hide();
        Main.panel.addToStatusArea('activities-icon-button', this._activitiesButton, 0, 'left');
    }

    disable() {
        let connectionsIds = [
            this._iconPathChangeId,
            this._textChangeId,
            this._iconSizeChangeId,
            this._rightClickChangeId,
            this._paddingChangedId,
            this._gapChangedId,
            this._iconColorChangedId,
            this._textColorChangedId,
            this._noTextChangedId,
        ];

        connectionsIds.forEach(id => {
            if (id)
                this._settings.disconnect(id);
        });

        this._settings = null;

        this._activitiesButton.destroy();
        this._activitiesButton = null;

        if (Main.sessionMode.currentMode === 'unlock-dialog')
            Main.panel.statusArea.activities.container.hide();
        else
            Main.panel.statusArea.activities.container.show();
    }
}
