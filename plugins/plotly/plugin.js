/**
 * Displays a Plotly line chart from the task data
 */

await LSI.import('https://cdn.plot.ly/plotly-2.26.0.min.js', 'sha384-xuh4dD2xC9BZ4qOrUrLt8psbgevXF2v+K+FrXxV4MlJHnWKgnaKoh74vd/6Ik8uF',);

let data = LSI.task.data;
if (!window.Plotly || !data) {
  Htx.showModal("Plotly data not found in task", "error");
}

try {
  Plotly.newPlot("plot", [data.plotly]);
} catch (error) {
  Htx.showModal(`Error loading Plotly: ${error.message}`, "error");
}
