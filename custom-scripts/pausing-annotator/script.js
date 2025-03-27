/**
 * Defines a set of rules the annotator must follow so good quality can be guaranteed. If the rules are not follow,
 * it will pause the annotator
 */

/**
 * Rules configuration for pausing the annotation
 *
 * `fields` describe per-field rules in a format
 *   <field-name>: [<rule>(<optional params for the rule>)]
 * `global` is for rules applied to the whole annotation
 */
const RULES = {
  fields: {
    comment: [timesInARow(3)],
    sentiment: [tooSimilar()],
  },
  global: [tooFast()],
}

/**
 * Messages for users when they are paused.
 *
 * Each message is a function with the same name as original rule and it receives an object with
 * `items` and `field`.
 */
const MESSAGES = {
  timesInARow: ({ field }) => `Too many similar values for ${field}`,
  tooSimilar: ({ field }) => `Too similar values for ${field}`,
  tooFast: () => `Too fast annotations`,
}


/**
 * All Available rules are below.
 *
 * They recieve params and return function which recieves `items` and optional `field`.
 * If condition is met it returns warning message. If not — returns `false`.
 */

/**
 * Validates if values for the `field` in last `times` items are the same
 */
function timesInARow(times) {
  return (items, field) => {
    if (items.length < times) return false
    const last = String(items.at(-1).values[field])
    return items.slice(-times).every((item) => String(item.values[field]) === last)
      ? MESSAGES.timesInARow({ items, field })
      : false
  };
}

/**
 * Validates if the annotations are too similar (`deviation`) with the given frequency (`max_count`)
 */
function tooSimilar(deviation = 0.1, max_count = 10) {
  return (items, field) => {
    if (items.length < max_count) return false
    const values = items.map((item) => item.values[field])
    const points = values.map((v) => values.indexOf(v))
    return calcDeviation(points) < deviation
      ? MESSAGES.tooSimilar({ items, field })
      : false
  };
}

/**
 * Validates the annotations are less than `times` in the given time window (`minutes`)
 */
function tooFast(minutes = 10, times = 20) {
  return (items) => {
    if (items.length < times) return false
    const last = items.at(-1)
    const first = items.at(-times)
    return last.created_at - first.created_at < minutes * 60
      ? MESSAGES.tooFast({ items })
      : false
  };
}

/**
 * Internal code for calculating the deviation and provide faster accessors
 */
const project = DM.project.id
if (!DM.project) return;

const key = ["__pause_stats", project].join("|")
const fields = Object.keys(RULES.fields)
// { sentiment: ["positive", ...], comment: undefined }
const values = Object.fromEntries(fields.map(
  (field) => [field, DM.project.parsed_label_config[field]?.labels],
))

// simplified version of MSE with normalized x-axis
function calcDeviation(data) {
  const n = data.length;
  // we normalize indices from -n/2 to n/2 so meanX is 0
  const mid = n / 2;
  const mean = data.reduce((a, b) => a + b) / n;

  const k = data.reduce((a, b, i) => a + (b - mean) * (i - mid), 0) / data.reduce((a, b, i) => a + (i - mid) ** 2, 0);
  const mse = data.reduce((a, b, i) => a + (b - (k * (i - mid) + mean)) ** 2, 0) / n;

  return Math.abs(mse);
}

// When triggering the submission of the annotation, it will check the annotators are following the predefined `RULES`
// and they will be paused otherwise
LSI.on("submitAnnotation", async (_store, annotation) => {
  const results = annotation.serializeAnnotation()
  // { sentiment: "positive", comment: "good" }
  const values = {}
  fields.forEach((field) => {
    const value = results.find((r) => r.from_name === field)?.value
    if (!value) return;
    if (value.choices) values[field] = value.choices.join("|")
    else if (value.text) values[field] = value.text
  })
  let stats = []
  try {
    stats = JSON.parse(localStorage.getItem(key)) ?? []
  } catch(e) {}
  stats.push({ values, created_at: Date.now() / 1000 })

  for (const rule of RULES.global) {
    const result = rule(stats)
    if (result) {
      localStorage.setItem(key, "[]");
      pause(result);
      return;
    }
  }

  for (const field of fields) {
    if (!values[field]) continue;
    for (const rule of RULES.fields[field]) {
      const result = rule(stats, field)

      if (result) {
        localStorage.setItem(key, "[]");

        try {
          await pause(result);
        } catch (error) {
          Htx.showModal(error.message, 'error');
        } finally {
          return false;
        }
      }
    }
  }

  localStorage.setItem(key, JSON.stringify(stats));
});

/**
 * Sends a request to the API to pause an annotator
 */
async function pause(verbose_reason) {
  const body = {
    reason: "CUSTOM_SCRIPT",
    verbose_reason,
  }
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
  const response = await fetch(`/api/projects/${project}/members/${Htx.user.id}/pauses`, options)
  if (!response.ok) {
    throw new Error(`Error pausing the annotator: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
