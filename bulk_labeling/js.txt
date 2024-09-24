LSI.on('entityCreate', region => {
  if (window.BULK_REGIONS) return;
  window.BULK_REGIONS = true;
  setTimeout(() => window.BULK_REGIONS = false, 1000);
  console.log('matches', region.object._value.matchAll(region.text));
  setTimeout(() => {
    region.object._value.matchAll(new RegExp(region.text, "gi")).forEach(m => {
      if (m.index === region.startOffset) return;
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
