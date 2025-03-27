window.LSI = LSI;

const baseUrl = "MY_URL_ROOT";

/**
 * Makes a request to the configured LLM sending the given prompt
 */
async function fetchLLM(prompt) {
  const params = { prompt, llm_endpoint_name: "chatgpt", redteam_categories: ["cat1"] };

  const searchParams = new URLSearchParams(params).toString();
  const url = `${baseUrl}?${searchParams}`;

  const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No auth needed because the API is currently open
      },
  });

  const data = await response.json();
}

/**
 * Sends the introduced prompt to the LLM endpoint and attahces the given results to the annotation
 */
async function sendPrompt() {
  const promptTag = LSI.annotation.names.get('prompt')
  promptTag.submitChanges();
  const prompt = promptTag.result?.value.text.join("\n");

  if (!prompt) {
    Htx.showModal("The prompt is empty", 'error');
    return false;
  }

  let response

  // console.log("Input prompt:" + prompt);
  try {
    response = await fetchLLM(prompt);
  } catch (error) {
    Htx.showModal(`Error fetching the LLM endpoint "${baseUrl}": ${error.message}`, 'error');
    return false
  }
  const results = [];

  const llmResponse = llmResponse["LLM_response"]
  if (llmResponse) {
    const llmResult = {
      from_name: "response",
      to_name: "placeholder",
      type: "textarea",
      value: { "text": [] },
    }
    results.push(llmResult);
  }
  // console.log("Response:" + llmResponse["LLM_response"]);

  const category = llmResponse["Category"]?.category;
  if (category?.length) {
    const attackResult = {
      from_name: "category",
      to_name: "placeholder",
      type: "choices",
      value: { choices: category },
    }
    results.push(attackResult);
    // console.log("Category:" + category);
  }

  const reasonText = llmResponse["Type"]?.reason;
  if (reasonText) {
    const reasonResult = {
      from_name: "reason",
      to_name: "placeholder",
      type: "textarea",
      value: { "text": [reasonText] },
    }
    results.push(reasonResult);
    // console.log("Reason:" + reason);
  }

  LSI.annotation.deserializeResults(results);
}

/**
 * Sets up the onClick event of the template to trigger the LLM request
 */
function setup() {
  const aBtn = document.querySelector('.analyzeButton');
  const button = document.createElement('button');
  button.textContent = 'Analyze'; // Set the button text

  // Attach an onclick event to the button
  button.onclick = sendPrompt;

  // Insert the button into the div
  aBtn.replaceChildren(button);
}

setup();
