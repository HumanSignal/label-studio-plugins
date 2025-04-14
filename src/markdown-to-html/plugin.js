/**
 * Converts the Markdown code given in a specific selector to HTML code.
 */

window.LSI = LSI;

await LSI.import("https://unpkg.com/showdown/dist/showdown.min.js");

const sumBlock = document.querySelector(".lsf-richtext");

if (sumBlock) {
	const converter = new showdown.Converter();
	const html = converter.makeHtml(LSI.task.data.chat_transcript);
	sumBlock.innerHTML = html;
}
