const {Gtk, Gdk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const PADDING = 18;
const GAP = 6;
const RESET_COLOR = '#f2f2f2ff';

let pictureUrlEntry;

/**
 *
 */
function init() {
}

/**
 *
 */
function buildPrefsWidget() {
    let widget = new PrefsWidget();
    return widget.widget;
}

class PrefsWidget {
    constructor() {
        this._settings = ExtensionUtils.getSettings();
        this._textColorButton = new Gtk.ColorButton();
        this._iconColorButton = new Gtk.ColorButton();
        this.setButtonColor(this._iconColorButton, 'icon-color');
        this.setButtonColor(this._textColorButton, 'text-color');

        this.widget = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 10,
            margin_bottom: 10,
            margin_start: 10,
            margin_end: 10,
            hexpand: true,
        });

        this.vbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            margin_top: 0,
            hexpand: true,
        });

        this.addBoldTextToBox('Change Activities Text with Logo and Your Preferred Text', this.vbox);
        this.vbox.append(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));
        this.vbox.append(this._addPictureUrl());
        this.vbox.append(this._addTextUrl());
        this.vbox.append(this._colorButton('ICON COLOR', this._iconColorButton, 'icon-color'));
        this.vbox.append(this._colorButton('TEXT COLOR', this._textColorButton, 'text-color'));

        this.vbox.append(this._adjustPadding());
        this.vbox.append(this._adjustGap());
        this.vbox.append(this._adjustLogo());
        this.vbox.append(this._rightClick());

        this.vbox.append(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));

        this.vbox.append(this._tip());

        this.widget.append(this.vbox);
    }

    _addPictureUrl() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5, hexpand: true});
        let label = new Gtk.Label({label: 'Logo', xalign: 0, hexpand: true});
        pictureUrlEntry = new Gtk.Entry({margin_start: 5});
        pictureUrlEntry.set_width_chars(60);
        pictureUrlEntry.set_placeholder_text('enter /path/to/the/logo or click Browse button to choose logo');

        let resetButton = new Gtk.Button({margin_start: 5});
        resetButton.set_label("Reset to Extensions's Default Icon");
        resetButton.connect('clicked', () => {
            this._settings.set_string('icon-path', '/usr/share/icons/Adwaita/symbolic/emotes/face-smile-big-symbolic.svg');
            pictureUrlEntry.set_text(this._settings.get_string('icon-path'));
        });

        let noPicButton = new Gtk.Button({margin_start: 5});
        noPicButton.set_label('No Logo');
        noPicButton.connect('clicked', () => {
            this._settings.set_string('icon-path', '');
            pictureUrlEntry.set_text(this._settings.get_string('icon-path'));
        });

        pictureUrlEntry.set_text(this._settings.get_string('icon-path'));
        pictureUrlEntry.connect('changed', entry => {
            this._settings.set_string('icon-path', entry.get_text());
        });

        let fileChooseButton = new Gtk.Button({margin_start: 5});
        fileChooseButton.set_label('Browse');
        fileChooseButton.connect('clicked', this.showFileChooserDialog.bind(this));

        hbox.append(label);
        hbox.append(pictureUrlEntry);
        hbox.append(fileChooseButton);
        hbox.append(resetButton);
        hbox.append(noPicButton);

        return hbox;
    }

    _addTextUrl() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let label = new Gtk.Label({label: 'Text', xalign: 0, hexpand: true});
        let textUrlEntry = new Gtk.Entry({margin_start: 5});
        textUrlEntry.set_width_chars(60);
        textUrlEntry.set_placeholder_text('type your preferred text or leave it blank for no text.');

        let resetButton = new Gtk.Button({margin_start: 5});
        resetButton.set_label("Reset to Extensions's Default Text");
        resetButton.connect('clicked', () => {
            this._settings.set_string('text', 'default');
            textUrlEntry.set_text(this._settings.get_string('text'));
        });

        let noTextButton = new Gtk.Button({margin_start: 5});
        noTextButton.set_label('No Text');
        noTextButton.connect('clicked', () => {
            this._settings.set_string('text', '');
            textUrlEntry.set_text(this._settings.get_string('text'));
        });

        textUrlEntry.set_text(this._settings.get_string('text'));
        textUrlEntry.connect('changed', entry => {
            this._settings.set_string('text', entry.get_text());
        });

        hbox.append(label);
        hbox.append(textUrlEntry);
        hbox.append(resetButton);
        hbox.append(noTextButton);

        return hbox;
    }

    _colorButton(label, button, id) {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let colorLabel = new Gtk.Label({label, xalign: 0, hexpand: true});

        let resetColorButton = new Gtk.Button({margin_start: 5});
        resetColorButton.set_label(`Reset to Extensions Default Value -> ${RESET_COLOR}`);
        resetColorButton.connect('clicked', () => {
            this._settings.set_string(id, `${RESET_COLOR}`);
            this.setButtonColor(button, id);
        });

        hbox.append(colorLabel);
        hbox.append(this.selectButtonColor(button, id));
        hbox.append(resetColorButton);
        return hbox;
    }

    _adjustPadding() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let paddingLabel = new Gtk.Label({label: 'Adjust Padding (Left & Right padding on Container)', xalign: 0, hexpand: true});
        let paddingLabelButton = new Gtk.SpinButton();
        paddingLabelButton.set_range(0, 18);
        paddingLabelButton.set_increments(2, 4);
        paddingLabelButton.set_value(this._settings.get_int('padding'));
        paddingLabelButton.connect('value-changed', entry => {
            this._settings.set_int('padding', entry.get_value());
        });

        let resetPaddingButton = new Gtk.Button({margin_start: 5});
        resetPaddingButton.set_label("Reset to Extensions's Default Value");
        resetPaddingButton.connect('clicked', () => {
            this._settings.set_int('padding', PADDING);
            paddingLabelButton.set_value(this._settings.get_int('padding'));
        });

        hbox.append(paddingLabel);
        hbox.append(paddingLabelButton);
        hbox.append(resetPaddingButton);

        return hbox;
    }

    _adjustGap() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let adjustGapLabel = new Gtk.Label({label: 'Adjust Gap Between, When Icon and Text are shown', xalign: 0, hexpand: true});
        let adjustGapLabelButton = new Gtk.SpinButton();
        adjustGapLabelButton.set_range(0, 18);
        adjustGapLabelButton.set_increments(2, 4);
        adjustGapLabelButton.set_value(this._settings.get_int('gap'));
        adjustGapLabelButton.connect('value-changed', entry => {
            this._settings.set_int('gap', entry.get_value());
        });

        let resetGapButton = new Gtk.Button({margin_start: 5});
        resetGapButton.set_label("Reset to Extensions's Default Value");
        resetGapButton.connect('clicked', () => {
            this._settings.set_int('gap', GAP);
            adjustGapLabelButton.set_value(this._settings.get_int('gap'));
        });

        hbox.append(adjustGapLabel);
        hbox.append(adjustGapLabelButton);
        hbox.append(resetGapButton);

        return hbox;
    }

    _adjustLogo() {
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
            this._settings.set_double('icon-size', 1.5);
            logoEntry.set_value(this._settings.get_double('icon-size'));
        });

        logoEntry.set_value(this._settings.get_double('icon-size'));
        logoEntry.connect('value-changed', entry => {
            this._settings.set_double('icon-size', entry.get_value());
        });

        hbox.append(logoLabel);
        hbox.append(logoEntry);
        hbox.append(adjustLogoResetButton);

        return hbox;
    }

    _rightClick() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let rightClickLabel = new Gtk.Label({label: "Right Click on 'Activities' Area Opens Extension Prefs", xalign: 0, hexpand: true});
        let rightClickSwitch = new Gtk.Switch({active: this._settings.get_boolean('right-click')});
        rightClickSwitch.connect('notify::active', button => {
            this._settings.set_boolean('right-click', button.active);
        });

        hbox.append(rightClickLabel);
        hbox.append(rightClickSwitch);
        return hbox;
    }

    _tip() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let tipLabel = new Gtk.Label({label: 'Note: Use Icon of Square Shape for Setting the Logo', xalign: 0, hexpand: true});

        hbox.append(tipLabel);
        return hbox;
    }

    // helper functions

    setButtonColor(button, id) {
        let rgba = new Gdk.RGBA();
        let hexString = this._settings.get_string(id);
        rgba.parse(hexString);
        button.set_rgba(rgba);
    }

    selectButtonColor(button, id) {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5, halign: Gtk.Align.END});
        button.connect('notify::rgba', () => this.onPanelColorChanged(button, id));
        hbox.append(button);

        return hbox;
    }

    onPanelColorChanged(button, id) {
        let rgba = button.get_rgba();
        let css = rgba.to_string();
        let hexString = this.cssHexString(css);
        this._settings.set_string(id, hexString);
    }

    cssHexString(css) {
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

    showFileChooserDialog() {
        let fileChooser = new Gtk.FileChooserDialog({title: 'Select File'});
        fileChooser.set_transient_for(this.widget.get_root());
        fileChooser.set_default_response(1);

        let filter = new Gtk.FileFilter();
        filter.add_pixbuf_formats();
        fileChooser.filter = filter;

        fileChooser.add_button('Open', Gtk.ResponseType.ACCEPT);

        fileChooser.connect('response', (dialog, response) => {
            if (response === Gtk.ResponseType.ACCEPT) {
                let file = dialog.get_file().get_path();
                if (file.length > 0)
                    pictureUrlEntry.set_text(file);
                fileChooser.destroy();
            }
        });

        fileChooser.show();
    }

    addBoldTextToBox(text, box) {
        let txt = new Gtk.Label({xalign: 0, margin_top: 20});
        txt.set_markup(`<b>${text}</b>`);
        txt.set_wrap(true);
        box.append(txt);
    }
}
