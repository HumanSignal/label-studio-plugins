![Label Studio Plugins](docs/banner.png)

# Label Studio Plugins

Welcome to **Label Studio Plugins**! This repository contains `plugins` designed to extend the functionality of
[Label Studio](https://labelstud.io), a powerful data labeling tool. These plugins can be used to automate workflows,
integrate with external tools, and customize the labeling process according to your needs.

Whether you're building custom data processors, integrations, or UI components, you'll find the necessary resources and
examples in this repo to get started.

> **Note**: Plugins are an `Enterprise` feature and require a [Label Studio Enterprise](https://humansignal.com/pricing/) subscription to use.

## Official Documentation

For detailed documentation and guides on how to use and extend Label Studio with plugins, visit the official
[Label Studio Plugins Documentation](https://docs.humansignal.com/guide/plugins).

## File Structure

This repository follows a clear folder structure to organize the various plugins and configuration files:

```bash
label-studio-plugins/
├── src/
│   ├── plugin1/
│   │   ├── data.{json|mp3|mp4}
│   │   ├── plugin.js
│   │   └── view.xml
│   ├── plugin2/
│   │   ├── data.{json|mp3|mp4}
│   │   ├── plugin.js
│   │   └── view.xml
│   └── ...
└── manifest.json
```

- **`/plugin1`**: Contains all the files to document a plugin.
  - Each plugin has `plugin.js`, `view.xml`, and `data.json` files that define the logic, UI, and data of the plugin.
- **`/plugin.js`**: Contains the actual `javascript` plugin file that can be embedded in the Label Studio code editor.
- **`/view.xml`**: Stores an example of a `<View>` that will work along the plugin.
- **`/data.{json|mp3|mp4}`**: Stores an example of the data that can be used along with the plugin.
- **`manifest.json`**: This file lists the plugins, their metadata (title, description, etc.), and their paths for easy integration with Label Studio.

## Usage

After your plugin gets merged you will be able to find it in your project's **Labeling Interface**

![Labeling Interface](docs/labeling-interface.png)

## Contributing

We welcome contributions! Whether it's bug fixes or new plugins, feel free to open a pull request. Here's how you can get started:

1. **Create a new branch** for your feature or bugfix.
2. **Make your changes** and ensure that they adhere to the project's file structure and guidelines. You need to create a folder with the name using underscores (`path`) of your plugin and add a `view.xml` and a `plugin.js` file minimum.
3. **Register the plugin** in the `manifest.json` adding the following information:
   ```json
   [
      {
        "title": "Your plugin title",
        "description": "Your plugin description",
        "path": "exact-name-of-the-plugin-folder", // `plugin1` as per the File Structure example
        "private": false // whether you want to hide it in the "Insert Plugin" dropdown in the Configurator code tab
      }
   ]
   ```
4. **Test your changes** to ensure everything works as expected.
5. **Submit a pull request** explaining the changes you made.

Please make sure that your contributions follow the existing code style and structure.

## License

This software is licensed under the [Apache 2.0 LICENSE](/LICENSE) © [Heartex](https://www.heartex.com/). 2020-2025

---

If you have any questions or need assistance, feel free to reach out through issues or discussions. We look forward to your contributions!
