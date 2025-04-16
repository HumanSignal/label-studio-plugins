/**
 * Automatically creates text regions for all instances of the selected text and deletes existing regions
 * when the shift key is pressed.
 */

// Track the state of the shift key
let isShiftKeyPressed = false;

window.addEventListener("keydown", (e) => {
	if (e.key === "Shift") {
		isShiftKeyPressed = true;
	}
});

window.addEventListener("keyup", (e) => {
	if (e.key === "Shift") {
		isShiftKeyPressed = false;
	}
});

LSI.on("entityDelete", (region) => {
	if (!isShiftKeyPressed) return; // Only proceed if the shift key is pressed

	if (window.BULK_REGIONS) return;
	window.BULK_REGIONS = true;
	setTimeout(() => {
		window.BULK_REGIONS = false;
	}, 1000);

	const existingEntities = Htx.annotationStore.selected.regions;
	const regionsToDelete = existingEntities.filter((entity) => {
		const deletedText = region.text.toLowerCase().replace("\\\\n", " ");
		const otherText = entity.text.toLowerCase().replace("\\\\n", " ");
		return deletedText === otherText && region.labels[0] === entity.labels[0];
	});

	for (const region of regionsToDelete) {
		Htx.annotationStore.selected.deleteRegion(region);
	}

	Htx.annotationStore.selected.updateObjects();
});

LSI.on("entityCreate", (region) => {
	if (!isShiftKeyPressed) return;

	if (window.BULK_REGIONS) return;
	window.BULK_REGIONS = true;
	setTimeout(() => {
		window.BULK_REGIONS = false;
	}, 1000);

	const existingEntities = Htx.annotationStore.selected.regions;

	setTimeout(() => {
		// Prevent tagging a single character
		if (region.text.length < 2) return;
		regexp = new RegExp(
			region.text.replace("\\\\n", "\\\\s+").replace(" ", "\\\\s+"),
			"gi",
		);
		const matches = Array.from(region.object._value.matchAll(regexp));
		for (const match of matches) {
			if (match.index === region.startOffset) continue;

			const startOffset = match.index;
			const endOffset = match.index + region.text.length;

			// Check for existing entities with overlapping start and end offset
			let isDuplicate = false;
			for (const entity of existingEntities) {
				if (
					startOffset <= entity.globalOffsets.end &&
					entity.globalOffsets.start <= endOffset
				) {
					isDuplicate = true;
					break;
				}
			}

			if (!isDuplicate) {
				Htx.annotationStore.selected.createResult(
					{
						text: region.text,
						start: "/span[1]/text()[1]",
						startOffset: startOffset,
						end: "/span[1]/text()[1]",
						endOffset: endOffset,
					},
					{
						labels: [...region.labeling.value.labels],
					},
					region.labeling.from_name,
					region.object,
				);
			}
		}

		Htx.annotationStore.selected.updateObjects();
	}, 100);
});
