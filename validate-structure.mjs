#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT_DIR = process.cwd();
const MANIFEST_FILE = join(ROOT_DIR, "manifest.json");
const PLUGIN_FILENAME = "plugin.js";
const VIEW_FILENAME = "view.xml";
const DATA_FILENAME = "data.json";
const PLUGINS_DIR = join(ROOT_DIR, "src");

const validateStructure = () => {
	if (!existsSync(MANIFEST_FILE)) {
		console.error("Missing manifest.json in the root directory");
		process.exit(1);
	}

	const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"));

	if (!Array.isArray(manifest)) {
		console.error("manifest.json must be an array");
		process.exit(1);
	}

	if (!existsSync(PLUGINS_DIR)) {
		console.error("Missing src directory");
		process.exit(1);
	}

	const folders = readdirSync(PLUGINS_DIR, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory())
		.map((dirent) => dirent.name);

	const errors = [];

	folders.forEach((folder) => {
		const pluginFile = join(PLUGINS_DIR, folder, PLUGIN_FILENAME);
		const viewFile = join(PLUGINS_DIR, folder, VIEW_FILENAME);
		const dataFile = join(PLUGINS_DIR, folder, DATA_FILENAME);

		if (!existsSync(pluginFile))
			errors.push(`Missing ${PLUGIN_FILENAME} in "${folder}"`);
		if (!existsSync(viewFile))
			errors.push(`Missing ${VIEW_FILENAME} in "${folder}"`);
		if (!existsSync(dataFile))
			errors.push(`Missing ${DATA_FILENAME} in "${folder}"`);

		const manifestEntry = manifest.find((entry) => entry.path === folder);

		if (!manifestEntry) {
			errors.push(`Folder "${folder}" is missing in manifest.json`);
		} else {
			if (
				!manifestEntry.title ||
				!manifestEntry.description ||
				typeof manifestEntry.private !== "boolean"
			) {
				errors.push(
					`Invalid manifest entry for "${folder}". It must have a title, description, private flag, and path.`,
				);
			}
		}
	});

	if (errors.length > 0) {
		errors.forEach((error) => console.error(error));
		process.exit(1);
	}

	console.log("Folder structure is correct.");
};

validateStructure();
