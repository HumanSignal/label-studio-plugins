/**
 * Detect misspelled words in the template textareas
 */

// Load the spelling check library
await LSI.import('https://cdn.jsdelivr.net/npm/typo-js@1.1.0/typo.js')

// Initialize the dictionary
const dictionary = new Typo('en_US', false, false, { dictionaryPath: 'https://cdn.jsdelivr.net/npm/typo-js@1.1.0/dictionaries' })
const WORD_REGEX = /\w+/g

LSI.on('beforeSaveAnnotation', async (store, annotation) => {
  // Find all textareas with misspellings
  let misspelledAreas = annotation.results.filter(
    r => r.type === 'textarea' && r.value.text.some(t => {
      let words = t.match(WORD_REGEX) || [] // Extract words
      return words.some(word => !dictionary.check(word))
    })
  )

  // If no misspelled textareas, continue with the save process
  if (misspelledAreas.length === 0) return true

  // Collect all misspelled words
  let misspelledWords = [...new Set(misspelledAreas.flatMap(area =>
    area.value.text.flatMap(t =>
      (t.match(WORD_REGEX) || []).filter(word => !dictionary.check(word))
    )
  ))]
  // console.log('words:', misspelledWords) // print misspelled words

  // Select the first region to see textarea
  if (!misspelledAreas[0].area.classification) annotation.selectArea(misspelledAreas[0].area)

  // Show the modal with the misspelled words
  Htx.showModal(`Misspelled words: ${misspelledWords.join(', ')}. Please correct them before submitting.`, 'error')

  // Block the saving process
  return false
})
