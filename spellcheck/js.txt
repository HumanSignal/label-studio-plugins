// Load the spelling check library
await LSI.import('https://cdn.jsdelivr.net/npm/typo-js@1.1.0/typo.js');

// Initialize the dictionary
var dictionary = new Typo("en_US", false, false, { dictionaryPath: "https://cdn.jsdelivr.net/npm/typo-js@1.1.0/dictionaries" })

LSI.on("beforeSaveAnnotation", async (store, ann) => {
  // Find all textareas with misspellings
  let misspelledAreas = ann.results.filter(
    r => r.type === 'textarea' && r.value.text.some(t => {
      let words = t.split(/\s+/);
      return words.some(word => !dictionary.check(word));
    })
  );
  console.log(misspelledAreas)
  if (misspelledAreas.length === 0) return true;

  // Collect all misspelled texts
  let misspelledTexts = misspelledAreas.map(area => {
    let misspelledTextsInArea = area.value.text
      .map(t => {
        const words = t.split(/\s+/);
        const misspelledWords = words.filter(word => !dictionary.check(word));
        if (misspelledWords.length > 0) {
          return `Misspelled words: ${misspelledWords.join(', ')}\n`;
        }
        return null;
      })
      .filter(text => text !== null);

    return misspelledTextsInArea.join('\n');
  }).join('\n\n');

  // Select the first region to see textarea
  if (!misspelledAreas[0].area.classification) ann.selectArea(misspelledAreas[0].area);

  // Show the modal with the misspelled words
  Htx.showModal(`\n\n${misspelledTexts}\n\nPlease correct them before submitting.`, "error");

  return false;
});
