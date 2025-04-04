/**
 * Converts the Markdown code given in a specific selector to HTML code.
 */

window.LSI = LSI;

await LSI.import("https://unpkg.com/showdown/dist/showdown.min.js");

let sumBlock = document.querySelector(".lsf-richtext");

if (sumBlock) {
    var converter = new showdown.Converter();
	  var html = converter.makeHtml(LSI.task.data.chat_transcript);
    sumBlock.innerHTML = html;
}
