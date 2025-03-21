#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const ROOT_DIR = process.cwd()
const MANIFEST_FILE = join(ROOT_DIR, 'manifest.json')
const SCRIPT_FILENAME = 'script.js'
const VIEW_FILENAME = 'view.xml'
const CUSTOM_SCRIPTS_DIR = join(ROOT_DIR, 'custom-scripts')

const validateStructure = () => {
  if (!existsSync(MANIFEST_FILE)) {
    console.error('Missing manifest.json in the root directory')
    process.exit(1)
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'))

  if (!Array.isArray(manifest)) {
    console.error('manifest.json must be an array')
    process.exit(1)
  }

  if (!existsSync(CUSTOM_SCRIPTS_DIR)) {
    console.error('Missing custom-scripts directory')
    process.exit(1)
  }

  const folders = readdirSync(CUSTOM_SCRIPTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const errors = []

  folders.forEach(folder => {
    const scriptFile = join(CUSTOM_SCRIPTS_DIR, folder, SCRIPT_FILENAME)
    const viewFile = join(CUSTOM_SCRIPTS_DIR, folder, 'view.xml')

    if (!existsSync(scriptFile)) errors.push(`Missing ${SCRIPT_FILENAME} in "${folder}"`)
    if (!existsSync(viewFile)) errors.push(`Missing ${VIEW_FILENAME} in "${folder}"`)

    const manifestEntry = manifest.find((entry) => entry.path === folder)

    if (!manifestEntry) {
      errors.push(`Folder "${folder}" is missing in manifest.json`)
    } else {
      if (!manifestEntry.title || !manifestEntry.description || typeof manifestEntry.private !== 'boolean') {
        errors.push(`Invalid manifest entry for "${folder}". It must have a title, description, private flag, and path.`)
      }
    }
  })

  if (errors.length > 0) {
    errors.forEach(error => console.error(error))
    process.exit(1)
  }

  console.log('Folder structure is correct.')
}

validateStructure()
