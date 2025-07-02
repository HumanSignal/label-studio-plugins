/**
 * Simple content moderation plugin that prevents saving annotations containing hate speech
 *
 * This plugin monitors text entered into TextArea regions and checks for the word "hate"
 * before allowing the annotation to be saved. If found, it shows an error message and
 * prevents submission. This would happen only once, if user clicks Submit again it would
 * work with no errors.
 *
 * The plugin uses Label Studio's beforeSaveAnnotation event which is triggered before
 * an annotation is saved. Returning false from this event handler prevents the save
 * operation from completing.
 */

let dismissed = false;

LSI.on("beforeSaveAnnotation", (_store, ann) => {
  // text in TextArea is always an array
  const obscene = ann.results.find((r) => r.type === "textarea" && r.value.text.some((t) => t.includes("hate")));
  if (!obscene || dismissed) return true;

  // select region to see textarea
  if (!obscene.area.classification) ann.selectArea(obscene.area);

  Htx.showModal("The word 'hate' is disallowed", "error");
  dismissed = true;

  return false;
});
