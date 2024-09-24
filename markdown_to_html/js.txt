window.LSI = LSI;

await LSI.import("https://unpkg.com/showdown/dist/showdown.min.js");

let sumBlock = document.querySelector(".lsf-richtext");
  
if (sumBlock) {
    var converter = new showdown.Converter(),
	html      = converter.makeHtml(LSI.task.data.chat_transcript);
    sumBlock.innerHTML = html;
}
