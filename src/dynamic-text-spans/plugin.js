const TEXTAREA_NAME = "transcription";
const TEXT_NAME = "extraction_text";

const current_annotation = LSI.annotation.id;
(function init() {
  // textarea results have names like "tag_name:h4$h", so we use ^=
  let $ta = document.querySelector(`textarea[name^="${TEXTAREA_NAME}"]`);
  if (!$ta) return setTimeout(init, 300);
  if ($ta._already_loaded) return;

  $ta._already_loaded = true;
  (function tick() {
    // it can be another textarea with submitted result
    if (!$ta?.isConnected) {
      $ta = document.querySelector(`textarea[name^="${TEXTAREA_NAME}"]`);
    }
    // if we lost textarea/moved out of current annotation — break the cycle
    if (!$ta?.isConnected || LSI.annotation?.id !== current_annotation) return;
    setTimeout(tick, 300);

    const textarea = LSI.annotation.names.get(TEXTAREA_NAME);
    const text = LSI.annotation.names.get(TEXT_NAME);

    const val = String($ta.value ?? textarea.result?.value.text ?? "");
    if (text._value !== val) {
      text.setRemoteValue(val);
    }
  })();
})();
