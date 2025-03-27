/**
 * Validates there are no NER text spans overlap before submitting an annotation
 */

LSI.on("beforeSaveAnnotation", (store, annotation) => {
  const existingEntities = Htx.annotationStore.selected.regions;

  const textRegions = existingEntities.filter(r =>
    r.type === 'richtextregion' &&
    typeof r.startOffset === 'number' &&
    typeof r.endOffset === 'number'
  );

  // console.log(textRegions);  // Print the filtered result
  textRegions.sort((a, b) => a.startOffset - b.startOffset);

  let overlaps = [];

  // Check for overlaps
  for (let i = 0; i < textRegions.length - 1; i++) {
    const current = textRegions[i];
    const next = textRegions[i + 1];
    // console.log("This is current: ", current, "This is next: ", next);

    if (current.endOffset > next.startOffset) {
      // Collect overlapping regions
      const currentText = current.text || 'Unknown text';
      const nextText = next.text || 'Unknown text';
      overlaps.push(`"${currentText}" and "${nextText}"`);
    }
  }

  if (overlaps.length > 0) {
    // Show error with all overlapping text pairs
    const errorMessage = `Overlapping annotations are not allowed between the following text pairs: ${overlaps.join(', ')}. Please adjust your annotations to remove overlaps.`;
    Htx.showModal(errorMessage, 'error');
    return false; // Prevent saving the annotation
  }

  return true; // Allow saving the annotation
});
