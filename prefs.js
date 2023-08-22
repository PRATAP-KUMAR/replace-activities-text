import Gtk from 'gi://Gtk';
import Gdk from 'gi://Gdk';
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const PADDING = 18;
const GAP = 6;
const RESET_COLOR = '#f2f2f2ff';

let pictureUrlEntry;

export default class ReplaceActivitiesTextExtensionPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'Change Activities Text with Logo and Your Preferred Text',
        });

        window._settings = this.getSettings();
        window._textColorButton = new Gtk.ColorButton();
        window._iconColorButton = new Gtk.ColorButton();
        window._noTextButton = new Gtk.Button({margin_start: 5});
        setButtonColor(window._iconColorButton, 'icon-color');
        setButtonColor(window._textColorButton, 'text-color');

        const addPictureUrl = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5, hexpand: true});
            let label = new Gtk.Label({label: 'Logo', xalign: 0, hexpand: true});
            pictureUrlEntry = new Gtk.Entry({margin_start: 5});
            pictureUrlEntry.set_width_chars(60);
            pictureUrlEntry.set_placeholder_text('enter /path/to/the/logo');

            let resetButton = new Gtk.Button({margin_start: 5});
            resetButton.set_label("Reset to Extensions's Default Icon");
            resetButton.connect('clicked', () => {
                window._settings.set_string('icon-path', '/usr/share/icons/Adwaita/symbolic/emotes/face-smile-big-symbolic.svg');
                pictureUrlEntry.set_text(window._settings.get_string('icon-path'));
            });

            let noPicButton = new Gtk.Button({margin_start: 5});
            noPicButton.set_label('No Logo');
            noPicButton.connect('clicked', () => {
                window._settings.set_string('icon-path', '');
                pictureUrlEntry.set_text(window._settings.get_string('icon-path'));
            });

            pictureUrlEntry.set_text(window._settings.get_string('icon-path'));
            pictureUrlEntry.connect('changed', entry => {
                window._settings.set_string('icon-path', entry.get_text());
            });

            hbox.append(label);
            hbox.append(pictureUrlEntry);
            hbox.append(resetButton);
            hbox.append(noPicButton);

            return hbox;
        };

        const addTextUrl = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let label = new Gtk.Label({label: 'Text', xalign: 0, hexpand: true});
            let textUrlEntry = new Gtk.Entry({margin_start: 5});
            textUrlEntry.set_width_chars(60);
            textUrlEntry.set_placeholder_text('type your preferred text or leave it blank for extensions default text.');

            let resetButton = new Gtk.Button({margin_start: 5});
            resetButton.set_label("Reset to Extensions's Default Text");
            resetButton.connect('clicked', () => {
                window._settings.set_string('text', '');
                textUrlEntry.set_text(window._settings.get_string('text'));
                window._settings.set_boolean('no-text', false);
                let boolean = window._settings.get_boolean('no-text');
                window._noTextButton.set_label(boolean ? 'Show Text' : 'Hide Text');
            });

            let boolean = window._settings.get_boolean('no-text');
            window._noTextButton.set_label(boolean ? 'Show Text' : 'Hide Text');
            window._noTextButton.connect('clicked', () => {
                boolean = !window._settings.get_boolean('no-text');
                window._settings.set_boolean('no-text', boolean);
                window._noTextButton.set_label(boolean ? 'Show Text' : 'Hide Text');
            });

            textUrlEntry.set_text(window._settings.get_string('text'));
            textUrlEntry.connect('changed', entry => {
                window._settings.set_string('text', entry.get_text());
            });

            hbox.append(label);
            hbox.append(textUrlEntry);
            hbox.append(resetButton);
            hbox.append(window._noTextButton);

            return hbox;
        };

        const colorButton = (label, button, id) => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let colorLabel = new Gtk.Label({label, xalign: 0, hexpand: true});

            let resetColorButton = new Gtk.Button({margin_start: 5});
            resetColorButton.set_label(`Reset to Extensions Default Value -> ${RESET_COLOR}`);
            resetColorButton.connect('clicked', () => {
                window._settings.set_string(id, `${RESET_COLOR}`);
                setButtonColor(button, id);
            });

            hbox.append(colorLabel);
            hbox.append(selectButtonColor(button, id));
            hbox.append(resetColorButton);
            return hbox;
        };

        const adjustPadding = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let paddingLabel = new Gtk.Label({label: 'Adjust Padding (Left & Right padding on Container)', xalign: 0, hexpand: true});
            let paddingLabelButton = new Gtk.SpinButton();
            paddingLabelButton.set_range(0, 18);
            paddingLabelButton.set_increments(2, 4);
            paddingLabelButton.set_value(window._settings.get_int('padding'));
            paddingLabelButton.connect('value-changed', entry => {
                window._settings.set_int('padding', entry.get_value());
            });

            let resetPaddingButton = new Gtk.Button({margin_start: 5});
            resetPaddingButton.set_label("Reset to Extensions's Default Value");
            resetPaddingButton.connect('clicked', () => {
                window._settings.set_int('padding', PADDING);
                paddingLabelButton.set_value(window._settings.get_int('padding'));
            });

            hbox.append(paddingLabel);
            hbox.append(paddingLabelButton);
            hbox.append(resetPaddingButton);

            return hbox;
        };

        const adjustGap = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let adjustGapLabel = new Gtk.Label({label: 'Adjust Gap Between, When Icon and Text are shown', xalign: 0, hexpand: true});
            let adjustGapLabelButton = new Gtk.SpinButton();
            adjustGapLabelButton.set_range(0, 18);
            adjustGapLabelButton.set_increments(2, 4);
            adjustGapLabelButton.set_value(window._settings.get_int('gap'));
            adjustGapLabelButton.connect('value-changed', entry => {
                window._settings.set_int('gap', entry.get_value());
            });

            let resetGapButton = new Gtk.Button({margin_start: 5});
            resetGapButton.set_label("Reset to Extensions's Default Value");
            resetGapButton.connect('clicked', () => {
                window._settings.set_int('gap', GAP);
                adjustGapLabelButton.set_value(window._settings.get_int('gap'));
            });

            hbox.append(adjustGapLabel);
            hbox.append(adjustGapLabelButton);
            hbox.append(resetGapButton);

            return hbox;
        };

        const adjustLogo = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let logoLabel = new Gtk.Label({label: 'Adjust Icon Size', xalign: 0, hexpand: true});

            let logoAdjustment = new Gtk.Adjustment({
                upper: 2,
                'step-increment': 0.1,
                'page-increment': 0.1,
                lower: 1,
            });

            let logoEntry = new Gtk.Scale({
                hexpand: true,
                margin_start: 20,
                visible: true,
                'can-focus': true,
                digits: 1,
                adjustment: logoAdjustment,
            });

            let adjustLogoResetButton = new Gtk.Button({margin_start: 5});
            adjustLogoResetButton.set_label("Reset to Extensions's Default Size");
            adjustLogoResetButton.connect('clicked', () => {
                window._settings.set_double('icon-size', 1.5);
                logoEntry.set_value(window._settings.get_double('icon-size'));
            });

            logoEntry.set_value(window._settings.get_double('icon-size'));
            logoEntry.connect('value-changed', entry => {
                window._settings.set_double('icon-size', entry.get_value());
            });

            hbox.append(logoLabel);
            hbox.append(logoEntry);
            hbox.append(adjustLogoResetButton);

            return hbox;
        };

        const rightClick = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let rightClickLabel = new Gtk.Label({label: "Right Click on 'Activities' Area Opens Extension Prefs", xalign: 0, hexpand: true});
            let rightClickSwitch = new Gtk.Switch({active: window._settings.get_boolean('right-click')});
            rightClickSwitch.connect('notify::active', button => {
                window._settings.set_boolean('right-click', button.active);
            });

            hbox.append(rightClickLabel);
            hbox.append(rightClickSwitch);
            return hbox;
        };

        const tip = () => {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
            let tipLabel = new Gtk.Label({label: 'Note: Use Icon of Square Shape for Setting the Logo', xalign: 0, hexpand: true});

            hbox.append(tipLabel);
            return hbox;
        };

        // helper functions

        /**
         *
         * @param {string} button button
         * @param {string} id id
         */
        function setButtonColor(button, id) {
            let rgba = new Gdk.RGBA();
            let hexString = window._settings.get_string(id);
            rgba.parse(hexString);
            button.set_rgba(rgba);
        }

        /**
         *
         * @param {string} button 'button'
         * @param {string} id 'id'
         */
        function selectButtonColor(button, id) {
            let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5, halign: Gtk.Align.END});
            button.connect('notify::rgba', () => onPanelColorChanged(button, id));
            hbox.append(button);

            return hbox;
        }

        /**
         *
         * @param {string } button 'button'
         * @param {string} id 'id'
         */
        function onPanelColorChanged(button, id) {
            let rgba = button.get_rgba();
            let css = rgba.to_string();
            let hexString = cssHexString(css);
            window._settings.set_string(id, hexString);
        }

        /**
         *
         * @param {string} css 'css'
         */
        function cssHexString(css) {
            let rrggbb = '#';
            let start;
            for (let loop = 0; loop < 3; loop++) {
                let end = 0;
                let xx = '';
                for (let loop1 = 0; loop1 < 2; loop1++) {
                    while (true) {
                        let x = css.slice(end, end + 1);
                        if (x === '(' || x === ',' || x === ')')
                            break;
                        end += 1;
                    }
                    if (loop1 === 0) {
                        end += 1;
                        start = end;
                    }
                }
                xx = parseInt(css.slice(start, end)).toString(16);
                if (xx.length === 1)
                    xx = `0${xx}`;
                rrggbb += xx;
                css = css.slice(end);
            }
            return rrggbb;
        }

        group.add(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));

        group.add(addPictureUrl());
        group.add(addTextUrl());
        group.add(colorButton('ICON COLOR', window._iconColorButton, 'icon-color'));
        group.add(colorButton('TEXT COLOR', window._textColorButton, 'text-color'));

        group.add(adjustPadding());
        group.add(adjustGap());
        group.add(adjustLogo());
        group.add(rightClick());

        group.add(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));

        group.add(tip());

        page.add(group);
        window.add(page);
        window.maximize();
    }
}
