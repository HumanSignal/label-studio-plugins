/**
 * Validates the word count of the entered text to prevent submission if it exceeds a specified threshold
 */

let dismissed = false;

LSI.on("beforeSaveAnnotation", (store, annotation) => {
  const textAreaResult = annotation.results.find(r => r.type === 'textarea' && r.from_name.name === 'textarea');

  if (textAreaResult) {
    words = textAreaResult.value.text[0]
    word_count = words.split(" ").length;

    if (word_count > 10) {
      Htx.showModal("Word count is " + word_count + ". Please reduce to 10 or less.");
      dismissed = true;
      return false; // Block submission
    }
  }

  return true; // Allow submission
});
