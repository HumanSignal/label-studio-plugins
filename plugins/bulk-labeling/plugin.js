/**
 * Automatically creates all the text regions containing all instances of the selected text.
 */

// It will be triggered when a text selection happens
LSI.on('entityCreate', region => {
  if (window.BULK_REGIONS) return;

  window.BULK_REGIONS = true;
  setTimeout(() => window.BULK_REGIONS = false, 1000);

  setTimeout(() => {
    // Find all the text regions matching the selection
    region.object._value.matchAll(new RegExp(region.text, "gi")).forEach(m => {
      if (m.index === region.startOffset) return;

      // Include them in the results as new selections
      Htx.annotationStore.selected.createResult(
        { text: region.text, start: "/span[1]/text()[1]", startOffset: m.index, end: "/span[1]/text()[1]", endOffset: m.index + region.text.length },
        { labels: [...region.labeling.value.labels] },
        region.labeling.from_name,
        region.object,
      )
    })
    Htx.annotationStore.selected.updateObjects()
  }, 100);
});
