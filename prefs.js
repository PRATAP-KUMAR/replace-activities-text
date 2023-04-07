const {Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

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
        this.vbox.set_size_request(60, 60);

        this.addBoldTextToBox('Change Activities Text with Logo and Your Preferred Text', this.vbox);
        this.vbox.append(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));
        this.vbox.append(this.addPictureUrl());
        this.vbox.append(this.addTextUrl());
        this.vbox.append(this.adjustLogo());
        this.vbox.append(this.rightClick());
        this.vbox.append(new Gtk.Separator({orientation: Gtk.Orientation.HORIZONTAL, margin_bottom: 5, margin_top: 5}));
        this.vbox.append(this.tip());

        this.widget.append(this.vbox);
    }

    addPictureUrl() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5, hexpand: true});
        let settingLabel = new Gtk.Label({label: 'Logo', xalign: 0, hexpand: true});
        this.setting_entry = new Gtk.Entry({margin_start: 5});
        this.setting_entry.set_width_chars(60);
        this.setting_entry.set_placeholder_text('enter /path/to/the/logo or click Browse button to choose logo');

        this.resetButton = new Gtk.Button({margin_start: 5});
        this.resetButton.set_label("Reset to Extensions's Default Icon");
        this.resetButton.connect('clicked', () => {
            this._settings.set_string('icon-path', '/usr/share/icons/Adwaita/symbolic/emotes/face-smile-big-symbolic.svg');
            this.setting_entry.set_text(this._settings.get_string('icon-path'));
        });

        this.noPicButton = new Gtk.Button({margin_start: 5});
        this.noPicButton.set_label('No Logo');
        this.noPicButton.connect('clicked', () => {
            this._settings.set_string('icon-path', '');
            this.setting_entry.set_text(this._settings.get_string('icon-path'));
        });

        this.setting_entry.set_text(this._settings.get_string('icon-path'));
        this.setting_entry.connect('changed', entry => {
            this._settings.set_string('icon-path', entry.get_text());
        });

        this.fileChooseButton = new Gtk.Button({margin_start: 5});
        this.fileChooseButton.set_label('Browse');
        this.fileChooseButton.connect('clicked', this.showFileChooserDialog.bind(this));

        hbox.append(settingLabel);
        hbox.append(this.setting_entry);
        hbox.append(this.fileChooseButton);
        hbox.append(this.resetButton);
        hbox.append(this.noPicButton);

        return hbox;
    }

    addTextUrl() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let settingL = new Gtk.Label({label: 'Text', xalign: 0, hexpand: true});
        this.setting_e = new Gtk.Entry({margin_start: 5});
        this.setting_e.set_width_chars(60);
        this.setting_e.set_placeholder_text('type your preferred text or leave it blank for no text.');

        this.resetTextButton = new Gtk.Button({margin_start: 5});
        this.resetTextButton.set_label("Reset to Extensions's Default Text");
        this.resetTextButton.connect('clicked', () => {
            this._settings.set_string('text', 'default');
            this.setting_e.set_text(this._settings.get_string('text'));
        });

        this.noTextButton = new Gtk.Button({margin_start: 5});
        this.noTextButton.set_label('No Text');
        this.noTextButton.connect('clicked', () => {
            this._settings.set_string('text', '');
            this.setting_e.set_text(this._settings.get_string('text'));
        });

        this.setting_e.set_text(this._settings.get_string('text'));
        this.setting_e.connect('changed', entry => {
            this._settings.set_string('text', entry.get_text());
        });

        hbox.append(settingL);
        hbox.append(this.setting_e);
        hbox.append(this.resetTextButton);
        hbox.append(this.noTextButton);

        return hbox;
    }

    adjustLogo() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let logoLabel = new Gtk.Label({label: 'Adjust Icon Size', xalign: 0, hexpand: true});

        this.logo_adjustment = new Gtk.Adjustment({
            upper: 2,
            'step-increment': 0.1,
            'page-increment': 0.1,
            lower: 1,
        });

        this.logo_entry = new Gtk.Scale({
            hexpand: true,
            margin_start: 20,
            visible: true,
            'can-focus': true,
            digits: 1,
            adjustment: this.logo_adjustment,
        });

        this.resetIconButton = new Gtk.Button({margin_start: 5});
        this.resetIconButton.set_label("Reset to Extensions's Default Size");
        this.resetIconButton.connect('clicked', () => {
            this._settings.set_double('icon-size', 1.5);
            this.logo_entry.set_value(this._settings.get_double('icon-size'));
        });

        this.logo_entry.set_value(this._settings.get_double('icon-size'));
        this.logo_entry.connect('value-changed', entry => {
            this._settings.set_double('icon-size', entry.get_value());
        });

        hbox.append(logoLabel);
        hbox.append(this.logo_entry);
        hbox.append(this.resetIconButton);

        return hbox;
    }

    rightClick() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let rightClickLabel = new Gtk.Label({label: "Right Click on 'Activities' Area Opens Extension Prefs", xalign: 0, hexpand: true});
        this.rightClick_switch = new Gtk.Switch({active: this._settings.get_boolean('right-click')});
        this.rightClick_switch.connect('notify::active', button => {
            this._settings.set_boolean('right-click', button.active);
        });

        hbox.append(rightClickLabel);
        hbox.append(this.rightClick_switch);
        return hbox;
    }

    tip() {
        let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin_top: 5});
        let tipLabel = new Gtk.Label({label: 'Note: Use Icon of Square Shape for Setting the Logo', xalign: 0, hexpand: true});

        hbox.append(tipLabel);
        return hbox;
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
                    this.setting_entry.set_text(file);
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
