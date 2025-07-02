/**
 * Validate the JSON data introduced in the textarea is valid.
 */

LSI.on("beforeSaveAnnotation", (_store, annotation) => {
  const textAreaResult = annotation.results.find((r) => r.type === "textarea" && r.from_name.name === "textarea");
  if (textAreaResult) {
    try {
      JSON.parse(textAreaResult.value.text[0]);
    } catch (_e) {
      Htx.showModal("Invalid JSON format. Please correct the JSON and try again.", "error");
      return false;
    }
  }
  return true;
});
