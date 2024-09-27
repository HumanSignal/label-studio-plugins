window.LSI = LSI;

const baseUrl = "MY_URL_ROOT";

async function fetchML(prompt) {
  const params = {
    // TODO: Prompt should come from the annotator's input for `prompt` from the labeling 
    "prompt": prompt,
    "llm_endpoint_name": "chatgpt",
    "redteam_categories": ["cat1"]
  };

  const searchParams = new URLSearchParams(params).toString();
  const url = `${baseUrl}?${searchParams}`;
  console.log("URL = ", url);

  const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No auth needed because the API is currently open
      },
  });

  const data = await response.json();
  
}

async function runEval() {
  const promptTag = LSI.annotation.names.get('prompt')
  promptTag.submitChanges();
  const prompt = promptTag.result?.value.text.join("\n");

  if (!prompt) return;

  console.log("Input prompt:" + prompt);
  const llm_res = await fetchML(prompt);
  const results = [];

  const response = {
    from_name: "response",
    to_name: "placeholder",
    type: "textarea",
    value: { "text": [llm_res["LLM_response"]] },
  }
  results.push(response);
  console.log("Response:" + llm_res["LLM_response"]);

  const category = llm_res["Category"]?.category;
  if (category?.length) {
    const attack = {
      from_name: "category",
      to_name: "placeholder",
      type: "choices",
      value: { choices: category },
    }
    results.push(attack);
    console.log("Category:" + category);
  }

  const reasonText = llm_res["Type"]?.reason;
  if (reasonText) {
    const reason = {
      from_name: "reason",
      to_name: "placeholder",
      type: "textarea",
      value: { "text": [reasonText] },
    }
    results.push(reason);
    console.log("Reason:" + reason);
  }

  LSI.annotation.deserializeResults(results);
}

function setup() {
  const aBtn = document.querySelector('.analyzeButton');
  const button = document.createElement('button');
  button.textContent = 'Analyze'; // Set the button text

  // Attach an onclick event to the button
  button.onclick = runEval;

  // Insert the button into the div
  aBtn.replaceChildren(button);
}

setup();